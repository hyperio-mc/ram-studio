import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const entry = {
  id: 'heartbeat-raft-' + Date.now(),
  status: 'done',
  app_name: 'RAFT',
  tagline: 'Sprint intelligence for healthy teams',
  archetype: 'sprint-intelligence',
  design_url: 'https://ram.zenbin.org/raft',
  mock_url: 'https://ram.zenbin.org/raft-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light editorial sprint health + retrospective intelligence app. Warm cream palette, forest green accent, AI team insights. 5 screens.',
  screens: 5,
  source: 'heartbeat',
};

upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
