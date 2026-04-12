import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-pilot-${Date.now()}`,
  status: 'done',
  app_name: 'PILOT',
  tagline: 'your agents, in formation.',
  archetype: 'agent-fleet-manager',
  design_url: 'https://ram.zenbin.org/pilot',
  mock_url: 'https://ram.zenbin.org/pilot-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by agent-native SaaS (Factory, Composio, Parallel Web Systems on Minimal Gallery) and warm cream editorial style (Folk, Sort). Light theme fleet dashboard for managing AI agents.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});

rebuildEmbeddings(db);
console.log('✓ Indexed PILOT in design DB');
