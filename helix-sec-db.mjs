import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-helix-security',
  status:       'done',
  app_name:     'Helix',
  tagline:      'Every commit, watched.',
  archetype:    'developer-security-ai',
  design_url:   'https://ram.zenbin.org/helix-security',
  mock_url:     'https://ram.zenbin.org/helix-security-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark AI security intelligence dashboard — deep space navy + electric violet inspired by Evervault (godly.website), VAST SOTD (awwwards), Neon.tech (darkmodedesign)',
  screens:      5,
  source:       'heartbeat',
  theme:        'dark',
  palette:      'deep-space-navy-violet-teal',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
