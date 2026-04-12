import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-vega-agent-${Date.now()}`,
  status: 'done',
  app_name: 'VEGA',
  tagline: 'The operating layer for agentic companies',
  archetype: 'agent-orchestration',
  design_url: 'https://ram.zenbin.org/vega',
  mock_url: 'https://ram.zenbin.org/vega-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark agentic console. Agent fleet roster, pipeline visualization, monitoring detail, deploy form, incident feed. Ultra-dark Linear-inspired palette. Inter Variable tight tracking.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
