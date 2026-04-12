import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id:           'heartbeat-epoch-1774692638322',
  status:       'done',
  app_name:     'EPOCH',
  tagline:      'Your year, rendered.',
  archetype:    'analytics-wrapped',
  design_url:   'https://ram.zenbin.org/epoch',
  mock_url:     'https://ram.zenbin.org/epoch-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Annual intelligence platform inspired by Awwwards Unseen Studio 2025 Wrapped editorial dark aesthetic — cinematic year-in-review with heatmap, moments, network map, and AI insights.',
  screens:      5,
  source:       'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
