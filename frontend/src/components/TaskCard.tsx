import type { Task, TaskStatus, UpdateTaskInput } from '../types/index.js';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, input: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; next: TaskStatus | null; color: string }
> = {
  todo: { label: 'To Do', next: 'in-progress', color: '#6b7280' },
  'in-progress': { label: 'In Progress', next: 'done', color: '#f59e0b' },
  done: { label: 'Done', next: null, color: '#10b981' },
};

const PRIORITY_COLORS = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#ef4444',
} as const;

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const statusCfg = STATUS_CONFIG[task.status];
  const canAdvance = statusCfg.next !== null;

  const handleAdvance = () => {
    if (statusCfg.next) {
      onUpdate(task.id, { status: statusCfg.next });
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  return (
    <article
      className={`task-card task-card--${task.status}`}
      data-testid="task-card"
      data-status={task.status}
    >
      <div className="task-card__header">
        <div className="task-card__meta">
          <span
            className="task-card__status"
            style={{ '--status-color': statusCfg.color } as React.CSSProperties}
          >
            <span className="task-card__status-dot" />
            {statusCfg.label}
          </span>
          <span
            className="task-card__priority"
            style={{ '--priority-color': PRIORITY_COLORS[task.priority] } as React.CSSProperties}
          >
            {task.priority}
          </span>
        </div>
        <button
          className="task-card__delete"
          onClick={handleDelete}
          aria-label={`Delete task: ${task.title}`}
          title="Delete task"
        >
          ×
        </button>
      </div>

      <h3 className="task-card__title">{task.title}</h3>

      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}

      {task.tags.length > 0 && (
        <div className="task-card__tags" role="list" aria-label="Tags">
          {task.tags.map((tag) => (
            <span key={tag} className="task-card__tag" role="listitem">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-card__footer">
        <time
          className="task-card__date"
          dateTime={task.updatedAt}
          title={new Date(task.updatedAt).toLocaleString()}
        >
          {new Date(task.updatedAt).toLocaleDateString()}
        </time>

        {canAdvance && (
          <button
            className="task-card__advance"
            onClick={handleAdvance}
            aria-label={`Advance task to ${statusCfg.next}`}
          >
            → {STATUS_CONFIG[statusCfg.next!].label}
          </button>
        )}
      </div>
    </article>
  );
}
