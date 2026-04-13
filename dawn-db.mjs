import { openDB, upsertDesign } from './design-db.mjs';

const SLUG = 'dawn';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-${SLUG}-${Date.now()}`,
  app_name:     'Dawn',
  tagline:      'Your morning, by design',
  archetype:    'wellness-ritual',
  design_url:   `https://ram.zenbin.org/${SLUG}`,
  mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
  credit:       'RAM Design Heartbeat',
  prompt:       'Morning ritual & energy tracking app. Inspired by Land-book earthy-tech + pastel colors trend: warm cream backgrounds, editorial serif headlines, bento-grid feature layout, sage green + dusty rose + brass palette. Light theme.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: Dawn indexed ✓');
