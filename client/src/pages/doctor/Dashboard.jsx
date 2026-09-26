import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ClipboardList, Stethoscope } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      axiosClient.get('/doctor/dashboard'),
      axiosClient.get('/doctor/appointments'),
    ])
      .then(([dashRes, apptRes]) => {
        setData(dashRes.data);
        setAppointments(apptRes.data.appointments);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data || !appointments) return <p>Loading...</p>;

  const todayStr = new Date().toDateString();
  const todaysAppointments = appointments
    .filter((a) => new Date(a.date).toDateString() === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome, Dr. {user?.name?.split(' ')[0]} 👋</h2>
          <p>
            <span className="role-pill" style={{ marginTop: 0 }}>
              {data.doctor.specialization}
            </span>
          </p>
        </div>
        <Link to="/doctor/appointments">
          <button>
            <ClipboardList size={16} />
            View All Appointments
          </button>
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-icon">
            <CalendarClock size={20} />
          </span>
          <div>
            <h3>{data.pendingCount}</h3>
            <p>Pending Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Stethoscope size={20} />
          </span>
          <div>
            <h3>{data.todayCount}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>
      </div>

      <div className="table-card" style={{ padding: '20px 20px 6px' }}>
        <h3>Today's Schedule</h3>
        {todaysAppointments.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nothing scheduled today"
            message="You have no appointments booked for today."
          />
        ) : (
          <table style={{ marginTop: '10px' }}>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysAppointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.patient?.userId?.name}</td>
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
