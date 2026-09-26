import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export default function PatientAppointmentHistory() {
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/patient/appointments')
      .then(({ data }) => setAppointments(data.appointments))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load appointments'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Appointment History</h2>
          <p>All your past and upcoming appointments in one place.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="table-card">
        {appointments === null ? (
          <p style={{ padding: 20 }}>Loading...</p>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No appointments yet"
            message="Once you book an appointment, it will show up here."
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.doctor?.userId?.name}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.time}</td>
                  <td>{a.reason || '-'}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
