import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-field-${Date.now()}`,
  app_name: 'FIELD',
  tagline: 'Document everything. Forget nothing.',
  archetype: 'fieldwork-journal',
  design_url: 'https://ram.zenbin.org/field',
  mock_url: 'https://ram.zenbin.org/field-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Biophilic light-theme fieldwork journal app. Inspired by Minimal Gallery barely-there UI trend and Land-book Big Type pattern. Warm cream palette, bold serif headlines, visible border structure, 6 screens.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: FIELD indexed ✓');
