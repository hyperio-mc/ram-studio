import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-rove-${Date.now()}`,
  app_name: 'ROVE',
  tagline: 'Slow travel, beautifully remembered',
  archetype: 'travel-journaling',
  design_url: 'https://ram.zenbin.org/rove',
  mock_url: 'https://ram.zenbin.org/rove-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Design a slow travel journaling app with warm editorial light theme, bold serif typography, and terracotta accent — inspired by minimal.gallery warm neo-minimalism and saaspo.com bold serif authority trend.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: ROVE indexed ✓');
