import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-sylvan-${Date.now()}`,
  status: 'done',
  app_name: 'SYLVAN',
  tagline: 'Slow Living, Daily Reflection',
  archetype: 'wellness',
  design_url: 'https://ram.zenbin.org/sylvan',
  mock_url: 'https://ram.zenbin.org/sylvan-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Warm artisanal light-mode daily reflection and habit tracker. Inspired by Idle Hour Matcha (Lapa.ninja), Emergence Magazine (Siteinspire), Mike Matas portfolio (Godly). Terracotta + sage + ivory palette. Garden bloom calendar as signature visual.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed SYLVAN in design DB');
