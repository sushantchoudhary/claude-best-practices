#!/usr/bin/env tsx
/**
 * validate-types.ts
 *
 * Agentic script: verify that frontend and backend share compatible types.
 * Usage: npm run validate:types
 *
 * This prevents the common mistake of updating types in one place
 * but not the other. Claude Code runs this after type changes.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const FRONTEND_TYPES = join(root, 'frontend/src/types/index.ts');
const BACKEND_TYPES = join(root, 'backend/src/types/index.ts');

// Types that must exist in BOTH files
const SHARED_TYPES = [
  'TaskStatus',
  'TaskPriority',
  'Task',
  'CreateTaskInput',
  'UpdateTaskInput',
  'ApiResponse',
];

function extractExportedNames(content: string): Set<string> {
  const names = new Set<string>();
  const matches = content.matchAll(/export\s+(?:type|interface|enum|const)\s+(\w+)/g);
  for (const [, name] of matches) {
    names.add(name);
  }
  return names;
}

function checkFile(path: string): Set<string> {
  if (!existsSync(path)) {
    console.error(`❌  File not found: ${path}`);
    process.exit(1);
  }
  return extractExportedNames(readFileSync(path, 'utf8'));
}

console.log('\n🔍  Validating type parity between frontend and backend\n');

const frontendTypes = checkFile(FRONTEND_TYPES);
const backendTypes = checkFile(BACKEND_TYPES);

let hasErrors = false;

for (const typeName of SHARED_TYPES) {
  const inFrontend = frontendTypes.has(typeName);
  const inBackend = backendTypes.has(typeName);
  const status = inFrontend && inBackend ? '✅' : '❌';

  console.log(`  ${status}  ${typeName}`);

  if (!inFrontend) {
    console.log(`       Missing from frontend/src/types/index.ts`);
    hasErrors = true;
  }
  if (!inBackend) {
    console.log(`       Missing from backend/src/types/index.ts`);
    hasErrors = true;
  }
}

// Check for types that exist in one but not the other
const onlyFrontend = [...frontendTypes].filter((t) => !backendTypes.has(t));
const onlyBackend = [...backendTypes].filter((t) => !frontendTypes.has(t));

if (onlyFrontend.length > 0) {
  console.log(`\n  ℹ️   Frontend-only types (OK if UI-specific):`);
  onlyFrontend.forEach((t) => console.log(`       ${t}`));
}

if (onlyBackend.length > 0) {
  console.log(`\n  ℹ️   Backend-only types (OK if server-specific):`);
  onlyBackend.forEach((t) => console.log(`       ${t}`));
}

console.log('');

if (hasErrors) {
  console.error('❌  Type parity validation failed. Sync the types and try again.\n');
  process.exit(1);
} else {
  console.log('✅  All shared types are present in both workspaces.\n');
}
