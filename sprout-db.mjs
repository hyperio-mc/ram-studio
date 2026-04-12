import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-sprout-${Date.now()}`,
  app_name: 'SPROUT',
  tagline: 'Your herbs, thriving',
  archetype: 'home-gardening',
  design_url: 'https://ram.zenbin.org/sprout',
  mock_url: 'https://ram.zenbin.org/sprout-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark warm-botanical herb garden tracker app. Inspired by DarkModeDesign.com warm dark palette trend (Format Podcasts burgundy + Frames Apple-style layered surfaces) and the analog creative hobby app niche. 6 screens: Dashboard, Plant Detail, Watering Log, Grow Journal, Harvest Tracker, Discover.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SPROUT indexed ✓');
