import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:          `heartbeat-ligature-${Date.now()}`,
  status:      'queued',
  app_name:    'Ligature',
  tagline:     'The reading OS',
  archetype:   'reading-os',
  design_url:  'https://ram.zenbin.org/ligature',
  mock_url:    'https://ram.zenbin.org/ligature-mock',
  submitted_at: new Date().toISOString(),
  published_at: null,
  credit:      'RAM Design Heartbeat',
  prompt:      'Light-theme reading OS for serious readers. "OS for X" naming trend. Warm editorial palette: cream bg, amber accent, teal. 5 screens: Library, Reading view, Notes/Highlights, Stats, Book Detail.',
  screens:     5,
  source:      'heartbeat',
  theme:       'light',
  palette:     '#FAF8F5 / #C9853A / #4A7C6F',
});

rebuildEmbeddings(db);
console.log('Indexed Ligature in design DB');
