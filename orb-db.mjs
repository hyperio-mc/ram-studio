import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-orb-${Date.now()}`,
  app_name:     'ORB',
  tagline:      'AI Media Intelligence',
  archetype:    'media-analytics',
  design_url:   'https://ram.zenbin.org/orb',
  mock_url:     'https://ram.zenbin.org/orb-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'AI media intelligence dashboard — 6 screens: bento dashboard, content feed, audience demographics, AI signals, distribution calendar, settings. Dark theme with warm amber + teal on near-black. Glassmorphism cards, ambient gradient orbs.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: ORB indexed ✓');
