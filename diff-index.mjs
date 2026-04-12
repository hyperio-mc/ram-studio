import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-diff-${Date.now()}`,
  status: 'done',
  app_name: 'DIFF',
  tagline: 'Every merge, made smarter.',
  archetype: 'developer-tools-ai',
  design_url: 'https://ram.zenbin.org/diff',
  mock_url: 'https://ram.zenbin.org/diff-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-native pull request intelligence dashboard. Dark theme. Linear/Codex-inspired agent activity feed. Deep violet + teal palette.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed DIFF in design DB');
