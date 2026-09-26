import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  async function loadUsers() {
    const { data } = await axiosClient.get('/admin/users');
    setUsers(data.users);
  }

  useEffect(() => {
    loadUsers().catch((err) => setError(err.response?.data?.message || 'Failed to load users'));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Remove this user?')) return;
    await axiosClient.delete(`/admin/users/${id}`);
    loadUsers();
  }

  return (
    <div>
      <h2>Registered Users (Patients)</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
