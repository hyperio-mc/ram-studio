import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: 'heartbeat-lume-1774880171593',
  status: 'done',
  app_name: 'LUME',
  tagline: 'Spend clearly. Save beautifully.',
  archetype: 'fintech-glass',
  design_url: 'https://zenbin.org/p/lume',
  viewer_url: 'https://zenbin.org/p/lume-viewer',
  mock_url: 'https://zenbin.org/p/lume-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme personal finance dashboard with iOS 26 Liquid Glass / Fluid Glass aesthetic. Inspired by Awwwards SOTD "Fluid Glass" by Exo Ape.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
