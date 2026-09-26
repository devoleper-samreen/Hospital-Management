import { useEffect, useState } from 'react';
import { CalendarPlus, Stethoscope } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import EmptyState from '../../components/EmptyState';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState(null);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', reason: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosClient.get('/patient/doctors').then(({ data }) => setDoctors(data.doctors));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await axiosClient.post('/patient/appointments', form);
      setMessage('Appointment booked successfully! You can track its status in Appointment History.');
      setForm({ doctorId: '', date: '', time: '', reason: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  }

  const selectedDoctor = doctors?.find((d) => d._id === form.doctorId);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Book an Appointment</h2>
          <p>Choose a doctor and pick a convenient date and time.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3>1. Select a Doctor</h3>
          {doctors === null ? (
            <p>Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No doctors available"
              message="Please check back later — the hospital hasn't added any doctors yet."
            />
          ) : (
            <div className="doctor-grid">
              {doctors.map((d) => (
                <div
                  key={d._id}
                  className={`doctor-option${form.doctorId === d._id ? ' selected' : ''}`}
                  onClick={() => setForm({ ...form, doctorId: d._id })}
                >
                  <strong>{d.userId?.name}</strong>
                  <span>{d.specialization}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedDoctor && (
          <div className="card">
            <h3>2. Appointment Details</h3>
            <div className="grid-form" style={{ maxWidth: 520 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                Date
                <input
                  type="date"
                  required
                  min={today}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: 'var(--text-muted)' }}>
                Time
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
              Reason for visit
              <textarea
                placeholder="Briefly describe your symptoms or reason for the visit"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </label>
            <button type="submit" disabled={submitting} style={{ marginTop: 16 }}>
              <CalendarPlus size={16} />
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
