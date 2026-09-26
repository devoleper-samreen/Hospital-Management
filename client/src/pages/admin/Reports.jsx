import { useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminReports() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleGenerate(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axiosClient.get('/admin/reports', { params: range });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    }
  }

  return (
    <div>
      <h2>Patient Appointment Reports</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleGenerate} className="toolbar">
        <label>
          From
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        </label>
        <label>
          To
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </label>
        <button type="submit">Generate</button>
      </form>

      {result && (
        <div className="card">
          <h3>{result.count} appointment(s) found</h3>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.appointments.map((a) => (
                <tr key={a._id}>
                  <td>{a.patient?.userId?.name}</td>
                  <td>{a.doctor?.userId?.name}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
