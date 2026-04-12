import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: `heartbeat-mint-${Date.now()}`,
  status: 'done',
  app_name: 'MINT',
  tagline: 'Freelance Finance, Clearly',
  archetype: 'editorial-finance',
  design_url: 'https://ram.zenbin.org/mint',
  mock_url: 'https://ram.zenbin.org/mint-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  screens: 6,
  theme: 'light',
  heartbeat: 7,
  source: 'heartbeat',
  prompt: 'Freelance finance editorial magazine app, warm parchment light theme, 521 elements',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('MINT indexed in design DB ✓');
