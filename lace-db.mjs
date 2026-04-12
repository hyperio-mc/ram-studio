import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-lace-${Date.now()}`,
  app_name: 'LACE',
  tagline: 'Creative studio operations, elegantly structured',
  archetype: 'creative-ops',
  design_url: 'https://ram.zenbin.org/lace',
  mock_url: 'https://ram.zenbin.org/lace-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme creative studio operations platform. Bento card dashboard layout (Land-book 2026 trend), silent luxury warm cream palette (Minimal.gallery), editorial serif typography as SaaS differentiator (Saaspo). 6 screens: bento dashboard, projects list, client report view, team workload map, studio insights, work-for-review presentation.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: LACE indexed ✓');
