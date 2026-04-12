import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           'heartbeat-vigil-2026',
  status:       'done',
  app_name:     'VIGIL',
  tagline:      'Cyber threat intelligence platform. Watch everything. Miss nothing.',
  archetype:    'security',
  design_url:   'https://ram.zenbin.org/vigil',
  viewer_url:   'https://ram.zenbin.org/vigil-viewer',
  mock_url:     'https://ram.zenbin.org/vigil-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
  prompt:       'Dark cyberthreat intelligence platform inspired by Utopia Tokyo Awwwards SOTD and Evervault security SaaS. Deep space navy #0A0C12, alert red #FF2233, cyber mint #3DFFD0, warm cream text #E8E2D0.',
});

rebuildEmbeddings(db);
console.log('Indexed VIGIL in design DB');
