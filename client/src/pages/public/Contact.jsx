import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await axiosClient.post('/contact', form);
      setMessage('Thanks! Your message has been sent to the hospital administration.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send your message');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-icon">
          <MessageSquare size={22} />
        </span>
        <h1>Hospital Management System</h1>
        <h2>Contact Us</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <label>
          Your Name
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
          Message
          <textarea
            required
            placeholder="How can we help you?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </label>
        <button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
