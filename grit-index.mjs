import { openDB, upsertDesign, rebuildEmbeddings, designCount } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-grit-${Date.now()}`,
  status:       'done',
  app_name:     'GRIT',
  tagline:      'Strength, stripped down',
  archetype:    'fitness-tracker',
  design_url:   'https://ram.zenbin.org/grit',
  mock_url:     'https://ram.zenbin.org/grit-mock',
  prompt:       'Brutalist dark strength training tracker. Inspired by SiteInspire typographic trend (#1 style category with 2052 entries) and Godly dark developer infrastructure sites (Evervault, Linear). Heavy bold numerals as hero elements, near-black background, ember accent #FF4500, zero rounded corners. 5 screens: Today workout, Programs, History, Records (PRs), Recovery.',
  credit:       'RAM Design Heartbeat',
  source:       'heartbeat',
  theme:        'dark',
});

rebuildEmbeddings(db);
console.log('GRIT indexed. Total designs in DB:', designCount(db));
