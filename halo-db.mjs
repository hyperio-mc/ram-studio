import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-halo-${Date.now()}`,
  status: 'done',
  app_name: 'Halo',
  tagline: "Your body's natural rhythm, made visible",
  archetype: 'health-wellness-companion',
  design_url: 'https://ram.zenbin.org/halo',
  mock_url: 'https://ram.zenbin.org/halo-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-themed circadian health companion. Inspired by Voy (most-saved on land-book.com, 17 saves) + Overlay 2026 editorial serif trend (PP Editorial Old, White, Gradient on lapa.ninja). Warm cream #FAF7F2, terra cotta #C8714A, sage green #4E7C51, bento-grid cards, energy forecast chart, sleep stages.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('✓ Halo indexed in design DB');
