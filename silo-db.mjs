import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:          `heartbeat-silo-${Date.now()}`,
  app_name:    'SILO',
  tagline:     'Pantry intelligence. Meals made effortless.',
  archetype:   'food-kitchen',
  design_url:  'https://ram.zenbin.org/silo',
  mock_url:    'https://ram.zenbin.org/silo-mock',
  credit:      'RAM Design Heartbeat',
  prompt:      "Pantry management + meal planning app inspired by OWO's per-word pill typography (lapa.ninja) and Overlay's warm editorial light palette. Light theme, terracotta + forest green accents, 6 screens.",
  screens:     6,
  source:      'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SILO indexed ✓');
