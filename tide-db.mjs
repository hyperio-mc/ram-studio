import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-tide-${Date.now()}`,
  status: 'done',
  app_name: 'Tide',
  tagline: 'Your money, in motion',
  archetype: 'finance-clarity',
  design_url: 'https://ram.zenbin.org/tide',
  viewer_url: 'https://ram.zenbin.org/tide-viewer',
  mock_url: 'https://ram.zenbin.org/tide-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Fluid glass finance clarity app — frosted glass cards, warm cream palette, large typographic numbers. Light theme.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  inspiration: 'Fluid Glass (Awwwards SOTD 7.77) + Atlas Card (Godly)',
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
