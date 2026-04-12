import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-lux-${Date.now()}`,
  status: 'done',
  app_name: 'LUX',
  tagline: 'Your creative portfolio studio',
  archetype: 'portfolio-studio',
  design_url: 'https://ram.zenbin.org/lux',
  mock_url: 'https://ram.zenbin.org/lux-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light glassmorphism creative portfolio studio — Fluid Glass (Awwwards) + minimal.gallery. Frosted glass cards, prismatic accents, 5 screens.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
