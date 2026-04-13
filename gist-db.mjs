import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-gist-${Date.now()}`,
  app_name:     'GIST',
  tagline:      'Slow reading for busy minds',
  archetype:    'reading-digest',
  design_url:   'https://ram.zenbin.org/gist',
  mock_url:     'https://ram.zenbin.org/gist-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Warm minimal editorial reading digest app. Light theme. Inspired by Minimal Gallery paper-like warmth and Lapa Ninja serif revival. 6 screens: Morning Brief, Article Reader, Collections, Discover, Reading Stats, Welcome.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: GIST indexed ✓');
