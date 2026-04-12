import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-axon-${Date.now()}`,
  status: 'done',
  app_name: 'Axon',
  tagline: 'Route your AI workflows',
  archetype: 'ai-automation',
  design_url: 'https://ram.zenbin.org/axon',
  mock_url: 'https://ram.zenbin.org/axon-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI workflow router mobile app — dark. Inspired by Codegen.com OS for Code Agents: deep near-black bg, integration badge UX, neon teal accent, developer pipeline node layout.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed AXON in design DB');
