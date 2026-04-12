import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-carte-${Date.now()}`,
  app_name: 'CARTE',
  tagline: 'Think in layers',
  archetype: 'research-notebook',
  design_url: 'https://ram.zenbin.org/carte',
  mock_url: 'https://ram.zenbin.org/carte-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'AI editorial research notebook with warm cream editorial palette, serif revival typography, and bento-style features. Inspired by minimal.gallery serif revival trend and land-book.com AI-native product category.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: CARTE indexed ✓');
