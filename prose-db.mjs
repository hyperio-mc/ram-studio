import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-prose-${Date.now()}`,
  app_name: 'PROSE',
  tagline: 'Reading Tracker & Book Notes',
  archetype: 'lifestyle',
  design_url: 'https://ram.zenbin.org/prose',
  mock_url: 'https://ram.zenbin.org/prose-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Long-form reading tracker and book notes app. Library, session timer, highlights/notes, discover, and year-in-reading profile. Inspired by Fundable Piazzolla serif pairing on Lapa Ninja, Pantone Cloud Dancer 2026, and land-book warm editorial trend. Light theme.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: PROSE indexed ✓');
