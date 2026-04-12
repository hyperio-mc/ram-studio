import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:          'heartbeat-alloy-' + Date.now(),
  status:      'done',
  app_name:    'ALLOY',
  tagline:     'Wealth composition, forged with precision',
  archetype:   'fintech-dark',
  design_url:  'https://ram.zenbin.org/alloy',
  mock_url:    'https://ram.zenbin.org/alloy-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:      'RAM Design Heartbeat',
  prompt:      'Dark-mode personal wealth OS. Metallurgy as finance metaphor — void palette, electric violet accent, 5 screens.',
  screens:     5,
  source:      'heartbeat',
  theme:       'dark',
  palette:     '#0B0C10,#7C5CFC,#FF6B6B,#48C778,#FFB340',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
