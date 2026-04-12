import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-press-${Date.now()}`,
  status:       'done',
  app_name:     'PRESS',
  tagline:      'Your Editorial Morning Brief',
  archetype:    'editorial-briefing',
  design_url:   'https://ram.zenbin.org/press',
  mock_url:     'https://ram.zenbin.org/press-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Editorial newspaper front-page aesthetic applied to a personal AI-curated briefing app. Warm newsprint tones, bold typographic hierarchy, column-grid layout. Inspired by The Daily Dispatch trend from minimal.gallery.',
  screens:      6,
  source:       'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
