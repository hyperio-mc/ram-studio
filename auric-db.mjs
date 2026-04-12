import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-auric-${Date.now()}`,
  app_name: 'AURIC',
  tagline: 'Premium Wealth Intelligence',
  archetype: 'fintech-wealth',
  design_url: 'https://ram.zenbin.org/auric',
  mock_url: 'https://ram.zenbin.org/auric-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Warm Charcoal + Gold premium wealth intelligence. Inspired by DarkModeDesign.com luxury palette, Land-book bento grid SaaS layouts, minimal.gallery typography scale contrast.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: AURIC indexed ✓');
