import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-herd-${Date.now()}`,
  status: 'done',
  app_name: 'HERD',
  tagline: 'Multi-Agent Orchestration OS',
  archetype: 'agent-orchestration',
  design_url: 'https://ram.zenbin.org/herd',
  mock_url: 'https://ram.zenbin.org/herd-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by herding.app (Godly.website) and AI agent management trend on Lapa.ninja. Dark-mode mobile OS for autonomous agent orchestration. Terminal aesthetic meets ambient violet glow. 5 screens: Command fleet ring, Agent Roster, Flow Builder node graph, Live Activity Log, Pulse analytics.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
