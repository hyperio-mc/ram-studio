import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-pull-${Date.now()}`,
  app_name: 'PULL',
  tagline: 'AI code review, at team velocity',
  archetype: 'developer-productivity',
  design_url: 'https://ram.zenbin.org/pull',
  mock_url: 'https://ram.zenbin.org/pull-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Heartbeat #100 — DARK theme. AI-powered code review dashboard inspired by Linear\'s minimal dark aesthetic (darkmodedesign.com) and bento grid layouts from saaspo.com.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: PULL indexed ✓');
