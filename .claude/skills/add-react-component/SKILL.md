# Skill: Add React Component

Use this skill when asked to create a new React component in the frontend.

## Decision: Component vs Hook

Before creating a component, decide:
- **Component** — renders UI, receives props, calls hooks. Goes in `frontend/src/components/`.
- **Hook** — contains stateful logic or side effects, no JSX. Goes in `frontend/src/hooks/`. Name must start with `use`.

## Step-by-Step Process

### 1. Create the component file

`frontend/src/components/MyComponent.tsx`:

```typescript
// Props interface is always named ComponentNameProps
interface MyComponentProps {
  value: string;
  onAction: (id: string) => void;
  // Optional props use ?
  label?: string;
}

export function MyComponent({ value, onAction, label = 'Default' }: MyComponentProps) {
  // Hooks at the top (rules of hooks)
  const [localState, setLocalState] = useState(false);

  // Derived state — no useEffect for this
  const displayValue = value.trim() || 'Empty';

  // Handlers — useCallback if passed to children
  const handleClick = () => onAction(value);

  return (
    <div className="my-component" data-testid="my-component">
      <span className="my-component__label">{label}</span>
      <span className="my-component__value">{displayValue}</span>
      <button onClick={handleClick} aria-label={`Action for ${displayValue}`}>
        Go
      </button>
    </div>
  );
}
```

### 2. Add CSS (in styles.css)

Add BEM-style classes at the bottom of `frontend/src/styles.css`:

```css
/* ─── MyComponent ────────────────────────────────────────────── */
.my-component {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* Use design tokens — never hardcode colours */
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
}

.my-component__label {
  font-size: 0.75rem;
  color: var(--text-2);
  font-family: var(--font-mono);
}
```

### 3. Write tests

`frontend/src/tests/MyComponent.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../components/MyComponent.js';

describe('MyComponent', () => {
  const onAction = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('renders with required props', () => {
    render(<MyComponent value="test" onAction={onAction} />);
    expect(screen.getByTestId('my-component')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', async () => {
    const user = userEvent.setup();
    render(<MyComponent value="hello" onAction={onAction} />);
    await user.click(screen.getByRole('button'));
    expect(onAction).toHaveBeenCalledWith('hello');
  });

  it('shows default label when none provided', () => {
    render(<MyComponent value="x" onAction={onAction} />);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });
});
```

### 4. Export from the right place

If this is a reusable component used in more than one place, import it by path — no barrel exports needed in this project.

### 5. Verify

```bash
npm run typecheck --workspace=frontend
npm run test --workspace=frontend
```

Both must pass.

## Checklist

- [ ] Props interface named `ComponentNameProps`
- [ ] Named export (not default)
- [ ] `data-testid` on root element
- [ ] `aria-label` on all interactive elements
- [ ] CSS uses design tokens (`var(--text)`, not `#333`)
- [ ] Test file exists at `frontend/src/tests/ComponentName.test.tsx`
- [ ] TypeScript compiles with no errors
