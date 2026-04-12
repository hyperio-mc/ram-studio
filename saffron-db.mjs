import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-saffron-${Date.now()}`,
  app_name:     'SAFFRON',
  tagline:      'Recipe & Meal Planning',
  archetype:    'food-lifestyle',
  design_url:   'https://ram.zenbin.org/saffron',
  mock_url:     'https://ram.zenbin.org/saffron-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-theme recipe and meal planning app inspired by Land-book earthy/sustainable palette trend (sage green, terracotta, warm cream) and Minimal.gallery typography-as-brand trend from KOMETA Typefaces — editorial color blocks replace stock photography',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SAFFRON indexed ✓');
