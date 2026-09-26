import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminAppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/admin/appointments')
      .then(({ data }) => setAppointments(data.appointments))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load appointments'));
  }, []);

  return (
    <div>
      <h2>Appointment History</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{a.patient?.userId?.name}</td>
              <td>{a.doctor?.userId?.name}</td>
              <td>{new Date(a.date).toLocaleDateString()}</td>
              <td>{a.time}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
