import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-fleet-${Date.now()}`,
  status:       'done',
  app_name:     'FLEET',
  tagline:      'Run your agents, not your tools.',
  archetype:    'developer-tools',
  design_url:   'https://ram.zenbin.org/fleet',
  mock_url:     'https://ram.zenbin.org/fleet-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
  prompt:       'Design FLEET — dark-theme agent orchestration platform. Space navy #080C12 + electric cyan #22D3EE. Inspired by Midday.ai agent-first SaaS and Neon.com developer aesthetic. New: radial health rings.',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
