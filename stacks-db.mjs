import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-stacks-${Date.now()}`,
  app_name: 'STACKS',
  tagline: 'Read deeply, track beautifully',
  archetype: 'reading-tracker',
  design_url: 'https://ram.zenbin.org/stacks',
  mock_url: 'https://ram.zenbin.org/stacks-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Personal reading stack & book intelligence app — warm editorial light inspired by Litbix and KOMETA Typefaces on minimal.gallery. Serif-forward, terracotta accent, parchment palette.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: STACKS indexed ✓');
