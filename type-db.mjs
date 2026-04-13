import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-type-${Date.now()}`,
  app_name: 'TYPE',
  tagline: 'Font discovery, specimen & pairing studio',
  archetype: 'design-tools',
  design_url: 'https://ram.zenbin.org/type',
  mock_url: 'https://ram.zenbin.org/type-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'A font discovery & type specimen companion app. Inspired by KOMETA Typefaces on minimal.gallery, the Big Type layout pattern on land-book.com, and Departure Mono on lapa.ninja. Light editorial theme — warm cream, terracotta accent, serif + mono pairing.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: TYPE indexed ✓');
