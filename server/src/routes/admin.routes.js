const express = require('express');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  getDashboard,
  createDoctor,
  getDoctors,
  updateDoctor,
  getUsers,
  deleteUser,
  getPatients,
  searchPatients,
  getAppointmentHistory,
  getQueries,
  markQueryRead,
  getSessionLogs,
  getReports,
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(verifyToken, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);

router.get('/doctors', getDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/patients', getPatients);
router.get('/patients/search', searchPatients);

router.get('/appointments', getAppointmentHistory);

router.get('/queries', getQueries);
router.put('/queries/:id/read', markQueryRead);

router.get('/session-logs', getSessionLogs);

router.get('/reports', getReports);

module.exports = router;
