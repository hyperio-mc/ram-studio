import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-chalk-${Date.now()}`,
  app_name: 'CHALK',
  tagline: 'Think in long form',
  archetype: 'editorial-knowledge',
  design_url: 'https://ram.zenbin.org/chalk',
  mock_url: 'https://ram.zenbin.org/chalk-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Editorial knowledge app inspired by minimal.gallery Kinfolk-effect editorial pacing + lapa.ninja serif typography revival + saaspo.com bento grid feature trend. Light theme: warm cream, terracotta single accent, Georgia serif headlines.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: CHALK indexed ✓');
