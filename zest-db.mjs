import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-zest-${Date.now()}`,
  app_name: 'ZEST',
  tagline: 'AI pipeline intelligence',
  archetype: 'revenue-intelligence',
  design_url: 'https://ram.zenbin.org/zest',
  mock_url: 'https://ram.zenbin.org/zest-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-native pipeline intelligence app · dark cinema · warm amber accents · inspired by Attio/Clay on saaspo.com',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: ZEST indexed ✓');
