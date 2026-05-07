import { useEffect, useState } from 'react';
import { apiFetch } from './api.js';
import { socket } from './socket.js';
import TaskCard from './TaskCard.jsx';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

const STATUS_LABELS = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    apiFetch('/tasks')
      .then(setTasks)
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    socket.connect();

    const onCreated = task => {
      // Dedupe by id: this event also fires for tasks WE just created, which the POST handler
      // already added locally. Whichever (socket vs. HTTP response) arrives second is a no-op.
      setTasks(prev => (prev.some(t => t.id === task.id) ? prev : [...prev, task]));
    };
    const onUpdated = task => {
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));
    };
    const onDeleted = ({ id }) => {
      setTasks(prev => prev.filter(t => t.id !== id));
    };

    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);

    return () => {
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
      socket.disconnect();
    };
  }, []);

  function handleTaskChange(updated) {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  }

  function handleTaskDelete(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
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
      // Dedupe: the socket 'task:created' event may have already added this task before the
      // HTTP response resolved. See onCreated handler in the socket effect.
      setTasks(prev => (prev.some(t => t.id === task.id) ? prev : [...prev, task]));
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function closeForm() {
    setFormOpen(false);
    setTitle('');
    setDescription('');
    setError(null);
  }

  return (
    <div>
      {formOpen ? (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-col gap-2 max-w-md bg-white p-4 rounded border border-gray-200"
        >
          <input
            type="text"
            placeholder="task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={loading}
            autoFocus
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={loading}
            rows={2}
            className="px-3 py-2 border border-gray-300 rounded font-sans resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Add task'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setFormOpen(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add task
        </button>
      )}

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4">
        {STATUSES.map(status => {
          const columnTasks = tasks.filter(t => t.status === status);
          return (
            <div
              key={status}
              className="flex-1 bg-gray-100 rounded-lg p-3 min-h-[200px]"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-3 px-1">
                {STATUS_LABELS[status]}{' '}
                <span className="text-gray-400 font-normal">({columnTasks.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onChange={handleTaskChange}
                    onDelete={handleTaskDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
