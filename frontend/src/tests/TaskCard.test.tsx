import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '../components/TaskCard.js';
import { mockTask } from './fixtures.js';

describe('TaskCard', () => {
  const onUpdate = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task title', () => {
    render(<TaskCard task={mockTask()} onUpdate={onUpdate} onDelete={onDelete} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('renders task description when present', () => {
    render(<TaskCard task={mockTask()} onUpdate={onUpdate} onDelete={onDelete} />);
    expect(screen.getByText('A test task description')).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    render(
      <TaskCard
        task={mockTask({ description: undefined })}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders all tags', () => {
    render(
      <TaskCard
        task={mockTask({ tags: ['api', 'frontend'] })}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );
    expect(screen.getByText('#api')).toBeInTheDocument();
    expect(screen.getByText('#frontend')).toBeInTheDocument();
  });

  it('shows "advance" button for todo tasks', () => {
    render(
      <TaskCard task={mockTask({ status: 'todo' })} onUpdate={onUpdate} onDelete={onDelete} />
    );
    expect(screen.getByRole('button', { name: /advance task to in-progress/i })).toBeInTheDocument();
  });

  it('shows "advance" button for in-progress tasks', () => {
    render(
      <TaskCard
        task={mockTask({ status: 'in-progress' })}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );
    expect(screen.getByRole('button', { name: /advance task to done/i })).toBeInTheDocument();
  });

  it('does not show "advance" button for done tasks', () => {
    render(
      <TaskCard task={mockTask({ status: 'done' })} onUpdate={onUpdate} onDelete={onDelete} />
    );
    expect(screen.queryByRole('button', { name: /advance/i })).not.toBeInTheDocument();
  });

  it('calls onUpdate with next status when advance is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskCard task={mockTask({ status: 'todo' })} onUpdate={onUpdate} onDelete={onDelete} />
    );
    await user.click(screen.getByRole('button', { name: /advance task/i }));
    expect(onUpdate).toHaveBeenCalledWith('task-1', { status: 'in-progress' });
  });

  it('calls onDelete when delete is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
    const user = userEvent.setup();
    render(<TaskCard task={mockTask()} onUpdate={onUpdate} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /delete task/i }));
    expect(onDelete).toHaveBeenCalledWith('task-1');
  });

  it('does not call onDelete when delete is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    const user = userEvent.setup();
    render(<TaskCard task={mockTask()} onUpdate={onUpdate} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /delete task/i }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('applies done status class', () => {
    render(
      <TaskCard task={mockTask({ status: 'done' })} onUpdate={onUpdate} onDelete={onDelete} />
    );
    expect(screen.getByTestId('task-card')).toHaveClass('task-card--done');
  });
});
