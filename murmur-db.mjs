import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const entry = {
  id: `heartbeat-murmur-${Date.now()}`,
  status: 'done',
  app_name: 'MURMUR',
  tagline: 'Your product intelligence, spoken weekly.',
  archetype: 'audio-intelligence',
  design_url: 'https://ram.zenbin.org/murmur',
  mock_url: 'https://ram.zenbin.org/murmur-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI audio briefings that convert customer signals (support tickets, NPS, user research) into a weekly personalised podcast. Light theme, warm parchment palette, terracotta accent.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
};

upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB:', entry.app_name);
