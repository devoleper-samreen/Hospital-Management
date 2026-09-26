// API functional test suite for the Hospital Management System.
// Usage (use an empty TEST database, never the real one):
//   1. Start MongoDB and set MONGO_URI in server/.env to a test database, e.g. .../hms_test
//   2. cd server && npm run seed && npm run dev
//   3. node tests/api-test.mjs            (override the server address with API=http://localhost:5000/api)
// The script creates its own users with unique e-mails, so it can be run repeatedly.

const BASE = process.env.API || 'http://localhost:5000/api';
const results = [];
let seq = 0;

async function call(method, path, { token, body } = {}) {
  const t0 = performance.now();
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ms = Math.round(performance.now() - t0);
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data, ms };
}

function record(module, description, input, expected, ok, actual, ms) {
  seq += 1;
  results.push({ id: `TC${String(seq).padStart(2, '0')}`, module, description, input, expected, actual, status: ok ? 'Pass' : 'FAIL', ms });
  console.log(`${ok ? 'PASS' : 'FAIL'}  TC${String(seq).padStart(2, '0')}  ${description}  -> ${actual}`);
}

async function check(module, description, input, expected, req, predicate) {
  const r = await req();
  const ok = predicate(r);
  record(module, description, input, expected, ok, `HTTP ${r.status}${r.data?.message ? ' - ' + r.data.message : ''}`, r.ms);
  return r;
}

const stamp = Date.now();
const patientEmail = `patient${stamp}@test.com`;
const doctorEmail = `doctor${stamp}@test.com`;

// ---------- Authentication ----------
await check('Authentication', 'Register new patient', 'name, email, password, phone', '201 + JWT token',
  () => call('POST', '/auth/register', { body: { name: 'Test Patient', email: patientEmail, password: 'Pass@123', phone: '9000000001' } }),
  (r) => r.status === 201 && !!r.data.token);
await check('Authentication', 'Register with duplicate email', 'same email again', '409 Email already registered',
  () => call('POST', '/auth/register', { body: { name: 'Dup', email: patientEmail, password: 'Pass@123' } }),
  (r) => r.status === 409);
await check('Authentication', 'Register with missing fields', 'name only', '400 validation error',
  () => call('POST', '/auth/register', { body: { name: 'NoEmail' } }),
  (r) => r.status === 400);
const adminLogin = await check('Authentication', 'Admin login with valid credentials', 'admin@hospital.com / Admin@123', '200 + token + sessionId',
  () => call('POST', '/auth/login', { body: { email: 'admin@hospital.com', password: 'Admin@123' } }),
  (r) => r.status === 200 && !!r.data.token && !!r.data.sessionId);
const adminToken = adminLogin.data?.token;
await check('Authentication', 'Login with wrong password', 'valid email, wrong password', '401 Invalid email or password',
  () => call('POST', '/auth/login', { body: { email: 'admin@hospital.com', password: 'wrong' } }),
  (r) => r.status === 401);
await check('Authentication', 'Login with unregistered email', 'unknown@nowhere.com', '401 Invalid email or password',
  () => call('POST', '/auth/login', { body: { email: 'unknown@nowhere.com', password: 'x123456' } }),
  (r) => r.status === 401);
await check('Authentication', 'Login email is case/space insensitive', '"  Admin@Hospital.com  "', '200 login success',
  () => call('POST', '/auth/login', { body: { email: '  Admin@Hospital.com  ', password: 'Admin@123' } }),
  (r) => r.status === 200);
await check('Authorization', 'Protected route without token', 'GET /admin/dashboard, no header', '401 No token provided',
  () => call('GET', '/admin/dashboard'),
  (r) => r.status === 401);
await check('Authorization', 'Invalid JWT token', 'Bearer garbage', '401 Invalid or expired token',
  () => call('GET', '/admin/dashboard', { token: 'garbage.token.value' }),
  (r) => r.status === 401);

const patLogin = await call('POST', '/auth/login', { body: { email: patientEmail, password: 'Pass@123' } });
const patToken = patLogin.data?.token;
await check('Authorization', 'Patient token on admin route', 'patient JWT -> GET /admin/dashboard', '403 Access denied',
  () => call('GET', '/admin/dashboard', { token: patToken }),
  (r) => r.status === 403);
await check('Authorization', 'Patient token on doctor route', 'patient JWT -> GET /doctor/dashboard', '403 Access denied',
  () => call('GET', '/doctor/dashboard', { token: patToken }),
  (r) => r.status === 403);

