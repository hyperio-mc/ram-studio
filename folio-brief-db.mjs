import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: 'heartbeat-folio-brief-1775636240621',
  status: 'done',
  app_name: 'Folio',
  tagline: 'Your personal research companion',
  archetype: 'editorial-research',
  design_url: 'https://ram.zenbin.org/folio-brief',
  mock_url: 'https://ram.zenbin.org/folio-brief-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Design a light-theme personal AI research briefing app inspired by The Daily Dispatch editorial aesthetic on minimal.gallery',
  screens: 6,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
