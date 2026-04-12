// pact-db.mjs — index PACT in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-pact-${Date.now()}`,
  status: 'done',
  app_name: 'Pact',
  tagline: 'Financial wellbeing, not just a balance.',
  archetype: 'wellness-finance',
  design_url: 'https://ram.zenbin.org/pact',
  mock_url: 'https://ram.zenbin.org/pact-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light editorial personal finance app treating money management like a wellness practice — inspired by Dawn (lapa.ninja), Overlay editorial serif (lapa.ninja), and New Genre minimal grid (minimal.gallery).',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