// ---------- Admin: doctors ----------
const docCreate = await check('Admin', 'Add doctor (no password hash in response)', 'name, email, password, specialization, ...', '201 and response has no password field',
  () => call('POST', '/admin/doctors', { token: adminToken, body: { name: 'Dr. Test Doctor', email: doctorEmail, password: 'Doctor@123', phone: '9000000002', specialization: 'Cardiologist', department: 'Cardiology', qualification: 'MBBS, MD', availability: 'Mon-Fri 10am-5pm' } }),
  (r) => r.status === 201 && !JSON.stringify(r.data).includes('$2a$'));
const doctorProfileId = docCreate.data?.doctor?._id;
await check('Admin', 'Add doctor with duplicate email', 'existing doctor email', '409 Email already registered',
  () => call('POST', '/admin/doctors', { token: adminToken, body: { name: 'Dup Doc', email: doctorEmail, password: 'Doctor@123', specialization: 'ENT' } }),
  (r) => r.status === 409);
await check('Admin', 'Add doctor with missing specialization', 'no specialization', '400 validation error',
  () => call('POST', '/admin/doctors', { token: adminToken, body: { name: 'X', email: `x${stamp}@t.com`, password: 'Doctor@123' } }),
  (r) => r.status === 400);
await check('Admin', 'List doctors', 'GET /admin/doctors', '200 list contains new doctor',
  () => call('GET', '/admin/doctors', { token: adminToken }),
  (r) => r.status === 200 && r.data.doctors.some((d) => d._id === doctorProfileId));

// ---------- Patient: appointments ----------
const doctorsForPatient = await check('Patient', 'List doctors for booking', 'GET /patient/doctors', '200 list of doctors',
  () => call('GET', '/patient/doctors', { token: patToken }),
  (r) => r.status === 200 && r.data.doctors.length > 0);
const bookDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
const booked = await check('Patient', 'Book appointment', 'doctorId, date, time, reason', '201 status = pending',
  () => call('POST', '/patient/appointments', { token: patToken, body: { doctorId: doctorProfileId, date: bookDate, time: '11:30', reason: 'Chest pain check-up' } }),
  (r) => r.status === 201 && r.data.appointment.status === 'pending');
const apptId = booked.data?.appointment?._id;
await check('Patient', 'Book appointment with missing fields', 'no date/time', '400 validation error',
  () => call('POST', '/patient/appointments', { token: patToken, body: { doctorId: doctorProfileId } }),
  (r) => r.status === 400);
await check('Patient', 'Book appointment with invalid doctor id', 'doctorId = "abc"', '4xx client error (not 500)',
  () => call('POST', '/patient/appointments', { token: patToken, body: { doctorId: 'abc', date: bookDate, time: '10:00' } }),
  (r) => r.status >= 400 && r.status < 500);
await check('Patient', 'Appointment history', 'GET /patient/appointments', '200 contains booked appointment',
  () => call('GET', '/patient/appointments', { token: patToken }),
  (r) => r.status === 200 && r.data.appointments.some((a) => a._id === apptId));
await check('Patient', 'Dashboard summary', 'GET /patient/dashboard', '200 upcomingCount >= 1',
  () => call('GET', '/patient/dashboard', { token: patToken }),
  (r) => r.status === 200 && r.data.upcomingCount >= 1);

// ---------- Doctor ----------
const docLogin = await check('Authentication', 'Doctor login', 'doctor credentials', '200 role = doctor',
  () => call('POST', '/auth/login', { body: { email: doctorEmail, password: 'Doctor@123' } }),
  (r) => r.status === 200 && r.data.user.role === 'doctor');
const docToken = docLogin.data?.token;
await check('Doctor', 'Dashboard summary', 'GET /doctor/dashboard', '200 pendingCount >= 1',
  () => call('GET', '/doctor/dashboard', { token: docToken }),
  (r) => r.status === 200 && r.data.pendingCount >= 1);
await check('Doctor', 'View own appointments', 'GET /doctor/appointments', '200 contains booked appointment',
  () => call('GET', '/doctor/appointments', { token: docToken }),
  (r) => r.status === 200 && r.data.appointments.some((a) => a._id === apptId));
await check('Doctor', 'Approve appointment', 'status = approved', '200 status approved',
  () => call('PUT', `/doctor/appointments/${apptId}`, { token: docToken, body: { status: 'approved' } }),
  (r) => r.status === 200 && r.data.appointment.status === 'approved');
