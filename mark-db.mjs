import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-mark-${Date.now()}`,
  app_name: 'MARK',
  tagline: 'Freelance Time & Billing',
  archetype: 'productivity',
  design_url: 'https://ram.zenbin.org/mark',
  mock_url: 'https://ram.zenbin.org/mark-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Freelance time tracking and billing app. Light theme — Land-book deep teal #017C6E on warm cream #FAF9F6. Mobbin\'s floating glassmorphic pill tab bar pattern. Siteinspire editorial restraint (no shadows, depth via bg shifts). Project color-coded left borders. Screens: Today (active timer + project cards), Projects (budget progress), Timer (large display + controls), Log (timeline view), Invoice (full invoice builder), Reports (weekly bar chart + by-project breakdown).',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: MARK indexed ✓');
