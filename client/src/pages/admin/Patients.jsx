import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/admin/patients')
      .then(({ data }) => setPatients(data.patients))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load patients'));
  }, []);

  return (
    <div>
      <h2>All Patients</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Consulting Doctor</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td>{p.userId?.name}</td>
              <td>{p.userId?.email}</td>
              <td>{p.userId?.phone}</td>
              <td>{p.consultingDoctor?.specialization || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
