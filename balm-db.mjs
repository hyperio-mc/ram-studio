import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           'heartbeat-balm-1775607237696',
  status:       'done',
  app_name:     'BALM',
  tagline:      'Calm clarity for creative freelancers',
  archetype:    'freelance-studio',
  design_url:   'https://ram.zenbin.org/balm',
  viewer_url:   'https://ram.zenbin.org/balm-viewer',
  mock_url:     'https://ram.zenbin.org/balm-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Warm light-themed freelance studio OS with editorial ghost date anchors, earthy terracotta/sage palette, and calm financial clarity. Inspired by Cushion App (darkmodedesign.com) peace-of-mind positioning and Awwwards editorial typography trend.',
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
});

rebuildEmbeddings(db);
console.log('Indexed BALM in design DB');
