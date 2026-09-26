import { useState } from 'react';
import { Save } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ChangePasswordForm from './ChangePasswordForm';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfileForm() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await axiosClient.put('/auth/profile', form);
      setUser({ ...user, name: data.user.name, phone: data.user.phone });
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p>Manage your personal details and account security.</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="profile-header">
            <span className="profile-avatar">{initials(user?.name)}</span>
            <div>
              <h3 style={{ marginBottom: 2 }}>{user?.name}</h3>
              <span className="role-pill">{user?.role}</span>
            </div>
          </div>

          {message && <p className="success" style={{ marginTop: 16 }}>{message}</p>}
          {error && <p className="error" style={{ marginTop: 16 }}>{error}</p>}

          <form onSubmit={handleSubmit} className="stacked-form" style={{ marginTop: 16, maxWidth: 'none' }}>
            <label>
              Full Name
              <input
                required
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              Email
              <input value={user?.email || ''} disabled />
            </label>
            <button type="submit">
              <Save size={16} />
              Save Changes
            </button>
          </form>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  );
}
