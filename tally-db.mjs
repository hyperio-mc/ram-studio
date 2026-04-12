// tally-db.mjs — index TALLY in design database
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           'heartbeat-tally-' + Date.now(),
  status:       'done',
  app_name:     'Tally',
  tagline:      'Financial clarity for indie founders',
  archetype:    'fintech-dashboard-founders',
  design_url:   'https://ram.zenbin.org/tally',
  mock_url:     'https://ram.zenbin.org/tally-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Financial OS for indie founders. Warm parchment light theme, tabular monospace numbers, bento metric grid. Inspired by Equals GTM Analytics (land-book), Midday (darkmodedesign), Artefakt (awwwards).',
  screens:      5,
  source:       'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
