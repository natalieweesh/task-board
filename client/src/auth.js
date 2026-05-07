const SESSION_KEY = 'sessionId';
const USER_KEY = 'user';

export function getSession() {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  const userJson = sessionStorage.getItem(USER_KEY);
  if (!sessionId || !userJson) return null;
  return { sessionId, user: JSON.parse(userJson) };
}

export async function login(username) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'login failed');
  }
  const { sessionId, user } = await res.json();
  sessionStorage.setItem(SESSION_KEY, sessionId);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  return { sessionId, user };
}

export async function logout() {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  if (sessionId) {
    await fetch('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
  }
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_KEY);
}
