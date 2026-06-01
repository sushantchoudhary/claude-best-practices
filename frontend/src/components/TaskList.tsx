import { TaskCard } from './TaskCard.js';
import type { Task, ViewFilter, UpdateTaskInput } from '../types/index.js';

interface TaskListProps {
  tasks: Task[];
  filter: ViewFilter;
  onUpdate: (id: string, input: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
}

const FILTER_LABELS: Record<ViewFilter, string> = {
  all: 'All',
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export function TaskList({ tasks, filter, onUpdate, onDelete }: TaskListProps) {
  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  if (filtered.length === 0) {
    return (
      <div className="task-list__empty" role="status">
        <span className="task-list__empty-icon">◎</span>
        <p>No {filter === 'all' ? '' : FILTER_LABELS[filter].toLowerCase() + ' '}tasks.</p>
      </div>
    );
  }

  return (
    <div className="task-list" role="list" aria-label={`${FILTER_LABELS[filter]} tasks`}>
      {filtered.map((task) => (
        <div key={task.id} role="listitem">
          <TaskCard task={task} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
