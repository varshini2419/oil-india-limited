// Jev typed-decision client for the Baghewala coding workflow.
//
// Jev (TypeSafe AI) is a decision-only model: it returns typed judgments
// (Choice / Score / Noul) about a state — never text. It does NOT write code,
// run commands, or touch the filesystem. The coding agent keeps all
// permissions and side effects; Jev only supplies the typed judgment.
//
// Route: OpenRouter Decisions API, model typesafe/jev-1.13
// Auth:  OPENROUTER_API_KEY env var, or the key file ~/.jev/openrouter_key
//        (never a file inside this repo, never committed)
//
// Usage:
//   node .agents/skills/jev-agent/jev-client.mjs '<request-json>'
//   node .agents/skills/jev-agent/jev-client.mjs --check
//
// Programmatic:
//   import { jevDecision } from './jev-client.mjs';

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const DEFAULT_ENDPOINT = 'https://openrouter.ai/api/alpha/decisions';
const DEFAULT_MODEL = 'typesafe/jev-1.13';

/** Locate the API key without ever logging its value. */
export function loadApiKey() {
  if (process.env.OPENROUTER_API_KEY) {
    return { key: process.env.OPENROUTER_API_KEY, source: 'env:OPENROUTER_API_KEY' };
  }
  const keyFile = join(homedir(), '.jev', 'openrouter_key');
  if (existsSync(keyFile)) {
    return { key: readFileSync(keyFile, 'utf8').trim(), source: `file:${keyFile}` };
  }
  return { key: null, source: null };
}

/**
 * Ask Jev one or more typed questions about one state.
 * questions: { name: { type: 'choice'|'score'|'noul', instructions, criteria } }
 * Returns the parsed answers object; throws on HTTP/auth errors.
 */
export async function jevDecision({ state, questions, model = DEFAULT_MODEL, endpoint = DEFAULT_ENDPOINT }) {
  const { key, source } = loadApiKey();
  if (!key) {
    throw new Error(
      'No API key found. Set OPENROUTER_API_KEY or create ~/.jev/openrouter_key (chmod 600). Never paste the key into chat or Git.'
    );
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, state, questions }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Jev decision call failed: HTTP ${response.status} — ${detail}`);
  }

  const result = await response.json();
  return { answers: result.answers, usage: result.usage, keySource: source, model: result.model };
}

/** Friendly typed-answer summary (safe to print: values only, no secrets). */
export function summarize(answers) {
  return Object.fromEntries(
    Object.entries(answers).map(([name, a]) => {
      if (a.type === 'noul') return [name, { yesProbability: a.noul }];
      if (a.type === 'choice') return [name, { choice: a.choice, confidence: a.confidence }];
      if (a.type === 'score') return [name, { score: a.score, confidence: a.confidence }];
      return [name, a];
    })
  );
}

// ---- CLI mode ------------------------------------------------------------
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());

if (isMain) {
  const arg = process.argv[2];
  if (!arg || arg === '--check') {
    const { key, source } = loadApiKey();
    if (key) {
      console.log(`AUTH OK — key loaded from ${source} (length ${key.length}, not displayed)`);
    } else {
      console.log('AUTH MISSING — set OPENROUTER_API_KEY or create ~/.jev/openrouter_key');
      process.exit(1);
    }
    process.exit(0);
  }

  try {
    const request = JSON.parse(arg);
    const { answers, usage, keySource, model } = await jevDecision(request);
    console.log(JSON.stringify({ model, keySource, answers: summarize(answers), usage }, null, 2));
  } catch (error) {
    console.error(`JEV ERROR: ${error.message}`);
    process.exit(1);
  }
}
