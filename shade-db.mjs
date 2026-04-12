import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-shade-${Date.now()}`,
  status: 'done',
  app_name: 'SHADE',
  tagline: 'cloud cost intelligence',
  archetype: 'devops-finops',
  design_url: 'https://ram.zenbin.org/shade',
  viewer_url: 'https://ram.zenbin.org/shade-viewer',
  mock_url:   'https://ram.zenbin.org/shade-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: "Dark cloud infrastructure cost monitoring, anomaly detection, and spend forecasting platform. Deep navy aesthetic inspired by Evervault (godly.website). Violet accent, cyan highlights, data-dense FinOps dashboard.",
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});

rebuildEmbeddings(db);
console.log('✓ SHADE indexed in design DB');
