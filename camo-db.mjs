import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id:           `heartbeat-camo-${Date.now()}`,
  app_name:     'CAMO',
  tagline:      'Go dark. Stay invisible.',
  archetype:    'privacy-security',
  design_url:   'https://ram.zenbin.org/camo',
  mock_url:     'https://ram.zenbin.org/camo-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark-theme personal privacy & digital exposure monitor. Inspired by Orbit ML Monitoring warm dark clinical aesthetic + grotesque+monospace data precision pairing. Warm dark teal palette, semantic green/coral for safe/threat states, bento grid overview.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: CAMO indexed ✓');
