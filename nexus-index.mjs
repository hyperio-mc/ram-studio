import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const newEntry = {
  id: `heartbeat-nexus-${Date.now()}`,
  status: 'done',
  app_name: 'Nexus',
  tagline: 'Command your agents',
  archetype: 'ai-agent-orchestration',
  design_url: 'https://ram.zenbin.org/nexus',
  mock_url: 'https://ram.zenbin.org/nexus-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI agent orchestration dashboard inspired by Runlayer (land-book.com) and Linear UI refresh (darkmodedesign.com). Dark mode, enterprise MCP management, agent fleet monitoring, execution trace viewer.',
  screens: 5,
  source: 'heartbeat',
};

upsertDesign(db, newEntry);
rebuildEmbeddings(db);
console.log('Indexed Nexus in design DB ✓');
