import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-ingot-${Date.now()}`,
  app_name: 'INGOT',
  tagline: 'Wealth intelligence, redefined',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/ingot',
  mock_url: 'https://ram.zenbin.org/ingot-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Luxury editorial dark finance app. Warm charcoal + gold palette from darkmodedesign.com luxury picks. Bento grid layouts, type-first typographic metrics, asymmetric composition.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: INGOT indexed ✓');
