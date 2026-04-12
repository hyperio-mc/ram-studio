import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-frame-${Date.now()}`,
  status: 'done',
  app_name: 'FRAME',
  tagline: 'The studio operating system',
  archetype: 'creative-studio-os',
  design_url: 'https://ram.zenbin.org/frame',
  viewer_url: 'https://ram.zenbin.org/frame-viewer',
  mock_url: 'https://ram.zenbin.org/frame-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Creative studio project management OS. Inspired by Locomotive.ca bold editorial typography (Godly.website) — warm cream palette, bold indigo + editorial red accents, unconventional asymmetric card grid.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ Indexed FRAME in design DB');