await check('Doctor', 'Complete appointment with notes', 'status = completed + notes', '200 status completed',
  () => call('PUT', `/doctor/appointments/${apptId}`, { token: docToken, body: { status: 'completed', notes: 'ECG normal' } }),
  (r) => r.status === 200 && r.data.appointment.status === 'completed');
const doctorPatients = await check('Doctor', 'My patients list includes patient with appointment', 'GET /doctor/patients', '200 contains the patient',
  () => call('GET', '/doctor/patients', { token: docToken }),
  (r) => r.status === 200 && r.data.patients.length >= 1);
const patientRecordId = doctorPatients.data?.patients?.[0]?._id;
await check('Doctor', 'Add medical note to patient record', 'note text', '200 note saved in medicalHistory',
  () => call('PUT', `/doctor/patients/${patientRecordId}`, { token: docToken, body: { note: 'Prescribed Atorvastatin 10mg' } }),
  (r) => r.status === 200 && r.data.patient.medicalHistory.length === 1);
await check('Doctor', 'Search patient by name', 'q = "Test Patient"', '200 patient found',
  () => call('GET', '/doctor/patients/search?q=Test%20Patient', { token: docToken }),
  (r) => r.status === 200 && r.data.patients.length >= 1);
await check('Patient', 'Medical history shows doctor note', 'GET /patient/medical-history', '200 contains note',
  () => call('GET', '/patient/medical-history', { token: patToken }),
  (r) => r.status === 200 && r.data.medicalHistory.some((m) => m.note.includes('Atorvastatin')));

// ---------- Admin: other modules ----------
await check('Admin', 'Dashboard statistics', 'GET /admin/dashboard', '200 counts present',
  () => call('GET', '/admin/dashboard', { token: adminToken }),
  (r) => r.status === 200 && r.data.patientCount >= 1 && r.data.doctorCount >= 1 && r.data.appointmentCount >= 1);
await check('Admin', 'Appointment history', 'GET /admin/appointments', '200 contains appointment',
  () => call('GET', '/admin/appointments', { token: adminToken }),
  (r) => r.status === 200 && r.data.appointments.some((a) => a._id === apptId));
await check('Admin', 'View registered users', 'GET /admin/users', '200 contains patient',
  () => call('GET', '/admin/users', { token: adminToken }),
  (r) => r.status === 200 && r.data.users.some((u) => u.email === patientEmail));
await check('Admin', 'View patients', 'GET /admin/patients', '200 list',
  () => call('GET', '/admin/patients', { token: adminToken }),
  (r) => r.status === 200 && r.data.patients.length >= 1);
await check('Admin', 'Patient search by name', 'q = "Test Pat"', '200 patient found',
  () => call('GET', '/admin/patients/search?q=Test%20Pat', { token: adminToken }),
  (r) => r.status === 200 && r.data.patients.length >= 1);
await check('Admin', 'Patient search by mobile number', 'q = "9000000001"', '200 patient found',
  () => call('GET', '/admin/patients/search?q=9000000001', { token: adminToken }),
  (r) => r.status === 200 && r.data.patients.length >= 1);
const from = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const to = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
await check('Admin', 'Report for a date range', `from ${from} to ${to}`, '200 count >= 1',
  () => call('GET', `/admin/reports?from=${from}&to=${to}`, { token: adminToken }),
  (r) => r.status === 200 && r.data.count >= 1);
const q = await check('Contact Us', 'Submit contact query (public, no login)', 'name, email, message', '201 query stored',
  () => call('POST', '/contact', { body: { name: 'Visitor', email: 'visitor@test.com', message: 'What are the OPD timings?' } }),
  (r) => r.status === 201);
await check('Contact Us', 'Contact query with missing message', 'no message', '400 validation error',
  () => call('POST', '/contact', { body: { name: 'V', email: 'v@test.com' } }),
  (r) => r.status === 400);
await check('Admin', 'View contact queries', 'GET /admin/queries', '200 contains query with status new',
  () => call('GET', '/admin/queries', { token: adminToken }),
  (r) => r.status === 200 && r.data.queries.some((x) => x._id === q.data?.query?._id && x.status === 'new'));
await check('Admin', 'Mark query as read', 'PUT /admin/queries/:id/read', '200 status read',
  () => call('PUT', `/admin/queries/${q.data?.query?._id}/read`, { token: adminToken }),
  (r) => r.status === 200 && r.data.query.status === 'read');

