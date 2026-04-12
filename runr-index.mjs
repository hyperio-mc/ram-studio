import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const entry = {
  id:           `heartbeat-runr-agent-${Date.now()}`,
  status:       'done',
  app_name:     'RUNR',
  tagline:      'Your agents, in production.',
  archetype:    'ai-runtime-platform',
  design_url:   'https://ram.zenbin.org/runr-agent',
  mock_url:     'https://ram.zenbin.org/runr-agent-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark-theme AI agent runtime dashboard. Inspired by Land-book trend Codegen OS for Code Agents and DarkModeDesign gallery. Near-black bg, teal accent, monospace typography. 5 screens: Fleet, Live trace, Traces, Logs, Keys.',
  screens:      5,
  source:       'heartbeat',
};

upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB:', entry.app_name);
