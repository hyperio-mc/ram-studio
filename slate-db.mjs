import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id:           `heartbeat-slate-${Date.now()}`,
  status:       'done',
  app_name:     'Slate',
  tagline:      'Every surface, perfectly specified.',
  archetype:    'material-design-tool',
  design_url:   'https://ram.zenbin.org/slate',
  mock_url:     'https://ram.zenbin.org/slate-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark-theme material intelligence platform for product designers — finish selector, material library, spec sheet, collab board. Near-black with warm brass accent.',
  screens:      5,
  source:       'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
