/**
 * Daily typing-context generation.
 *
 * Schema (normalized):
 *   topic_table   (id int8 pk, created_at, topic_name text)
 *   context_table (id int8 pk, created_at, context text, topic_id int8 -> topic_table.id)
 *
 * For each topic in topic_table: skip if a context was already generated today,
 * otherwise generate a new passage with Gemini and insert it, keeping at most
 * 10 contexts per topic (oldest deleted first).
 *
 * Usage:
 *   GEMINI_API_KEY=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/generate-contexts.mjs
 * or put the variables in .env at the project root.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_CONTEXTS_PER_TOPIC = 10;

/** Minimal .env loader so the script runs without inline env vars (e.g. on Windows). */
function loadDotEnv() {
  try {
    const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env');
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    // No .env file — rely on process.env alone
  }
}

loadDotEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// gemini-2.0-flash has no free-tier quota anymore; override with GEMINI_MODEL if needed
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    'Missing configuration. Required: GEMINI_API_KEY, SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_KEY.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/** Start of today (UTC) — created_at >= this means "generated today". */
function todayStartIso() {
  return `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
}

async function fetchTopics() {
  const { data, error } = await supabase
    .from('topic_table')
    .select('id, topic_name')
    .order('id', { ascending: true });

  if (error) throw new Error(`Topic fetch failed: ${error.message}`);
  return data;
}

async function generateContext(topicName) {
  const prompt =
    `Write a poetic, sensory, contemplative passage about "${topicName}" for a typing practice app. ` +
    `Exactly 4-5 sentences. Vivid imagery appealing to the senses, calm and immersive tone. ` +
    `Plain text only: no markdown, no line breaks, no quotation marks around the passage. ` +
    `Example style: "Water cascades with endless power, roaring white and fierce against ancient stone. ` +
    `Mist rises like spirits, cool and refreshing against your skin."`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned no text');
  }

  // Normalize: collapse whitespace/newlines into single spaces
  return text.replace(/\s+/g, ' ').trim();
}

async function hasTodayContext(topicId) {
  const { data, error } = await supabase
    .from('context_table')
    .select('id')
    .eq('topic_id', topicId)
    .gte('created_at', todayStartIso())
    .limit(1);

  if (error) throw new Error(`Select failed: ${error.message}`);
  return data.length > 0;
}

async function enforceLimit(topicId) {
  const { count, error } = await supabase
    .from('context_table')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId);

  if (error) throw new Error(`Count failed: ${error.message}`);
  if (count === null || count < MAX_CONTEXTS_PER_TOPIC) return;

  // Delete oldest rows until one slot is free
  const toDelete = count - MAX_CONTEXTS_PER_TOPIC + 1;
  const { data: oldest, error: oldestError } = await supabase
    .from('context_table')
    .select('id')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true })
    .limit(toDelete);

  if (oldestError) throw new Error(`Oldest lookup failed: ${oldestError.message}`);

  const ids = oldest.map((row) => row.id);
  const { error: deleteError } = await supabase.from('context_table').delete().in('id', ids);
  if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);

  console.log(`  deleted ${ids.length} oldest context(s)`);
}

async function insertContext(topicId, context) {
  const { error } = await supabase.from('context_table').insert({
    topic_id: topicId,
    context,
  });
  if (error) throw new Error(`Insert failed: ${error.message}`);
}

async function main() {
  const summary = { generated: 0, skipped: 0, failed: 0 };

  try {
    const topics = await fetchTopics();
    if (topics.length === 0) {
      console.warn('topic_table is empty — nothing to generate.');
      return;
    }

    for (const topic of topics) {
      console.log(`[${topic.topic_name}]`);
      try {
        if (await hasTodayContext(topic.id)) {
          console.log('  skipped — today\'s context already exists');
          summary.skipped++;
          continue;
        }

        const context = await generateContext(topic.topic_name);
        console.log(`  generated: "${context.slice(0, 60)}..."`);

        await enforceLimit(topic.id);
        await insertContext(topic.id, context);
        console.log('  inserted');
        summary.generated++;
      } catch (error) {
        console.error(`  FAILED: ${error.message}`);
        summary.failed++;
      }
    }
  } finally {
    console.log(
      `\nDone. generated: ${summary.generated}, skipped: ${summary.skipped}, failed: ${summary.failed}`
    );
    if (summary.failed > 0) {
      process.exitCode = 1;
    }
  }
}

await main();
