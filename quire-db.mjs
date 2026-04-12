import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-quire-${Date.now()}`,
  app_name: 'Quire',
  tagline: 'Read what matters',
  archetype: 'editorial-reader',
  design_url: 'https://ram.zenbin.org/quire',
  mock_url: 'https://ram.zenbin.org/quire-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Curated editorial reading app with content-driven contextual colour per topic. Inspired by Deem Journal on Siteinspire (Big Type, contextual palette) and KOMETA Typefaces on minimal.gallery.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: Quire indexed ✓');
