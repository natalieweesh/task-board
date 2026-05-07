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
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <div className="text-sm text-gray-700">
            Signed in as <strong>{session.user.username}</strong>
            <button
              onClick={handleLogout}
              className="ml-3 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
        <Board />
      </div>
    </div>
  );
}
