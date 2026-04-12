import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-parch-${Date.now()}`,
  app_name: 'PARCH',
  tagline: 'Your reading life, beautifully kept',
  archetype: 'reading-tracker',
  design_url: 'https://ram.zenbin.org/parch',
  mock_url: 'https://ram.zenbin.org/parch-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Heartbeat #48: Light-theme reading tracker / personal library companion. Warm parchment editorial palette with book spine library, reading session tracker, highlights collection, curated reading lists, year-in-books stats, and reader profile.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: PARCH indexed ✓');
