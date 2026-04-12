import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const newEntry = {
  id: `heartbeat-knot-${Date.now()}`,
  status: 'done',
  app_name: 'KNOT',
  tagline: 'Where ideas connect.',
  archetype: 'personal-knowledge-graph-dark',
  design_url: 'https://ram.zenbin.org/knot',
  mock_url: 'https://ram.zenbin.org/knot-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark obsidian personal knowledge graph app — deep near-black (#09090F), soft violet (#7C6EF2) connection threads + emerald (#34D399) AI synthesis accents. Knowledge Graph with violet node threads, Note view with backlinks + AI suggestions, Meeting Capture with real-time intelligence extraction, Semantic Search with synthesis card, Daily Digest with thought partner. Inspired by Reflect (godly.website) and Amie (godly.website) and NNGroup Apr 3 AI agents article.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
};

const db = openDB();
upsertDesign(db, { ...newEntry });
rebuildEmbeddings(db);
console.log('Design indexed in DB');
