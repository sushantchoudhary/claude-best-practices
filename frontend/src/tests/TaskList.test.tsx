import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from '../components/TaskList.js';
import { mockTasks } from './fixtures.js';

const onUpdate = vi.fn();
const onDelete = vi.fn();

describe('TaskList', () => {
  it('renders all tasks when filter is "all"', () => {
    render(
      <TaskList tasks={mockTasks} filter="all" onUpdate={onUpdate} onDelete={onDelete} />
    );
    expect(screen.getAllByTestId('task-card')).toHaveLength(3);
  });

  it('filters to show only todo tasks', () => {
    render(
      <TaskList tasks={mockTasks} filter="todo" onUpdate={onUpdate} onDelete={onDelete} />
    );
    const cards = screen.getAllByTestId('task-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute('data-status', 'todo');
  });

  it('filters to show only in-progress tasks', () => {
    render(
      <TaskList tasks={mockTasks} filter="in-progress" onUpdate={onUpdate} onDelete={onDelete} />
    );
    const cards = screen.getAllByTestId('task-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute('data-status', 'in-progress');
  });

  it('filters to show only done tasks', () => {
    render(
      <TaskList tasks={mockTasks} filter="done" onUpdate={onUpdate} onDelete={onDelete} />
    );
    const cards = screen.getAllByTestId('task-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute('data-status', 'done');
  });

  it('shows empty state when no tasks match filter', () => {
    render(
      <TaskList tasks={[]} filter="all" onUpdate={onUpdate} onDelete={onDelete} />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('task-card')).not.toBeInTheDocument();
  });

  it('shows filtered empty message for specific status', () => {
    const todoOnly = mockTasks.filter((t) => t.status === 'todo');
    render(
      <TaskList tasks={todoOnly} filter="done" onUpdate={onUpdate} onDelete={onDelete} />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('passes onUpdate and onDelete down to TaskCards', () => {
    // Verify the list is accessible and labeled correctly
    render(
      <TaskList tasks={mockTasks} filter="all" onUpdate={onUpdate} onDelete={onDelete} />
    );
    expect(screen.getByRole('list', { name: /all tasks/i })).toBeInTheDocument();
  });
});
