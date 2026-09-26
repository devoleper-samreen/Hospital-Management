import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function AdminContactQueries() {
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState('');

  async function loadQueries() {
    const { data } = await axiosClient.get('/admin/queries');
    setQueries(data.queries);
  }

  useEffect(() => {
    loadQueries().catch((err) => setError(err.response?.data?.message || 'Failed to load queries'));
  }, []);

  async function markRead(id) {
    await axiosClient.put(`/admin/queries/${id}/read`);
    loadQueries();
  }

  return (
    <div>
      <h2>Contact Us Queries</h2>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {queries.map((q) => (
            <tr key={q._id}>
              <td>{q.name}</td>
              <td>{q.email}</td>
              <td>{q.message}</td>
              <td>{q.status}</td>
              <td>
                {q.status === 'new' && <button onClick={() => markRead(q._id)}>Mark Read</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
