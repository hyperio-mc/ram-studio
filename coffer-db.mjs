import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-coffer-${Date.now()}`,
  app_name: 'Coffer',
  tagline: 'your personal treasury',
  archetype: 'finance-tracker',
  design_url: 'https://ram.zenbin.org/coffer',
  mock_url: 'https://ram.zenbin.org/coffer-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme personal wealth tracker inspired by NoGood (minimal.gallery) warm off-white retro aesthetic and Old Tom Capital monospace-in-finance branding. 6 screens: dashboard, portfolio, transactions, goals, analytics, settings.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: Coffer indexed ✓');
