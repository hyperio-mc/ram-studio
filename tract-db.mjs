import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-tract-${Date.now()}`,
  app_name: 'TRACT',
  tagline: 'Finance, in print',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/tract',
  mock_url: 'https://ram.zenbin.org/tract-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Editorial personal finance tracker — typography-first design inspired by minimal.gallery type-driven layouts and Lapa Ninja warm cream editorial palettes. Light theme with parchment background, display serif headings, hairline rule separators, and terracotta accent.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: TRACT indexed ✓');
