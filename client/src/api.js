import { getSession } from './auth.js';

export async function apiFetch(path, options = {}) {
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session ? { 'x-session-id': session.sessionId } : {}),
    ...options.headers,
  };
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    sessionStorage.clear();
    window.location.reload();
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}
