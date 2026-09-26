import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminSessionLogs() {
  const [logs, setLogs] = useState([]);
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/admin/session-logs', { params: role ? { role } : {} })
      .then(({ data }) => setLogs(data.logs))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load session logs'));
  }, [role]);

  return (
    <div>
      <h2>Session Logs</h2>
      <div className="toolbar">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="doctor">Doctor</option>
          <option value="patient">User (Patient)</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Login At</th>
            <th>Logout At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.user?.name}</td>
              <td>{log.role}</td>
              <td>{new Date(log.loginAt).toLocaleString()}</td>
              <td>{log.logoutAt ? new Date(log.logoutAt).toLocaleString() : 'Active'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
