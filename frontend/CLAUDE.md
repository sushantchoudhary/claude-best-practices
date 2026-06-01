# Frontend CLAUDE.md

> Claude Code reads this file when working in the `frontend/` directory.
> It supplements the root `CLAUDE.md` with frontend-specific patterns.

## Stack

- **React 18** with hooks-only (no class components)
- **TypeScript** strict mode — `noUnusedLocals`, `noUnusedParameters` enabled
- **Vite** for dev server and builds
- **Vitest** + **React Testing Library** for tests
- **CSS Modules** via global `styles.css` with design tokens

## Directory Roles (strict separation)

| Directory | What goes here | What does NOT go here |
|-----------|---------------|----------------------|
| `src/components/` | Presentational UI — receives props, renders markup | API calls, business logic, complex state |
| `src/hooks/` | Stateful logic + side effects — all custom hooks | JSX, rendering |
| `src/services/api.ts` | All `fetch()` calls | UI state, React |
| `src/types/index.ts` | TypeScript interfaces shared with backend | UI-only types (use inline or local types) |
| `src/tests/` | All test files | Source code |

## Design Token Usage

**Always** use CSS custom properties. **Never** hardcode colors or fonts:

```css
/* ✅ Correct */
color: var(--text);
background: var(--surface);
border: 1px solid var(--border);
font-family: var(--font-mono);

/* ❌ Wrong */
color: #333;
background: white;
```

Available tokens: `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--border`, `--border-2`, `--text`, `--text-2`, `--text-3`, `--accent`, `--accent-2`, `--accent-glow`, `--green`, `--amber`, `--red`, `--blue`, `--font-sans`, `--font-mono`, `--radius`, `--radius-lg`, `--shadow`, `--shadow-lg`

## Component Rules

```typescript
// ✅ Correct pattern
interface MyProps {
  task: Task;                      // types from src/types/index.ts
  onUpdate: (id: string) => void;  // callbacks are functions, not primitives
}

export function MyComponent({ task, onUpdate }: MyProps) {
  // hooks at the top
  const [open, setOpen] = useState(false);

  // derived values — no useMemo unless genuinely expensive
  const label = task.status === 'done' ? 'Completed' : 'Active';

  // handlers
  const handleClick = () => onUpdate(task.id);

  return (
    // root element always has data-testid and semantic CSS class
    <div className="my-component" data-testid="my-component">
      ...
    </div>
  );
}
```

**Never:**
- Default exports for components
- `useEffect` for derived state (compute inline)
- Prop drilling more than 2 levels (lift to a hook)
- `any` type, even in tests

## Testing Rules

```typescript
// ✅ Test from the user's perspective
it('shows error message when task save fails', async () => {
  // 1. Configure mocks (api is mocked globally in setup.ts)
  vi.mocked(api.tasks.create).mockResolvedValueOnce({ data: null, error: 'Server error' });

  // 2. Render
  render(<AddTaskForm onAdd={vi.fn()} />);

  // 3. Interact using userEvent (not fireEvent)
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /add new task/i }));
  await user.type(screen.getByRole('textbox', { name: /title/i }), 'Test');
  await user.click(screen.getByRole('button', { name: /add task/i }));

  // 4. Assert on what the user SEES
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent(/server error/i);
  });
});
```

**Selectors priority (use the highest available):**
1. `getByRole` with `name` option (best — tests accessibility too)
2. `getByLabelText` (for form inputs)
3. `getByText` (for static content)
4. `getByTestId` (last resort — only for complex cases)

**Never** use `.querySelector()` or class-based selectors in tests.

## Commands

```bash
npm run dev --workspace=frontend      # start dev server on :5173
npm run test --workspace=frontend     # run tests once
npm run test:watch --workspace=frontend  # watch mode
npm run typecheck --workspace=frontend   # type-check only
npm run lint --workspace=frontend     # lint
```
