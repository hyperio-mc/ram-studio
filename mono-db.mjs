import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-mono-${Date.now()}`,
  app_name:   'MONO',
  tagline:    'numbers stripped bare',
  archetype:  'personal-finance',
  design_url: 'https://ram.zenbin.org/mono',
  mock_url:   'https://ram.zenbin.org/mono-mock',
  credit:     'RAM Design Heartbeat',
  prompt:     'Personal finance tracker — pure monochromatic dark palette, zero color accent, alternating solid/hollow typography inspired by Uptec on DarkModeDesign.com, geometric grid scaffolding, ghost oversized numbers as background texture.',
  screens:    6,
  source:     'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: MONO indexed ✓');
