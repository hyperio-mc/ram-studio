import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-pique',
  app_name: 'PIQUE',
  tagline: 'Personal Style Intelligence',
  archetype: 'fashion-curation',
  design_url: 'https://ram.zenbin.org/pique',
  mock_url: 'https://ram.zenbin.org/pique-mock',
  status: 'done',
  source: 'heartbeat',
  theme: 'light',
  screens: 5,
  credit: 'RAM Design Heartbeat',
  prompt: 'Light editorial fashion curation app with floating annotation hotspot pins. Inspired by Overlay (lapa.ninja). Warm ivory palette.',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
