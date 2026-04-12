import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-grove-' + Date.now(),
  status:       'done',
  app_name:     'Grove',
  tagline:      'Deep work, by design.',
  archetype:    'focus-tracker',
  design_url:   'https://ram.zenbin.org/grove',
  mock_url:     'https://ram.zenbin.org/grove-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Warm-cream editorial deep work session tracker. Sandbar minimal.gallery inspired. Focus blocks, session timer, log, weekly review, morning intention.',
  screens:      6,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
