import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-cove-${Date.now()}`,
  status: 'done',
  app_name: 'COVE',
  tagline: 'Private team documentation hub',
  archetype: 'productivity-tools',
  design_url: 'https://ram.zenbin.org/cove',
  mock_url: 'https://ram.zenbin.org/cove-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by "Chus Retro OS Portfolio" (minimal.gallery) — retro OS windowed panels trending — combined with Evervault dark tech UI (Godly). Dark theme: deep navy #040810, cyan #00D4FF, violet #9B59FF, monospace typography.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
rebuildEmbeddings(db);
console.log('Indexed COVE in design DB');
