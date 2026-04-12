import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const SLUG = 'conductor';
const newEntry = {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  status: 'done',
  app_name: 'Conductor',
  tagline: 'Orchestrate your AI agents, effortlessly',
  archetype: 'ai-ops-dashboard',
  design_url: `https://ram.zenbin.org/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by JetBrains Air "Multitask with agents, stay in control" on lapa.ninja and Midday.ai dashboard from darkmodedesign.com. Light-theme AI agent orchestration dashboard with overview, agent detail, task queue, analytics, and compose screens.',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, newEntry);
rebuildEmbeddings(db);
console.log('Indexed in design DB:', newEntry.app_name);
