import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: `heartbeat-glyph-${Date.now()}`,
  status: 'done',
  app_name: 'GLYPH',
  tagline: 'Shape your day. Own your output.',
  archetype: 'daily-rhythm-tracker',
  design_url: 'https://ram.zenbin.org/glyph',
  mock_url: 'https://ram.zenbin.org/glyph-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Daily rhythm tracker for makers — Light editorial theme inspired by Dawn (Lapa Ninja) and PW Magazine typography (Siteinspire). Warm parchment, electric blue, ember orange. 5 screens: Today, Focus, Patterns, Reflect, Library.',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB:', entry.app_name);
