import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-aurea-${Date.now()}`,
  status: 'done',
  app_name: 'Aurea',
  tagline: 'Wealth, in plain sight',
  archetype: 'finance-editorial',
  design_url: 'https://ram.zenbin.org/aurea',
  mock_url: 'https://ram.zenbin.org/aurea-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Personal wealth intelligence dashboard — LIGHT editorial theme. Inspired by ISA De Burgh (minimal.gallery) editorial stacked typography on off-white, Old Tom Capital institutional prestige aesthetic, and Cardless financial platform (land-book.com). Warm newsprint cream #F4F0E6, brick red editorial accent, forest green gains, hairline dividers, uppercase spaced labels.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
