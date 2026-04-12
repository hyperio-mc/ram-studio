import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-forge-1775279528970`,
  status: 'done',
  app_name: 'Forge',
  tagline: 'Infrastructure command center for engineering teams',
  archetype: 'devtools-monitor',
  design_url: 'https://ram.zenbin.org/forge',
  mock_url: 'https://ram.zenbin.org/forge-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark-mode infrastructure monitoring app inspired by Neon.tech ultra-dark electric-cyan aesthetic and Midday.ai tabbed feature exploration. Features real-time service health, deep metrics with area charts, smart alerts, service topology, and AI-powered runbook generation.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed Forge in design DB');
