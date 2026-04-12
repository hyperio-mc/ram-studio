import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-helix-${Date.now()}`,
  status:       'done',
  app_name:     'HELIX',
  tagline:      'Deep sleep intelligence. Know your cycles, own your rest.',
  archetype:    'health',
  design_url:   'https://ram.zenbin.org/helix',
  mock_url:     'https://ram.zenbin.org/helix-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
  prompt:       'Dark-themed sleep biometric tracker. Inspired by Frames (withframes.com on darkmodedesign.com) — niche precision utility app instrument-panel dark UI. Electric violet #7B5CFF + cool teal #2EE5C8 on near-black #070710. Biomorphic waveforms, Georgia serif numerics, score-first hierarchy.',
});

rebuildEmbeddings(db);
console.log('✓ HELIX indexed in design DB');
