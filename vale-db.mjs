import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-vale-${Date.now()}`,
  app_name: 'Vale',
  tagline: 'Your money, journalled daily',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/vale',
  mock_url:   'https://ram.zenbin.org/vale-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Personal finance journal app inspired by minimal.gallery editorial whitespace and land-book warm-neutral serif renaissance. Light theme, warm cream palette, 6 screens.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: Vale indexed');
