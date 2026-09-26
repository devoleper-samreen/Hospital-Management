import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleRequestToken(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await axiosClient.post('/auth/forgot-password', { email });
      setToken(data.resetToken);
      setMessage('Reset token generated. Enter a new password below to complete the reset.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate reset token');
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axiosClient.post('/auth/reset-password', { token, password: newPassword });
      setMessage('Password reset successful. You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password');
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-icon">
          <KeyRound size={22} />
        </span>
        <h1>Hospital Management System</h1>
        <h2>Reset your password</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleRequestToken} className="stacked-form" style={{ maxWidth: 'none' }}>
          <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Step 1 — Request a token</small>
          <label>
            Registered Email
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit">Get Reset Token</button>
        </form>

        <form
          onSubmit={handleResetPassword}
          className="stacked-form"
          style={{ maxWidth: 'none', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}
        >
          <small style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Step 2 — Set a new password</small>
          <label>
            Reset Token
            <input
              required
              placeholder="Paste the reset token you received"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <button type="submit">Reset Password</button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
