import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-lume-${Date.now()}`,
  status: 'done',
  app_name: 'LUME',
  tagline: 'Ambient focus, beautifully lit.',
  archetype: 'focus-productivity',
  design_url: 'https://ram.zenbin.org/lume',
  mock_url: 'https://ram.zenbin.org/lume-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Ambient focus sessions app — scattered floating scene cards on warm cream canvas. Light editorial aesthetic. Inspired by Overlay beauty app (lapa.ninja) and KO Collective (minimal.gallery).',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
