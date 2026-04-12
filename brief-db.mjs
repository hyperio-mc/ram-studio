import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-brief-specs-${Date.now()}`,
  status: 'done',
  app_name: 'Brief',
  tagline: 'Design specs that write themselves',
  archetype: 'productivity-design-tools-ai',
  design_url: 'https://ram.zenbin.org/brief-specs',
  mock_url: 'https://ram.zenbin.org/brief-specs-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-themed AI-native design specification tool. Inspired by Equals.so "What\'s after Excel?" (land-book.com), 108 Supply editorial typography (darkmodedesign.com), Arcteryx x Re grid-paper precision (land-book.com). Warm parchment palette with terracotta accent and cobalt blue data elements.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed Brief in design DB');
