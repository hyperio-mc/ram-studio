import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-solv-${Date.now()}`,
  app_name: 'SOLV',
  tagline: "Know when you'll get paid",
  archetype: 'freelance-finance',
  design_url: 'https://ram.zenbin.org/solv',
  mock_url: 'https://ram.zenbin.org/solv-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Freelance cash flow intelligence app with payment risk scoring, runway forecasting, and client reliability scores. Dark elevation-based UI inspired by DarkModeDesign.com and trust-first design from Land-book.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SOLV indexed ✓');
