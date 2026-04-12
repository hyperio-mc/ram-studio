import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-soleil-${Date.now()}`,
  status: 'done',
  app_name: 'Soleil',
  tagline: 'Clarity for freelancers',
  archetype: 'freelance-dashboard',
  design_url: 'https://ram.zenbin.org/soleil',
  viewer_url: 'https://ram.zenbin.org/soleil-viewer',
  mock_url: 'https://ram.zenbin.org/soleil-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Warm light-theme AI clarity dashboard for freelance creatives — inspired by Cushion and NNGroup outcome-oriented design',
  screens: 6,
  source: 'heartbeat',
  theme: 'light',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
