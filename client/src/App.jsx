import { useState } from 'react';
import { getSession, logout } from './auth.js';
import Login from './Login.jsx';
import Board from './Board.jsx';

export default function App() {
  const [session, setSession] = useState(getSession);

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  async function handleLogout() {
    await logout();
    setSession(null);
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Task Board</h1>
        <div>
          Signed in as <strong>{session.user.username}</strong>{' '}
          <button onClick={handleLogout}>Sign out</button>
        </div>
      </div>
      <Board />
    </div>
  );
}
