#!/usr/bin/env tsx
/**
 * audit-tests.ts
 *
 * Agentic script: find source files that don't have a corresponding test.
 * Usage: npm run audit:tests
 *
 * Claude Code can run this to identify coverage gaps.
 */

import { readdirSync, existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

type Workspace = 'frontend' | 'backend';

interface AuditResult {
  workspace: Workspace;
  file: string;
  hasTest: boolean;
  testPath: string;
}

function getFiles(dir: string, ext: string[]): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getFiles(full, ext));
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function auditWorkspace(workspace: Workspace): AuditResult[] {
  const srcDir =
    workspace === 'frontend'
      ? join(root, 'frontend/src')
      : join(root, 'backend/src');
  const testDir =
    workspace === 'frontend'
      ? join(root, 'frontend/src/tests')
      : join(root, 'backend/tests');

  const exts =
    workspace === 'frontend' ? ['.tsx', '.ts'] : ['.ts'];

  const skipPatterns = [
    'index.ts',
    'main.tsx',
    'setup.ts',
    'fixtures.ts',
    '/tests/',
    '/types/',
  ];

  const sourceFiles = getFiles(srcDir, exts).filter(
    (f) => !skipPatterns.some((p) => f.includes(p))
  );

  return sourceFiles.map((file) => {
    const name = basename(file).replace(/\.(tsx?|jsx?)$/, '');
    const testPath = join(testDir, `${name}.test.${file.endsWith('.tsx') ? 'tsx' : 'ts'}`);
    return {
      workspace,
      file: file.replace(root + '/', ''),
      hasTest: existsSync(testPath),
      testPath: testPath.replace(root + '/', ''),
    };
  });
}

const results = [...auditWorkspace('frontend'), ...auditWorkspace('backend')];
const untested = results.filter((r) => !r.hasTest);
const tested = results.filter((r) => r.hasTest);

console.log('\n📊  Test Coverage Audit\n');
console.log(`   Tested:   ${tested.length} / ${results.length} files`);
console.log(
  `   Coverage: ${Math.round((tested.length / results.length) * 100)}%\n`
);

if (untested.length === 0) {
  console.log('✅  All source files have tests!\n');
} else {
  console.log(`⚠️   ${untested.length} file(s) without tests:\n`);
  for (const r of untested) {
    console.log(`   [${r.workspace}] ${r.file}`);
    console.log(`           → missing: ${r.testPath}`);
  }
  console.log('');
  console.log('Run `npm run scaffold:component -- <Name>` to generate a test template.');
}
