import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-tern-${Date.now()}`,
  app_name: 'TERN',
  tagline: 'Know Your Sound',
  archetype: 'music-intelligence',
  design_url: 'https://ram.zenbin.org/tern',
  mock_url: 'https://ram.zenbin.org/tern-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Bento grid music intelligence app with ambient glassmorphism — dark electric violet theme. Inspired by bento layouts from saaspo.com and dark ambient UI from darkmodedesign.com.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: TERN indexed ✓');
