import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-torch-${Date.now()}`,
  app_name:     'TORCH',
  tagline:      'Intelligence. Illuminated.',
  archetype:    'ai-research-intelligence',
  design_url:   'https://ram.zenbin.org/torch',
  mock_url:     'https://ram.zenbin.org/torch-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Inspired by: WyrVox torch-and-shadow effect (darkmodedesign.com), bento grid layout trend (saaspo + land-book), purple as the AI accent color of 2026. Dark mobile AI research intelligence platform.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: TORCH indexed ✓');
