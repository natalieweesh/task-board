import { useEffect, useState } from 'react';
import { apiFetch } from './api.js';

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch('/tasks')
      .then(setTasks)
      .catch(err => setError(err.message));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const task = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });
      setTasks(prev => [...prev, task]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <form onSubmit={handleCreate} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 400 }}>
        <input
          type="text"
          placeholder="task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
          style={{ padding: '0.5rem' }}
        />
        <textarea
          placeholder="description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={loading}
          rows={3}
          style={{ padding: '0.5rem', fontFamily: 'inherit', resize: 'vertical' }}
        />
        <button type="submit" disabled={loading || !title.trim()} style={{ alignSelf: 'flex-start' }}>
          {loading ? '...' : 'Add task'}
        </button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <ul style={{ paddingLeft: '1.25rem' }}>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{task.title}</strong>{' '}
            <span style={{ color: '#666' }}>
              ({task.status}) — {task.createdBy.username}
            </span>
            {task.description && (
              <div style={{ color: '#444', marginTop: '0.25rem' }}>{task.description}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
