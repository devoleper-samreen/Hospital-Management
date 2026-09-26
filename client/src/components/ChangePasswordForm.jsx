import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axiosClient.put('/auth/change-password', form);
      setMessage('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password');
    }
  }

  return (
    <div className="card">
      <div className="profile-header" style={{ marginBottom: 16 }}>
        <span className="stat-icon">
          <KeyRound size={20} />
        </span>
        <div>
          <h3 style={{ marginBottom: 2 }}>Change Password</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Keep your account secure.</p>
        </div>
      </div>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="stacked-form" style={{ maxWidth: 'none' }}>
        <label>
          Current Password
          <input
            type="password"
            required
            placeholder="Enter current password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </label>
        <label>
          New Password
          <input
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </label>
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
}
