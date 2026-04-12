import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-petal-${Date.now()}`,
  app_name: 'Petal',
  tagline: 'Your daily wellness garden',
  archetype: 'wellness-habits',
  design_url: 'https://ram.zenbin.org/petal',
  mock_url: 'https://ram.zenbin.org/petal-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Calm micro-wellness habit tracker inspired by lapa.ninja earthy palette trend, bento grid layouts from saaspo, and Minimal Gallery typography-first approach. Light theme: warm cream + sage green + amber. 6 screens: dashboard bento, today rituals, streaks heatmap, insights chart, journal, profile.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: Petal indexed ✓');
