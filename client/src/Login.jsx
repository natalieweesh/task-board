import { useState } from 'react';
import { login } from './auth.js';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const session = await login(username.trim());
      onLogin(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 320 }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
          autoFocus
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        />
        <button type="submit" disabled={loading || !username.trim()}>
          {loading ? '...' : 'Sign in'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
