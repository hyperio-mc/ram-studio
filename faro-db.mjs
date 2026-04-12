import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-faro-${Date.now()}`,
  status: 'done',
  app_name: 'FARO',
  tagline: 'Developer Log Intelligence Platform',
  archetype: 'observability-dark',
  design_url: 'https://ram.zenbin.org/faro',
  mock_url: 'https://ram.zenbin.org/faro-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark developer observability — log streaming, AI anomaly detection, alert management inspired by Evervault and Linear dark UI patterns',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ FARO indexed in design DB');
