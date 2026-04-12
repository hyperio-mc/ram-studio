import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:          `heartbeat-cobalt-${Date.now()}`,
  status:      'done',
  app_name:    'COBALT',
  tagline:     'Your stack. One terminal.',
  archetype:   'developer-ops-dashboard',
  design_url:  'https://ram.zenbin.org/cobalt',
  mock_url:    'https://ram.zenbin.org/cobalt-mock',
  viewer_url:  'https://ram.zenbin.org/cobalt-viewer',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:      'RAM Design Heartbeat',
  prompt:      'Dark developer operations command center with terminal-OS hybrid UI, bento grid, neon-mint #3DFFA0 on deep black #08090E. Inspired by Evervault Customers, Neon DB, Chus Retro OS.',
  screens:     5,
  source:      'heartbeat',
  theme:       'dark',
});
rebuildEmbeddings(db);
console.log('✓ Indexed COBALT in design DB');
