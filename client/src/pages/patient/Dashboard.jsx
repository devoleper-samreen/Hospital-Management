import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CalendarPlus, ClipboardList, Stethoscope } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      axiosClient.get('/patient/dashboard'),
      axiosClient.get('/patient/appointments'),
    ])
      .then(([dashRes, apptRes]) => {
        setData(dashRes.data);
        setAppointments(apptRes.data.appointments);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data || !appointments) return <p>Loading...</p>;

  const upcoming = appointments
    .filter((a) => ['pending', 'approved'].includes(a.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's a quick look at your health activity.</p>
        </div>
        <Link to="/patient/book-appointment">
          <button>
            <CalendarPlus size={16} />
            Book Appointment
          </button>
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-icon">
            <CalendarClock size={20} />
          </span>
          <div>
            <h3>{data.upcomingCount}</h3>
            <p>Upcoming Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <ClipboardList size={20} />
          </span>
          <div>
            <h3>{appointments.length}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
      </div>

      <div className="table-card" style={{ padding: '20px 20px 6px' }}>
        <h3>Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="Nothing scheduled"
            message="You don't have any upcoming appointments. Book one whenever you're ready."
          />
        ) : (
          <table style={{ marginTop: '10px' }}>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((a) => (
                <tr key={a._id}>
                  <td>{a.doctor?.userId?.name}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.time}</td>
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
