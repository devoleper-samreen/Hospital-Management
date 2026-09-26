import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadPatients() {
    const { data } = await axiosClient.get('/doctor/patients');
    setPatients(data.patients);
  }

  useEffect(() => {
    loadPatients().catch((err) => setError(err.response?.data?.message || 'Failed to load patients'));
  }, []);

  async function addNote(patientId) {
    const note = noteDrafts[patientId];
    if (!note) return;
    setError('');
    setMessage('');
    try {
      await axiosClient.put(`/doctor/patients/${patientId}`, { note });
      setNoteDrafts({ ...noteDrafts, [patientId]: '' });
      setMessage('Note added to patient record.');
      loadPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note');
    }
  }

  return (
    <div>
      <h2>My Patients</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Add Medical Note</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td>{p.userId?.name}</td>
              <td>{p.userId?.email}</td>
              <td>{p.userId?.phone}</td>
              <td>
                <input
                  placeholder="Prescription / note"
                  value={noteDrafts[p._id] || ''}
                  onChange={(e) => setNoteDrafts({ ...noteDrafts, [p._id]: e.target.value })}
                />
                <button onClick={() => addNote(p._id)}>Save</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
