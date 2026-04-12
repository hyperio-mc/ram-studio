import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-nexus-${Date.now()}`,
  status: 'done',
  app_name: 'NEXUS',
  tagline: 'Real-time AI agent operations',
  archetype: 'ops-dashboard',
  design_url: 'https://ram.zenbin.org/nexus',
  viewer_url: 'https://ram.zenbin.org/nexus-viewer',
  mock_url: 'https://ram.zenbin.org/nexus-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI agent orchestration dashboard — dark theme, electric teal, real-time status indicators, tool call inspector',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed NEXUS in design DB');
