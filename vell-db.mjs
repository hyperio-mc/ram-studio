import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-vell-${Date.now()}`,
  app_name: 'VELL',
  tagline: 'Your money, clearly annotated',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/vell',
  mock_url: 'https://ram.zenbin.org/vell-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme personal finance app inspired by Minimal Gallery warm off-white palettes and Land-Book annotation-style UI (hand-drawn underlines on key numbers, Ellipsus influence). Persimmon accent on vellum backgrounds.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: VELL indexed ✓');
