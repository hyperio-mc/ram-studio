import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-campo-${Date.now()}`,
  app_name: 'CAMPO',
  tagline: 'Seasonal Food & Local Farm Discovery',
  archetype: 'lifestyle',
  design_url: 'https://ram.zenbin.org/campo',
  mock_url: 'https://ram.zenbin.org/campo-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Local food & farmers market discovery app — seasonal produce calendar, farm profiles, pantry tracker and shopping list. Inspired by Oryzo AI warm-palette human-first branding and land-book 2026 organic shapes + earth neutral trend. Light theme, warm cream palette.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: CAMPO indexed ✓');
