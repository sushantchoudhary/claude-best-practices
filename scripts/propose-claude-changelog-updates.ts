#!/usr/bin/env tsx
/**
 * propose-claude-changelog-updates.ts
 *
 * Agentic script: scrape the latest Claude Code changelog and generate a
 * project-specific proposal for updates relevant to this repository.
 *
 * Usage:
 *   npm run propose:claude-updates
 *   npm run propose:claude-updates -- --latest 12
 *   npm run propose:claude-updates -- --input uploads/CHANGELOG-0.md
 *   npm run propose:claude-updates -- --json
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const DEFAULT_CHANGELOG_URL =
  'https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md';
const DEFAULT_OUTPUT = join(
  root,
  'docs/proposals/claude-changelog-update-proposal.md'
);

type Priority = 'high' | 'medium' | 'low';

interface CliOptions {
  inputPath?: string;
  outputPath: string;
  latestReleases: number;
  jsonOnly: boolean;
  minScore: number;
}

interface ReleaseEntry {
  version: string;
  bullets: string[];
}

interface ScoredChange {
  version: string;
  bullet: string;
  score: number;
  matchedThemes: string[];
}

interface Recommendation {
  change: string;
  whyRelevantHere: string;
  recommendedRepoUpdate: string;
  targetFiles: string[];
  priority: Priority;
  evidence: string[];
}

interface ProposalResult {
  generatedAt: string;
  source: string;
  scannedReleaseCount: number;
  scannedChangeCount: number;
  includedChangeCount: number;
  topRecommendations: Recommendation[];
  ignoredChangeCategories: string[];
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    outputPath: DEFAULT_OUTPUT,
    latestReleases: 12,
    jsonOnly: false,
    minScore: 3,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--input') {
      opts.inputPath = argv[i + 1];
      i += 1;
    } else if (arg === '--output') {
      opts.outputPath = resolvePath(argv[i + 1]);
      i += 1;
    } else if (arg === '--latest') {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error('--latest must be a positive integer');
      }
      opts.latestReleases = Math.floor(value);
      i += 1;
    } else if (arg === '--min-score') {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error('--min-score must be a non-negative number');
      }
      opts.minScore = value;
      i += 1;
    } else if (arg === '--json') {
      opts.jsonOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelpAndExit();
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return opts;
}

function resolvePath(input?: string): string {
  if (!input) return '';
  if (input.startsWith('/')) return input;
  return join(root, input);
}

function printHelpAndExit(): never {
  console.log(`
Usage:
  npm run propose:claude-updates [-- --latest 12] [--input <path>] [--output <path>] [--json]

Options:
  --input <path>      Read changelog markdown from a local file
  --output <path>     Write markdown proposal to this file
  --latest <n>        Number of latest releases to scan (default: 12)
  --min-score <n>     Minimum relevance score to include a change (default: 3)
  --json              Print machine-readable JSON to stdout
  --help, -h          Show this help message
`.trim());
  process.exit(0);
}

async function loadChangelog(inputPath?: string): Promise<{ content: string; source: string }> {
  if (inputPath) {
    const full = resolvePath(inputPath);
    return { content: readFileSync(full, 'utf8'), source: full };
  }

  const response = await fetch(DEFAULT_CHANGELOG_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch changelog: HTTP ${response.status}`);
  }

  return { content: await response.text(), source: DEFAULT_CHANGELOG_URL };
}

function parseReleases(markdown: string): ReleaseEntry[] {
  const lines = markdown.split(/\r?\n/);
  const releases: ReleaseEntry[] = [];
  let current: ReleaseEntry | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const versionMatch = /^##\s+([0-9]+\.[0-9]+\.[0-9]+)\s*$/.exec(line);
    if (versionMatch) {
      if (current) releases.push(current);
      current = { version: versionMatch[1], bullets: [] };
      continue;
    }

    if (!current) continue;
    if (line.startsWith('- ')) {
      current.bullets.push(line.slice(2).trim());
    }
  }

  if (current) releases.push(current);
  return releases;
}

const THEME_WEIGHTS: Array<{
  theme: string;
  weight: number;
  patterns: RegExp[];
}> = [
  {
    theme: 'agents_workflows',
    weight: 4,
    patterns: [
      /\bclaude agents?\b/i,
      /\bworkflow(s)?\b/i,
      /\bsubagent(s)?\b/i,
      /\bbackground session(s)?\b/i,
    ],
  },
  {
    theme: 'skills_plugins',
    weight: 4,
    patterns: [/\bskills?\b/i, /\bplugin(s)?\b/i, /\/reload-skills/i],
  },
  {
    theme: 'hooks_automation',
    weight: 3,
    patterns: [/\bhook(s)?\b/i, /\bSessionStart\b/i, /\bMessageDisplay\b/i],
  },
  {
    theme: 'safety_permissions',
    weight: 4,
    patterns: [/\bpermission(s)?\b/i, /\bsandbox(ed)?\b/i, /\bworktree\b/i, /\bsecurity\b/i],
  },
  {
    theme: 'mcp',
    weight: 3,
    patterns: [/\bMCP\b/i, /\.mcp\.json/i],
  },
  {
    theme: 'model_effort_fallback',
    weight: 3,
    patterns: [/\bmodel\b/i, /\/effort/i, /\bfallback-model\b/i, /\bOpus 4\.8\b/i],
  },
  {
    theme: 'review_quality',
    weight: 3,
    patterns: [/\/code-review/i, /\/simplify/i, /\btypecheck\b/i, /\btest(s)?\b/i],
  },
];

const DEEMPHASIS_PATTERNS: Array<{ reason: string; penalty: number; pattern: RegExp }> = [
  { reason: 'internal_only', penalty: 8, pattern: /internal infrastructure improvements/i },
  { reason: 'pure_ui_polish', penalty: 3, pattern: /\bspinner|fullscreen|rendering|theme|clipboard\b/i },
  { reason: 'os_specific', penalty: 2, pattern: /\bwindows|wsl|gnome|iterm|terminal\.app\b/i },
  { reason: 'provider_specific', penalty: 2, pattern: /\bbedrock|vertex|foundry\b/i },
];

function scoreChange(version: string, bullet: string): ScoredChange {
  let score = 0;
  const matchedThemes = new Set<string>();

  for (const theme of THEME_WEIGHTS) {
    if (theme.patterns.some((p) => p.test(bullet))) {
      score += theme.weight;
      matchedThemes.add(theme.theme);
    }
  }

  for (const rule of DEEMPHASIS_PATTERNS) {
    if (rule.pattern.test(bullet)) {
      score -= rule.penalty;
    }
  }

  return {
    version,
    bullet,
    score,
    matchedThemes: [...matchedThemes],
  };
}

function priorityForScore(score: number): Priority {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

function buildRecommendation(scored: ScoredChange): Recommendation {
  const lower = scored.bullet.toLowerCase();
  const targetFiles = new Set<string>();
  const actions: string[] = [];
  const reasons: string[] = [];

  targetFiles.add('.claude/settings.json');
  targetFiles.add('CLAUDE.md');

  if (lower.includes('/reload-skills') || lower.includes('skills')) {
    reasons.push('This repo relies heavily on local skills and slash commands for demo workflows.');
    actions.push(
      'Update docs to include when to use `/reload-skills` and clarify how local `.claude/skills` are auto-discovered.'
    );
    targetFiles.add('.claude/commands/add-feature.md');
  }

  if (lower.includes('/code-review') || lower.includes('/simplify')) {
    reasons.push('The project exposes `/review` and quality gates as core Claude Code practices.');
    actions.push(
      'Refresh review command docs to reflect current `/code-review` and `/simplify` behavior and avoid stale semantics.'
    );
    targetFiles.add('.claude/commands/review.md');
  }

  if (lower.includes('fallback-model') || lower.includes('model') || lower.includes('/effort')) {
    reasons.push('Stable model defaults and fallback behavior improve repeatability for humans and agents.');
    actions.push(
      'Align model guidance with latest Claude defaults and add explicit fallback-model guidance in project docs/config examples.'
    );
  }

  if (
    lower.includes('permission') ||
    lower.includes('sandbox') ||
    lower.includes('worktree') ||
    lower.includes('security')
  ) {
    reasons.push('This repository demonstrates safe autonomous execution via hooks and permission policies.');
    actions.push(
      'Harden `.claude/settings.json` allow/deny examples and document safer command patterns based on recent sandbox/permission fixes.'
    );
  }

  if (lower.includes('workflow') || lower.includes('claude agents') || lower.includes('subagent')) {
    reasons.push('Agent orchestration is central to the project’s teaching goals.');
    actions.push(
      'Add a short “when to use agent view / workflows” note in docs and keep prompts aligned to background-agent best practices.'
    );
  }

  if (lower.includes('mcp')) {
    reasons.push('The repo already uses MCP and should keep server approval/config guidance current.');
    actions.push('Update MCP guidance with strict config/approval expectations and relevant troubleshooting notes.');
  }

  if (actions.length === 0) {
    actions.push('Review this change and confirm whether project docs/config should be updated for consistency.');
    reasons.push('The change intersects Claude runtime behavior used by this repository.');
  }

  return {
    change: `${scored.version}: ${scored.bullet}`,
    whyRelevantHere: reasons[0],
    recommendedRepoUpdate: actions[0],
    targetFiles: [...targetFiles],
    priority: priorityForScore(scored.score),
    evidence: [
      `Matched themes: ${scored.matchedThemes.join(', ') || 'none'}`,
      `Relevance score: ${scored.score}`,
    ],
  };
}

function buildIgnoredCategories(): string[] {
  return [
    'Internal-only release notes with no user-facing behavior',
    'Pure UI/terminal rendering polish that does not change repo workflows',
    'OS-specific or provider-specific fixes with no actionable project update',
  ];
}

function toMarkdown(result: ProposalResult): string {
  const lines: string[] = [];
  lines.push('# Claude Code Changelog Update Proposal');
  lines.push('');
  lines.push(`Generated: ${result.generatedAt}`);
  lines.push(`Source: ${result.source}`);
  lines.push('');
  lines.push('## Scan Summary');
  lines.push('');
  lines.push(`- Releases scanned: ${result.scannedReleaseCount}`);
  lines.push(`- Changelog items scanned: ${result.scannedChangeCount}`);
  lines.push(`- Relevant items included: ${result.includedChangeCount}`);
  lines.push('');
  lines.push('## Top Recommendations');
  lines.push('');

  if (result.topRecommendations.length === 0) {
    lines.push('- No items passed the relevance threshold. Consider lowering `--min-score`.');
    lines.push('');
  } else {
    result.topRecommendations.forEach((rec, idx) => {
      lines.push(`### ${idx + 1}. ${rec.change}`);
      lines.push('');
      lines.push(`- Priority: ${rec.priority}`);
      lines.push(`- Why relevant here: ${rec.whyRelevantHere}`);
      lines.push(`- Recommended repo update: ${rec.recommendedRepoUpdate}`);
      lines.push(`- Target files: ${rec.targetFiles.map((f) => `\`${f}\``).join(', ')}`);
      lines.push(`- Evidence: ${rec.evidence.join(' | ')}`);
      lines.push('');
    });
  }

  lines.push('## Ignored Change Categories');
  lines.push('');
  result.ignoredChangeCategories.forEach((category) => {
    lines.push(`- ${category}`);
  });
  lines.push('');
  lines.push('## Suggested Next Step');
  lines.push('');
  lines.push(
    '- Apply the high-priority recommendations first, then re-run this tool after each major Claude Code release.'
  );
  lines.push('');
  return lines.join('\n');
}

function printConsoleSummary(result: ProposalResult): void {
  console.log('\n📌 Claude Changelog Proposal');
  console.log(`   Source: ${result.source}`);
  console.log(`   Releases scanned: ${result.scannedReleaseCount}`);
  console.log(`   Relevant updates: ${result.includedChangeCount}`);
  if (result.topRecommendations.length > 0) {
    console.log('\nTop recommendations:');
    result.topRecommendations.slice(0, 5).forEach((rec, index) => {
      console.log(` ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.change}`);
    });
  }
  console.log('');
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const loaded = await loadChangelog(options.inputPath);
  const releases = parseReleases(loaded.content).slice(0, options.latestReleases);
  const scored = releases.flatMap((release) =>
    release.bullets.map((bullet) => scoreChange(release.version, bullet))
  );
  const selected = scored
    .filter((item) => item.score >= options.minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const recommendations = selected.map(buildRecommendation);
  const result: ProposalResult = {
    generatedAt: new Date().toISOString(),
    source: loaded.source,
    scannedReleaseCount: releases.length,
    scannedChangeCount: scored.length,
    includedChangeCount: recommendations.length,
    topRecommendations: recommendations,
    ignoredChangeCategories: buildIgnoredCategories(),
  };

  if (options.jsonOnly) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const markdown = toMarkdown(result);
  mkdirSync(dirname(options.outputPath), { recursive: true });
  writeFileSync(options.outputPath, markdown, 'utf8');

  printConsoleSummary(result);
  console.log(`✅ Proposal written: ${options.outputPath}`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`❌ Failed to generate proposal: ${message}`);
  process.exit(1);
});
