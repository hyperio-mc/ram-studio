import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-pared-${Date.now()}`,
  app_name: 'PARED',
  tagline: 'personal finance, stripped bare',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/pared',
  mock_url: 'https://ram.zenbin.org/pared-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Minimal personal finance tracker inspired by Minimal Gallery / ProtoEditions — warm off-white, single lime accent, editorial restraint, barely-there UI philosophy',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: PARED indexed ✓');
