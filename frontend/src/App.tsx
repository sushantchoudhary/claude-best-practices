import { useState } from 'react';
import { useTasks } from './hooks/useTasks.js';
import { TaskList } from './components/TaskList.js';
import { AddTaskForm } from './components/AddTaskForm.js';
import type { ViewFilter } from './types/index.js';

const FILTERS: ViewFilter[] = ['all', 'todo', 'in-progress', 'done'];
const FILTER_LABELS: Record<ViewFilter, string> = {
  all: 'All',
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export default function App() {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<ViewFilter>('all');

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-inner">
          <div className="app__brand">
            <span className="app__logo">◈</span>
            <div>
              <h1 className="app__title">Claude Code Demo</h1>
              <p className="app__subtitle">AI-assisted development · Best practices showcase</p>
            </div>
          </div>
          <AddTaskForm onAdd={createTask} />
        </div>
      </header>

      <main className="app__main">
        {error && (
          <div className="app__error" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <nav className="filter-bar" aria-label="Filter tasks">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-bar__btn ${filter === f ? 'filter-bar__btn--active' : ''}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {FILTER_LABELS[f]}
              <span className="filter-bar__count">{counts[f]}</span>
            </button>
          ))}
        </nav>

        {isLoading ? (
          <div className="app__loading" role="status" aria-label="Loading tasks">
            <div className="spinner" />
            <span>Loading tasks…</span>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            filter={filter}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}
      </main>

      <footer className="app__footer">
        <p>
          Built with{' '}
          <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noreferrer">
            Claude Code
          </a>{' '}
          · See{' '}
          <a
            href="https://github.com/your-org/claude-code-demo/blob/main/CLAUDE.md"
            target="_blank"
            rel="noreferrer"
          >
            CLAUDE.md
          </a>
        </p>
      </footer>
    </div>
  );
}
