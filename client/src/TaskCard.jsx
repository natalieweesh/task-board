import { useState } from 'react';
import { apiFetch } from './api.js';
import Dropdown from './Dropdown.jsx';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = {
  TODO: 'TO DO',
  IN_PROGRESS: 'IN PROGRESS',
  DONE: 'DONE',
};

export default function TaskCard({ task, onChange, onDelete, onMutate, flashing }) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
      onMutate?.(task.id);
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
      onMutate?.(task.id);
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      onChange(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmDelete() {
    try {
      await apiFetch(`/tasks/${task.id}`, { method: 'DELETE' });
      onDelete(task.id);
    } catch (err) {
      setError(err.message);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className={`relative bg-white rounded shadow-sm border border-gray-200 p-3 ${flashing ? 'animate-flash' : ''}`}>
      {!editingField && (
        <button
          onClick={() => setConfirmingDelete(true)}
          className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 text-lg leading-none cursor-pointer"
          title="Delete task"
          aria-label="Delete task"
        >
          ×
        </button>
      )}

      {editingField === 'title' ? (
        <EditField
          value={editValue}
          onChange={setEditValue}
          onSave={saveEdit}
          onCancel={cancelEdit}
          multiline={false}
        />
      ) : (
        <button
          type="button"
          className="block text-left font-medium cursor-pointer hover:bg-gray-50 -mx-1 px-1 mr-5 rounded break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => startEdit('title', task.title)}
          title="Click to edit"
        >
          {task.title}
        </button>
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
        <button
          type="button"
          className="block text-left text-sm text-gray-600 mt-1 cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded whitespace-pre-wrap break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => startEdit('description', task.description)}
          title="Click to edit"
        >
          {task.description}
        </button>
      ) : (
        <button
          type="button"
          className="text-xs text-gray-400 italic mt-1 cursor-pointer hover:text-gray-600 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => startEdit('description', '')}
        >
          + Add description
        </button>
      )}

      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span className="break-all">{task.createdBy.username}</span>
        <Dropdown
          value={task.status}
          onChange={changeStatus}
          options={STATUSES}
          labels={STATUS_LABELS}
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <div
        aria-hidden={!confirmingDelete}
        className={`absolute inset-0 bg-gray-200/95 rounded flex flex-col items-center justify-center gap-2 p-3 transition-opacity duration-150 ${
          confirmingDelete ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-sm font-medium text-gray-800">Delete this task?</p>
        <div className="flex gap-2">
          <button
            onClick={confirmDelete}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            className="px-3 py-1 text-sm border border-gray-400 rounded bg-white hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
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
          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
