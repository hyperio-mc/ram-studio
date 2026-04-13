import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-tine-${Date.now()}`,
  app_name:     'TINE',
  tagline:      'Freelance time, tracked honestly',
  archetype:    'freelance-tools',
  design_url:   'https://ram.zenbin.org/tine',
  mock_url:     'https://ram.zenbin.org/tine-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-theme freelance time tracking & invoicing app. Warm minimalism inspired by minimal.gallery (Molo, The Daily Dispatch) and Awwwards SOTD "Nine To Five". Typographic hierarchy as primary visual language, parchment off-white palette #FAF8F4, single forest-green accent #2B5C3A. 6 screens: Today timer, Projects, Log, Invoice, Clients, Reports.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: TINE indexed ✓');
