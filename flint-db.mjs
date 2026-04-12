import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-flint-${Date.now()}`,
  status:       'done',
  app_name:     'Flint',
  tagline:      'PR review load, made legible',
  archetype:    'developer-tools',
  design_url:   'https://ram.zenbin.org/flint',
  mock_url:     'https://ram.zenbin.org/flint-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-theme PR review workload tracker for engineering leads. Factory.ai + Sort tabular aesthetic (minimal.gallery SAAS, Mar 25 2026). Editorial bold typography from Lucci Lambrusco (siteinspire.com). Swiss grid, left-rule status rows, heat-strip capacity bars.',
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
