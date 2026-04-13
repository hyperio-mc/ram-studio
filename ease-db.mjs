import { openDB, upsertDesign } from './design-db.mjs';
const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-ease-${Date.now()}`,
  app_name: 'EASE',
  tagline: 'Recovery-Aware Training Companion',
  archetype: 'fitness-recovery',
  design_url: 'https://ram.zenbin.org/ease',
  mock_url: 'https://ram.zenbin.org/ease-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Recovery-aware training companion. Light theme — warm parchment #F6F3EE, terracotta #C4623C accent. Rest is data, not a gap in your log. Inspired by Gentler Streak (Apple Design Award 2026), Siteinspire warm mineral palette, NNGroup Handmade Designs. Readiness score as primary metric, one-question check-in, body muscle recovery map, 30-day pattern insights. 6 screens: Today, Log, Trends, Train, Body, Insights.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: EASE indexed ✓');
