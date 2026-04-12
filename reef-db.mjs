import { openDB, upsertDesign } from './design-db.mjs';

const SLUG = 'reef';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  app_name:   'REEF',
  tagline:    'Ocean Health. Monitored.',
  archetype:  'environmental-monitoring',
  design_url: `https://ram.zenbin.org/${SLUG}`,
  mock_url:   `https://ram.zenbin.org/${SLUG}-mock`,
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark glassmorphism bento grid UI for ocean environmental monitoring platform, bioluminescent palette, inspired by darkmodedesign.com glassmorphism cards and saaspo.com bento grid patterns',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: REEF indexed ✓');
