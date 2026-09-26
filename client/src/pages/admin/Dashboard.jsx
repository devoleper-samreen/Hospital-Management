import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, MessageSquare, Stethoscope, Users } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState(null);
  const [queries, setQueries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      axiosClient.get('/admin/dashboard'),
      axiosClient.get('/admin/appointments'),
      axiosClient.get('/admin/queries'),
    ])
      .then(([statsRes, apptRes, queryRes]) => {
        setStats(statsRes.data);
        setAppointments(apptRes.data.appointments.slice(0, 5));
        setQueries(queryRes.data.queries.slice(0, 4));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats || !appointments || !queries) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Here's what's happening across the hospital today.</p>
        </div>
      </div>

      <div className="stat-grid">
        <Link to="/admin/patients" className="stat-card stat-card-link">
          <span className="stat-icon">
            <Users size={20} />
          </span>
          <div>
            <h3>{stats.patientCount}</h3>
            <p>Patients</p>
          </div>
        </Link>
        <Link to="/admin/doctors" className="stat-card stat-card-link">
          <span className="stat-icon">
            <Stethoscope size={20} />
          </span>
          <div>
            <h3>{stats.doctorCount}</h3>
            <p>Doctors</p>
          </div>
        </Link>
        <Link to="/admin/appointments" className="stat-card stat-card-link">
          <span className="stat-icon">
            <CalendarClock size={20} />
          </span>
          <div>
            <h3>{stats.appointmentCount}</h3>
            <p>Appointments</p>
          </div>
        </Link>
        <Link to="/admin/queries" className="stat-card stat-card-link">
          <span className="stat-icon">
            <MessageSquare size={20} />
          </span>
          <div>
            <h3>{stats.newQueryCount}</h3>
            <p>New Queries</p>
          </div>
        </Link>
      </div>

      <div className="two-col">
        <div className="table-card" style={{ padding: '20px 20px 6px' }}>
          <h3>Recent Appointments</h3>
          {appointments.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No appointments yet"
              message="Appointments booked by patients will show up here."
            />
          ) : (
            <table style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id}>
                    <td>{a.patient?.userId?.name}</td>
                    <td>{a.doctor?.userId?.name}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-card" style={{ padding: '20px 20px 6px' }}>
          <h3>Recent Contact Queries</h3>
          {queries.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No queries yet"
              message="Messages submitted via Contact Us will show up here."
            />
          ) : (
            <table style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Message</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q._id}>
                    <td>{q.name}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.message}
                    </td>
                    <td>
                      <span className={`badge badge-${q.status}`}>{q.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
