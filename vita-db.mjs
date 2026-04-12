import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-vita-${Date.now()}`,
  app_name: 'VITA',
  tagline: 'Daily longevity, made ritual',
  archetype: 'health-longevity',
  design_url: 'https://ram.zenbin.org/vita',
  mock_url: 'https://ram.zenbin.org/vita-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Health tech + longevity tracking app — warm cream light theme, editorial serif typography, sage green and terracotta accents. Ritual tracking, sleep staging, biomarker insights.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: VITA indexed ✓');
