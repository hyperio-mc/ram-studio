import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-memo-${Date.now()}`,
  app_name:     'Memo',
  tagline:      'Your team, in writing.',
  archetype:    'async-communication',
  design_url:   'https://ram.zenbin.org/memo',
  mock_url:     'https://ram.zenbin.org/memo-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Editorial async team communication app — warm cream light theme inspired by lapa.ninja serif revival trend (Recoleta/Canela display serifs in magazine-feel editorial contexts). Georgia serif headlines, system-ui body, editorial red accent.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: Memo indexed ✓');
