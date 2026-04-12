import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-bento-${Date.now()}`,
  app_name:     'BENTO',
  tagline:      'Feature Command Center',
  archetype:    'product-ops',
  design_url:   'https://ram.zenbin.org/bento',
  mock_url:     'https://ram.zenbin.org/bento-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark glassmorphism feature launch tracking dashboard with bento-grid layout and command palette UX — inspired by saaspo.com bento grid SaaS layouts, darkmodedesign.com glassmorphism, and godly.website/Height command palette interaction pattern.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: BENTO indexed ✓');
