import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const newEntry = {
  id:           'heartbeat-datum-' + Date.now(),
  status:       'done',
  app_name:     'DATUM',
  tagline:      'Every byte, in context.',
  archetype:    'observability-platform',
  design_url:   'https://ram.zenbin.org/datum',
  mock_url:     'https://ram.zenbin.org/datum-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'DARK. Developer observability platform with binary/hex strings as structural visual texture. Inspired by Isidor.ai data-as-decoration pattern on minimal.gallery SAAS Apr 2026. Electric cyan on deep navy-black. Trace waterfall, log stream, metrics, alerts. 5 screens.',
  screens:      5,
  source:       'heartbeat',
};

upsertDesign(db, newEntry);
rebuildEmbeddings(db);
console.log('Indexed in design DB');
