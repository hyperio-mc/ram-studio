import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-drift-${Date.now()}`,
  status: 'done',
  app_name: 'Drift',
  tagline: 'Market intelligence, without the noise',
  archetype: 'market-intelligence-light',
  design_url: 'https://ram.zenbin.org/drift',
  mock_url: 'https://ram.zenbin.org/drift-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'B2B competitive intelligence dashboard with warm editorial light palette, inspired by minimal.gallery SAAS (Folk, Adaline) and land-book fintech trends',
  screens: 6,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
