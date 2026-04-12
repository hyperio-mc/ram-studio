import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-coda-${Date.now()}`,
  status:       'done',
  app_name:     'CODA',
  tagline:      'Financial intelligence for independent consultants',
  archetype:    'finance-light',
  design_url:   'https://ram.zenbin.org/coda',
  mock_url:     'https://ram.zenbin.org/coda-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Inspired by Midday.ai on darkmodedesign.com and GTM Analytics/Equals on land-book.com — light-theme financial intelligence app for independent consultants. Warm cream paper palette, cognac amber accent, editorial typographic hierarchy. 5 screens: daily snapshot, client health scores, deal pipeline, invoice detail, month-close readiness checklist.',
  screens:      5,
  source:       'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed CODA in design DB');
