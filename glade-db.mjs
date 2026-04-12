/**
 * Glade — design DB indexing
 */
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id:           'heartbeat-glade',
  app_name:     'Glade',
  tagline:      'Your nature field notebook',
  archetype:    'nature-journal-tracker',
  design_url:   'https://ram.zenbin.org/glade',
  mock_url:     'https://ram.zenbin.org/glade-mock',
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Nature walk & observation journal — editorial serif typography, warm paper tones (Litbix/minimal.gallery inspired), field notes aesthetic applied to a sighting tracker. Light theme.',
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
