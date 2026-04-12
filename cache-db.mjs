import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-cache-${Date.now()}`,
  status: 'done',
  app_name: 'CACHE',
  tagline: 'pull reference. build vision.',
  archetype: 'design-tool-creative',
  design_url: 'https://ram.zenbin.org/cache',
  mock_url: 'https://ram.zenbin.org/cache-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Visual reference/mood board app for designers — dark. Neon DB glow bars + NOA accessories grid + Huehaus colorful pills + Anil Kody ALL-CAPS condensed type.',
  screens: 6,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed CACHE in design DB');
