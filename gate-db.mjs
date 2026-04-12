import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-gate-' + Date.now(),
  status: 'done',
  app_name: 'GATE',
  tagline: 'Every merge, reviewed.',
  archetype: 'dev-tools',
  design_url: 'https://ram.zenbin.org/gate',
  mock_url: 'https://ram.zenbin.org/gate-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI code quality gate and PR intelligence tool for developer teams. Dark theme inspired by Neon.com and Midday.ai.',
  screens: 4,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
