import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-icon">
          <UserPlus size={22} />
        </span>
        <h1>Hospital Management System</h1>
        <h2>Patient Registration</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Full Name
          <input
            required
            placeholder="e.g. Rahul Sharma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          Password
          <input
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        <div className="auth-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
}
