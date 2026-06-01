import { useState, type FormEvent } from 'react';
import type { CreateTaskInput, TaskPriority } from '../types/index.js';

interface AddTaskFormProps {
  onAdd: (input: CreateTaskInput) => Promise<boolean>;
}

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const success = await onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setIsSubmitting(false);

    if (success) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTags('');
      setIsOpen(false);
    } else {
      setError('Failed to create task. Please try again.');
    }
  };

  if (!isOpen) {
    return (
      <button
        className="add-task-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Add new task"
      >
        <span className="add-task-btn__icon">+</span>
        New Task
      </button>
    );
  }

  return (
    <form className="add-task-form" onSubmit={(e) => void handleSubmit(e)} noValidate>
      <div className="add-task-form__header">
        <h2 className="add-task-form__title">New Task</h2>
        <button
          type="button"
          className="add-task-form__close"
          onClick={() => setIsOpen(false)}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      {error && (
        <p className="add-task-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="add-task-form__field">
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
          maxLength={200}
        />
      </div>

      <div className="add-task-form__field">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          rows={3}
        />
      </div>

      <div className="add-task-form__row">
        <div className="add-task-form__field">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="add-task-form__field">
          <label htmlFor="task-tags">Tags</label>
          <input
            id="task-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="api, frontend, bug"
          />
        </div>
      </div>

      <div className="add-task-form__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Adding…' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
