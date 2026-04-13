import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-grove-${Date.now()}`,
  app_name: 'GROVE',
  tagline: 'grow with intention',
  archetype: 'wellness-productivity',
  design_url: 'https://ram.zenbin.org/grove',
  mock_url: 'https://ram.zenbin.org/grove-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-mode habit & personal growth tracker. Inspired by Lapa Ninja editorial serif trend (Instrument Serif rising) + Landbook warm off-white background pattern + DarkModeDesign single-accent strategy adapted for light mode. Warm cream palette with sage green and terracotta.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: GROVE indexed ✓');
