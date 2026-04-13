import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-graze-${Date.now()}`,
  app_name: 'GRAZE',
  tagline: 'Eat with intention',
  archetype: 'food-lifestyle',
  design_url: 'https://ram.zenbin.org/graze',
  mock_url: 'https://ram.zenbin.org/graze-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by minimal.gallery warm neutral palette trend (2026) and land-book asymmetric bento grid layouts. Meal discovery app with editorial serif typography, linen-tone backgrounds, terracotta/sage accent pair, and bento meal cards.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: GRAZE indexed ✓');
