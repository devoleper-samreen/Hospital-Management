import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function DoctorAppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  async function loadAppointments() {
    const { data } = await axiosClient.get('/doctor/appointments');
    setAppointments(data.appointments);
  }

  useEffect(() => {
    loadAppointments().catch((err) => setError(err.response?.data?.message || 'Failed to load appointments'));
  }, []);

  async function updateStatus(id, status) {
    await axiosClient.put(`/doctor/appointments/${id}`, { status });
    loadAppointments();
  }

  return (
    <div>
      <h2>Appointment History</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a._id}>
              <td>{a.patient?.userId?.name}</td>
              <td>{new Date(a.date).toLocaleDateString()}</td>
              <td>{a.time}</td>
              <td>{a.reason}</td>
              <td>{a.status}</td>
              <td>
                {a.status === 'pending' && (
                  <button onClick={() => updateStatus(a._id, 'approved')}>Approve</button>
                )}
                {a.status === 'approved' && (
                  <button onClick={() => updateStatus(a._id, 'completed')}>Complete</button>
                )}
                {['pending', 'approved'].includes(a.status) && (
                  <button onClick={() => updateStatus(a._id, 'cancelled')}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
