import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTaskForm } from '../components/AddTaskForm.js';

describe('AddTaskForm', () => {
  const onAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "New Task" button initially', () => {
    render(<AddTaskForm onAdd={onAdd} />);
    expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('shows form when button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);
    await user.click(screen.getByRole('button', { name: /add new task/i }));
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
  });

  it('submits form with title and closes on success', async () => {
    onAdd.mockResolvedValueOnce(true);
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add new task/i }));
    await user.type(screen.getByRole('textbox', { name: /title/i }), 'My new task');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My new task' })
      );
    });

    // Form should close after success
    await waitFor(() => {
      expect(screen.queryByRole('textbox', { name: /title/i })).not.toBeInTheDocument();
    });
  });

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add new task/i }));
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('shows error message when onAdd fails', async () => {
    onAdd.mockResolvedValueOnce(false);
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add new task/i }));
    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Failing task');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to create task/i);
    });
  });

  it('submits with all optional fields', async () => {
    onAdd.mockResolvedValueOnce(true);
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add new task/i }));
    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Full task');
    await user.type(screen.getByRole('textbox', { name: /tags/i }), 'api, test');

    // Change priority to high
    await user.selectOptions(screen.getByRole('combobox', { name: /priority/i }), 'high');

    await user.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith({
        title: 'Full task',
        description: undefined,
        priority: 'high',
        tags: ['api', 'test'],
      });
    });
  });

  it('cancels and hides form when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add new task/i }));
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.queryByRole('textbox', { name: /title/i })).not.toBeInTheDocument();
  });

  it('closes form when × close icon is clicked', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /add new task/i }));
    await user.click(screen.getByRole('button', { name: /close form/i }));

    expect(screen.queryByRole('textbox', { name: /title/i })).not.toBeInTheDocument();
  });
});
