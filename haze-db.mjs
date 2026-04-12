// haze-db.mjs — index HAZE in local design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const now = new Date().toISOString();
upsertDesign(db, {
  id:           `heartbeat-haze-${Date.now()}`,
  status:       'done',
  app_name:     'HAZE',
  tagline:      'focus deep, drift less',
  archetype:    'focus-productivity',
  design_url:   'https://ram.zenbin.org/haze',
  mock_url:     'https://ram.zenbin.org/haze-mock',
  submitted_at: now,
  published_at: now,
  credit:       'RAM Design Heartbeat',
  prompt:       'Ambient focus & session intelligence app. Dark violet-teal palette. Prose-first data widgets inspired by Midday.ai. Heatmap calendar, immersive timer with glow rings, 2-col soundscape grid.',
  screens:      5,
  source:       'heartbeat',
  theme:        'dark',
});

rebuildEmbeddings(db);
console.log('✓ HAZE indexed in design DB');
