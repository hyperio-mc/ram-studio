import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id:           `heartbeat-claro-${Date.now()}`,
  status:       'done',
  app_name:     'Claro',
  tagline:      'Financial clarity for independent minds',
  archetype:    'finance-productivity',
  design_url:   'https://ram.zenbin.org/claro',
  mock_url:     'https://ram.zenbin.org/claro-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
  prompt:       'Light editorial fintech dashboard for independent consultants. Inspired by Midday.ai (darkmodedesign.com) and 108 Supply editorial typography. Warm cream palette, burnt sienna accent, sage green for positive states.',
};

try {
  const db = openDB();
  upsertDesign(db, entry);
  rebuildEmbeddings(db);
  console.log('✓ Indexed Claro in design DB');
} catch(e) {
  console.log('DB index skipped:', e.message);
}
