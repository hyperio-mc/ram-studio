import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-kindle-${Date.now()}`,
  status: 'done',
  app_name: 'KINDLE',
  tagline: 'Your emotional performance OS',
  archetype: 'emotional-wellness-dark',
  design_url: 'https://ram.zenbin.org/kindle',
  viewer_url: 'https://ram.zenbin.org/kindle-viewer',
  mock_url: 'https://ram.zenbin.org/kindle-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark cinematic emotional wellness tracker. Inspired by Superpower (Godly.website) amber aesthetic and Dawn (Lapa.ninja) emotional gradient storytelling. Warm charcoal+amber editorial palette challenging cold tech-health blue.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed KINDLE in design DB');
