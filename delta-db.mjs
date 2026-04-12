import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-delta-' + Date.now(),
  status: 'done',
  app_name: 'DELTA',
  tagline: 'Ship winning experiments, not hunches.',
  archetype: 'growth-experimentation',
  design_url: 'https://ram.zenbin.org/delta',
  mock_url: 'https://ram.zenbin.org/delta-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'A/B experimentation intelligence. Bento grid dashboard. Dark violet + cyan palette. Inspired by Codegen (land-book) and Linear (darkmodedesign).',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
