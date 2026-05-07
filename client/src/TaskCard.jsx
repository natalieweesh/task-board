import { useState } from 'react';
import { apiFetch } from './api.js';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskCard({ task, onChange, onDelete }) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);

  function startEdit(field, currentValue) {
    setEditingField(field);
    setEditValue(currentValue ?? '');
    setError(null);
  }

  function cancelEdit() {
    setEditingField(null);
    setError(null);
  }

  async function saveEdit() {
    const trimmed = editValue.trim();
    if (editingField === 'title' && !trimmed) {
      setError('title cannot be empty');
      return;
    }
    try {
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [editingField]: trimmed }),
      });
      onChange(updated);
      setEditingField(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeStatus(status) {
    try {
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      onChange(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiFetch(`/tasks/${task.id}`, { method: 'DELETE' });
      onDelete(task.id);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-white rounded shadow-sm border border-gray-200 p-3">
      {editingField === 'title' ? (
        <EditField
          value={editValue}
          onChange={setEditValue}
          onSave={saveEdit}
          onCancel={cancelEdit}
          multiline={false}
        />
      ) : (
        <div
          className="font-medium cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded"
          onClick={() => startEdit('title', task.title)}
          title="Click to edit"
        >
          {task.title}
        </div>
      )}

      {editingField === 'description' ? (
        <div className="mt-2">
          <EditField
            value={editValue}
            onChange={setEditValue}
            onSave={saveEdit}
            onCancel={cancelEdit}
            multiline={true}
          />
        </div>
      ) : task.description ? (
        <div
          className="text-sm text-gray-600 mt-1 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded whitespace-pre-wrap"
          onClick={() => startEdit('description', task.description)}
          title="Click to edit"
        >
          {task.description}
        </div>
      ) : (
        <div
          className="text-xs text-gray-400 italic mt-1 cursor-pointer hover:text-gray-600"
          onClick={() => startEdit('description', '')}
        >
          + add description
        </div>
      )}

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>{task.createdBy.username}</span>
        <div className="flex items-center gap-2">
          <select
            value={task.status}
            onChange={e => changeStatus(e.target.value)}
            className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
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

  const sharedClasses = 'w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="flex flex-col gap-1">
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={3}
          className={`${sharedClasses} font-sans resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className={sharedClasses}
        />
      )}
      <div className="flex gap-1">
        <button
          onClick={onSave}
          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
