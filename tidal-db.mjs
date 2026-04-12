import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-tidal-${Date.now()}`,
  app_name:     'TIDAL',
  tagline:      'Artist analytics, deep as the ocean',
  archetype:    'music-analytics',
  design_url:   'https://ram.zenbin.org/tidal',
  mock_url:     'https://ram.zenbin.org/tidal-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark music analytics dashboard for artist management teams. Inspired by darkmodedesign.com QASE bioluminescence palette and saaspo.com bento grid patterns. Deep-sea navy + electric teal palette.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: TIDAL indexed ✓');
