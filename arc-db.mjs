import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-arc-' + Date.now(),
  status: 'done',
  app_name: 'ARC',
  tagline: 'AI Agent Orchestration Console',
  archetype: 'agent-orchestration-os',
  design_url: 'https://ram.zenbin.org/arc',
  mock_url: 'https://ram.zenbin.org/arc-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark AI agent orchestration OS with network graph pipeline visualization. Midnight/violet/teal palette.',
  screens: 6,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ Indexed ARC in design DB');
