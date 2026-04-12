import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-writ-intel-${Date.now()}`,
  status: 'done',
  app_name: 'Writ',
  tagline: 'Daily market intelligence, distilled',
  archetype: 'editorial-intelligence',
  design_url: 'https://ram.zenbin.org/writ-intel',
  mock_url: 'https://ram.zenbin.org/writ-intel-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark editorial market intelligence briefing. Warm ink black + copper. Inspired by Compound: Membership on Godly + The Daily Dispatch on Minimal Gallery.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
