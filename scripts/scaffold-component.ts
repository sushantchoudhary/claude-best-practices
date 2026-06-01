#!/usr/bin/env tsx
/**
 * scaffold-component.ts
 *
 * Agentic script: create a new typed React component + test file.
 * Usage: npm run scaffold:component -- MyComponent
 *
 * Claude Code can run this autonomously when asked to create a new component.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const name = process.argv[2];

if (!name) {
  console.error('❌  Usage: npm run scaffold:component -- ComponentName');
  process.exit(1);
}

if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) {
  console.error('❌  Component name must be PascalCase (e.g., TaskCard, UserProfile)');
  process.exit(1);
}

const componentDir = join(__dirname, '../frontend/src/components');
const testDir = join(__dirname, '../frontend/src/tests');

[componentDir, testDir].forEach((d) => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
});

const componentPath = join(componentDir, `${name}.tsx`);
const testPath = join(testDir, `${name}.test.tsx`);

if (existsSync(componentPath)) {
  console.error(`❌  Component already exists: ${componentPath}`);
  process.exit(1);
}

// ─── Component template ───────────────────────────────────────────────
const componentTemplate = `interface ${name}Props {
  // TODO: define props
}

export function ${name}({}: ${name}Props) {
  return (
    <div className="${name.toLowerCase()}">
      {/* TODO: implement ${name} */}
      <h2>${name}</h2>
    </div>
  );
}
`;

// ─── Test template ────────────────────────────────────────────────────
const testTemplate = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${name} } from '../components/${name}.js';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    // TODO: add meaningful assertions
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
`;

writeFileSync(componentPath, componentTemplate);
writeFileSync(testPath, testTemplate);

console.log(`✅  Created component: frontend/src/components/${name}.tsx`);
console.log(`✅  Created test:      frontend/src/tests/${name}.test.tsx`);
console.log('');
console.log(`Next steps:`);
console.log(`  1. Edit the component:  ${componentPath}`);
console.log(`  2. Edit the test:       ${testPath}`);
console.log(`  3. Run tests:           npm test --workspace=frontend`);
