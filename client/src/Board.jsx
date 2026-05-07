import { useEffect, useState } from 'react';
import { apiFetch } from './api.js';

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    apiFetch('/tasks')
      .then(setTasks)
      .catch(err => setError(err.message));
  }, []);

  async function handleStatusChange(id, status) {
    try {
      const updated = await apiFetch(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(taskId, field, currentValue) {
    setEditing({ taskId, field, value: currentValue ?? '' });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const { taskId, field, value } = editing;
    const trimmed = value.trim();
    if (field === 'title' && !trimmed) {
      setError('title cannot be empty');
      return;
    }
    try {
      const updated = await apiFetch(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: trimmed }),
      });
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      setEditing(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

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
        {tasks.map(task => {
          const titleEditing = editing?.taskId === task.id && editing.field === 'title';
          const descEditing = editing?.taskId === task.id && editing.field === 'description';
          return (
            <li key={task.id} style={{ marginBottom: '0.75rem' }}>
              {titleEditing ? (
                <EditField
                  value={editing.value}
                  onChange={v => setEditing({ ...editing, value: v })}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                  multiline={false}
                />
              ) : (
                <strong
                  onClick={() => startEdit(task.id, 'title', task.title)}
                  style={{ cursor: 'pointer' }}
                  title="Click to edit"
                >
                  {task.title}
                </strong>
              )}{' '}
              <select
                value={task.status}
                onChange={e => handleStatusChange(task.id, e.target.value)}
                style={{ marginLeft: '0.25rem' }}
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>{' '}
              <span style={{ color: '#666' }}>— {task.createdBy.username}</span>{' '}
              <button
                onClick={() => handleDelete(task.id)}
                style={{ marginLeft: '0.5rem', color: 'crimson', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                title="Delete task"
              >
                Delete
              </button>
              {descEditing ? (
                <div style={{ marginTop: '0.25rem' }}>
                  <EditField
                    value={editing.value}
                    onChange={v => setEditing({ ...editing, value: v })}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    multiline={true}
                  />
                </div>
              ) : task.description ? (
                <div
                  onClick={() => startEdit(task.id, 'description', task.description)}
                  style={{ color: '#444', marginTop: '0.25rem', cursor: 'pointer' }}
                  title="Click to edit"
                >
                  {task.description}
                </div>
              ) : (
                <div
                  onClick={() => startEdit(task.id, 'description', '')}
                  style={{ color: '#999', fontStyle: 'italic', marginTop: '0.25rem', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  + add description
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EditField({ value, onChange, onSave, onCancel, multiline }) {
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave();
    }
  }

  const Input = multiline ? 'textarea' : 'input';
  return (
    <span style={{ display: 'inline-flex', flexDirection: multiline ? 'column' : 'row', gap: '0.25rem', alignItems: multiline ? 'stretch' : 'center', maxWidth: 400 }}>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        rows={multiline ? 3 : undefined}
        style={{ padding: '0.25rem 0.5rem', fontFamily: 'inherit', minWidth: multiline ? 320 : 200 }}
      />
      <span style={{ display: 'flex', gap: '0.25rem' }}>
        <button onClick={onSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </span>
    </span>
  );
}
