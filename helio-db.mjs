import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           'heartbeat-helio-1774991577508',
  status:       'done',
  app_name:     'HELIO',
  tagline:      'Know yourself. Extend yourself.',
  archetype:    'longevity-tracker-light',
  design_url:   'https://ram.zenbin.org/helio',
  viewer_url:   'https://ram.zenbin.org/helio-viewer',
  mock_url:     'https://ram.zenbin.org/helio-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
  palette:      'cream-amber-sage',
  prompt:       'Light-theme longevity tracker. Warm cream + amber + sage. Editorial big-number typography. 5 screens: Today, Vitals, Sleep, Nutrition, Insights. Inspired by Dawn (lapa.ninja) and Superpower (godly.website) warm wellness editorial trend.',
  inspiration:  'Dawn (lapa.ninja), Superpower (godly.website), Isa de Burgh (minimal.gallery)',
});

rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
