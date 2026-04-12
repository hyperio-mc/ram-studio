import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-sloe-${Date.now()}`,
  app_name: 'SLOE',
  tagline: 'Align with your body clock',
  archetype: 'health-circadian',
  design_url: 'https://ram.zenbin.org/sloe',
  mock_url: 'https://ram.zenbin.org/sloe-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Circadian health & sleep intelligence mobile app — warm amber dark palette inspired by Warm Terminal trend. Amber/brown on near-black, almost unused in mobile wellness. Sleep app using warm tones to avoid cold-blue that disrupts melatonin.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: SLOE indexed ✓');
