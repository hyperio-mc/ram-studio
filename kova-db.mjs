import { openDB, upsertDesign } from './design-db.mjs';

const SLUG = 'kova';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  app_name: 'KOVA',
  tagline: 'Wealth Intelligence',
  archetype: 'finance-wealth',
  design_url: `https://ram.zenbin.org/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark theme premium wealth intelligence platform. Inspired by DarkModeDesign.com luxury Warm Charcoal + Gold palette and Saaspo bento-grid hegemony trend. Portfolio overview, markets watchlist, AI insights, activity log, account settings, equity detail — 6 screens.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: KOVA indexed ✓');
