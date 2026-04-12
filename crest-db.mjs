import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-crest-${Date.now()}`,
  status:       'done',
  app_name:     'Crest',
  tagline:      'Freelance cashflow, well-edited',
  archetype:    'finance-cashflow-freelancer',
  design_url:   'https://ram.zenbin.org/crest',
  mock_url:     'https://ram.zenbin.org/crest-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Editorial cashflow app for freelancers — LIGHT theme. Inspired by land-book.com: Equals, UglyCash, Deon Libra, and Maker. Warm cream palette, electric chartreuse accent, bold display numbers.',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
