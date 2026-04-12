// flare-db.mjs — Index FLARE in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-flare-${Date.now()}`,
  status:       'done',
  app_name:     'FLARE',
  tagline:      'Premium lifestyle card & concierge companion',
  archetype:    'fintech-lifestyle',
  design_url:   'https://ram.zenbin.org/flare',
  mock_url:     'https://ram.zenbin.org/flare-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
  prompt:       'FLARE — premium lifestyle card app. Light cream canvas, electric indigo #1507D6 accent from Shed SOTD. Atlas Card concierge UX. Nordic minimalist finance aesthetic.',
});
rebuildEmbeddings(db);
console.log('✓ FLARE indexed in design DB');
