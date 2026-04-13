import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-hale-${Date.now()}`,
  app_name: 'HALE',
  tagline: 'Mindful health, beautifully kept',
  archetype: 'health-wellness',
  design_url: 'https://ram.zenbin.org/hale',
  mock_url:   'https://ram.zenbin.org/hale-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Mindful health journaling app inspired by Aesop / Kinfolk editorial aesthetic — warm ivory, expressive serif, museum whitespace. Light theme. 6 screens: Welcome, Today, Log, Trends, Journal, Profile.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: HALE indexed ✓');
