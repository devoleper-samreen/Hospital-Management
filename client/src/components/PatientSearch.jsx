import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function PatientSearch({ endpoint }) {
  const [q, setQ] = useState('');
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axiosClient.get(endpoint, { params: { q } });
      setPatients(data.patients);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    }
  }

  return (
    <div>
      <h2>Patient Search</h2>
      <form onSubmit={handleSearch} className="toolbar">
        <input
          placeholder="Search by name or mobile number"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td>{p.userId?.name}</td>
              <td>{p.userId?.email}</td>
              <td>{p.userId?.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
