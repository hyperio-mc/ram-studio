import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-fend-${Date.now()}`,
  app_name:     'FEND',
  tagline:      'See every threat before it lands',
  archetype:    'security-intelligence',
  design_url:   'https://ram.zenbin.org/fend',
  mock_url:     'https://ram.zenbin.org/fend-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Developer-minimal dark threat intelligence platform. Inspired by darkmodedesign.com (Linear/Vercel/Raycast aesthetic), land-book.com oversized stat hero, saaspo.com bento grid. Amber-orange accent deliberately avoiding clichéd AI purple gradient.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: FEND indexed ✓');
