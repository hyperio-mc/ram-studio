import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-arca-${Date.now()}`,
  status: 'done',
  app_name: 'ARCA',
  tagline: 'Agent Run Control & Analytics',
  archetype: 'agent-observability',
  design_url: 'https://ram.zenbin.org/arca',
  mock_url: 'https://ram.zenbin.org/arca-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme AI agent pipeline monitor inspired by Composio.dev tool-flow UX and Silencio.es reference-table aesthetics',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
