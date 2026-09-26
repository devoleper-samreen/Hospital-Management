import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  specialization: '',
  department: '',
  qualification: '',
  availability: '',
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadDoctors() {
    const { data } = await axiosClient.get('/admin/doctors');
    setDoctors(data.doctors);
  }

  useEffect(() => {
    loadDoctors().catch((err) => setError(err.response?.data?.message || 'Failed to load doctors'));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axiosClient.post('/admin/doctors', form);
      setForm(emptyForm);
      setMessage('Doctor added successfully.');
      loadDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor');
    }
  }

  async function toggleActive(doctor) {
    await axiosClient.put(`/admin/doctors/${doctor._id}`, { isActive: !doctor.userId.isActive });
    loadDoctors();
  }

  return (
    <div>
      <h2>Manage Doctors</h2>

      <div className="card">
        <h3>Add Doctor</h3>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
        <form onSubmit={handleAdd} className="grid-form">
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Specialization" required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input placeholder="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          <input placeholder="Availability (e.g. Mon-Fri 9am-5pm)" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
          <button type="submit">Add Doctor</button>
        </form>
      </div>

      <div className="card">
        <h3>All Doctors</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => (
              <tr key={doc._id}>
                <td>{doc.userId?.name}</td>
                <td>{doc.userId?.email}</td>
                <td>{doc.specialization}</td>
                <td>{doc.department}</td>
                <td>{doc.userId?.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button onClick={() => toggleActive(doc)}>
                    {doc.userId?.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
