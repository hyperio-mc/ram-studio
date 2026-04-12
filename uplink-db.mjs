import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-uplink-${Date.now()}`,
  status: 'done',
  app_name: 'Uplink',
  tagline: "Your API's nervous system.",
  archetype: 'monitoring-dashboard',
  design_url: 'https://zenbin.org/p/uplink',
  mock_url: 'https://zenbin.org/p/uplink-mock',
  viewer_url: 'https://zenbin.org/p/uplink-viewer',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'API health monitoring dashboard for indie developers. Dark navy, electric blue, emerald, coral. Status/Routes/Incidents/Analytics/Alerts screens.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
