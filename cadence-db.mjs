import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-cadence',
  status:       'done',
  app_name:     'CADENCE',
  tagline:      'Schedule with your biology.',
  archetype:    'cognitive-performance-scheduler',
  design_url:   'https://ram.zenbin.org/cadence',
  viewer_url:   'https://ram.zenbin.org/cadence-viewer',
  mock_url:     'https://ram.zenbin.org/cadence-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Cognitive performance scheduler — light theme, warm parchment, sage green, terracotta accent, DM Serif Display numbers. Energy ribbon, heatmap, session timer.',
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
