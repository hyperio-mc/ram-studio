import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-slab-${Date.now()}`,
  app_name:     'SLAB',
  tagline:      "The independent publisher's studio",
  archetype:    'content-publishing',
  design_url:   'https://ram.zenbin.org/slab',
  mock_url:     'https://ram.zenbin.org/slab-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Independent publisher content studio — editorial serif typography, bento analytics grid, warm cream palette with single terracotta accent. Inspired by Lapa Ninja serif revival, minimal.gallery typography-as-layout, Saaspo bento grid sections.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SLAB indexed ✓');
