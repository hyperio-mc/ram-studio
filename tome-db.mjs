import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-tome-${Date.now()}`,
  status:       'done',
  app_name:     'Tome',
  tagline:      'Your reading life, beautifully tracked',
  archetype:    'reading-tracker',
  design_url:   'https://ram.zenbin.org/tome',
  mock_url:     'https://ram.zenbin.org/tome-mock',
  submitted_at: new Date().toISOString(),
  published_at: null,
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-theme personal reading tracker. Warm paper tones, terracotta accent, editorial serif/sans typography. Inspired by Current (land-book.com) and Litbix (minimal.gallery). 5 screens: Home, Library, Book Detail, Discover, Stats.',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB: Tome');