// ---------- Account management ----------
await check('Account', 'Change password with wrong current password', 'currentPassword wrong', '401 Current password is incorrect',
  () => call('PUT', '/auth/change-password', { token: patToken, body: { currentPassword: 'nope', newPassword: 'New@1234' } }),
  (r) => r.status === 401);
await check('Account', 'Change password with correct current password', 'valid current + new password', '200 password updated',
  () => call('PUT', '/auth/change-password', { token: patToken, body: { currentPassword: 'Pass@123', newPassword: 'New@1234' } }),
  (r) => r.status === 200);
await check('Account', 'Login with the new password', 'new password', '200 login success',
  () => call('POST', '/auth/login', { body: { email: patientEmail, password: 'New@1234' } }),
  (r) => r.status === 200);
await check('Account', 'Update profile', 'name, phone', '200 updated user',
  () => call('PUT', '/auth/profile', { token: patToken, body: { name: 'Test Patient Updated', phone: '9111111111' } }),
  (r) => r.status === 200 && r.data.user.name === 'Test Patient Updated');
const fp = await check('Account', 'Forgot password generates reset token', 'registered email', '200 + reset token',
  () => call('POST', '/auth/forgot-password', { body: { email: patientEmail } }),
  (r) => r.status === 200 && !!r.data.resetToken);
await check('Account', 'Forgot password for unknown email', 'unregistered email', '404 No account found',
  () => call('POST', '/auth/forgot-password', { body: { email: 'ghost@nowhere.com' } }),
  (r) => r.status === 404);
await check('Account', 'Reset password with valid token', 'token + new password', '200 password reset',
  () => call('POST', '/auth/reset-password', { body: { token: fp.data.resetToken, password: 'Reset@1234' } }),
  (r) => r.status === 200);
await check('Account', 'Reset token cannot be reused', 'same token again', '400 Token invalid or expired',
  () => call('POST', '/auth/reset-password', { body: { token: fp.data.resetToken, password: 'Again@1234' } }),
  (r) => r.status === 400);
await check('Account', 'Login after password reset', 'reset password', '200 login success',
  () => call('POST', '/auth/login', { body: { email: patientEmail, password: 'Reset@1234' } }),
  (r) => r.status === 200);

// ---------- Session logs & doctor management ----------
const docLogout = await call('POST', '/auth/logout', { token: docToken, body: { sessionId: docLogin.data.sessionId } });
await check('Admin', 'Logout records logout time', 'POST /auth/logout', '200 Logged out',
  () => Promise.resolve(docLogout),
  (r) => r.status === 200);
await check('Admin', 'Doctor session logs (login/logout times)', 'GET /admin/session-logs?role=doctor', '200 log has logoutAt',
  () => call('GET', '/admin/session-logs?role=doctor', { token: adminToken }),
  (r) => r.status === 200 && r.data.logs.some((l) => l.logoutAt));
await check('Admin', 'User session logs', 'GET /admin/session-logs?role=patient', '200 patient logs present',
  () => call('GET', '/admin/session-logs?role=patient', { token: adminToken }),
  (r) => r.status === 200 && r.data.logs.length >= 1);
await check('Admin', 'Deactivate doctor', 'PUT /admin/doctors/:id isActive=false', '200 deactivated',
  () => call('PUT', `/admin/doctors/${doctorProfileId}`, { token: adminToken, body: { isActive: false } }),
  (r) => r.status === 200 && r.data.doctor.userId.isActive === false);
await check('Authentication', 'Deactivated doctor cannot login', 'doctor credentials', '403 account deactivated',
  () => call('POST', '/auth/login', { body: { email: doctorEmail, password: 'Doctor@123' } }),
  (r) => r.status === 403);
await check('Admin', 'Delete patient user', 'DELETE /admin/users/:id', '200 user removed',
  async () => {
    const users = await call('GET', '/admin/users', { token: adminToken });
    const u = users.data.users.find((x) => x.email === patientEmail);
    return call('DELETE', `/admin/users/${u._id}`, { token: adminToken });
  },
  (r) => r.status === 200);
await check('Authentication', 'Deleted user cannot login', 'deleted patient credentials', '401 Invalid email or password',
  () => call('POST', '/auth/login', { body: { email: patientEmail, password: 'Reset@1234' } }),
  (r) => r.status === 401);

const pass = results.filter((r) => r.status === 'Pass').length;
console.log(`\nSUMMARY: ${pass}/${results.length} passed`);
const avg = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
const max = Math.max(...results.map((r) => r.ms));
console.log(`Average response: ${avg} ms, max ${max} ms`);
if (pass !== results.length) process.exitCode = 1;
