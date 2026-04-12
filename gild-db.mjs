// gild-db.mjs — index GILD in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-gild-${Date.now()}`,
  status:       'done',
  app_name:     'GILD',
  tagline:      'Wealth, observed.',
  archetype:    'wealth-intelligence',
  design_url:   'https://ram.zenbin.org/gild',
  viewer_url:   'https://ram.zenbin.org/gild-viewer',
  mock_url:     'https://ram.zenbin.org/gild-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark-mode personal wealth intelligence. Editorial typography as data viz. Gold ruling lines. Ambient sparklines. Warm black palette.',
  screens:      5,
  source:       'heartbeat',
  theme:        'dark',
});

rebuildEmbeddings(db);
console.log('Indexed GILD in design DB');
