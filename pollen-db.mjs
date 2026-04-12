import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-pollen-${Date.now()}`,
  app_name: 'POLLEN',
  tagline: 'Freelance Studio OS',
  archetype: 'freelance-productivity',
  design_url: 'https://ram.zenbin.org/pollen',
  mock_url: 'https://ram.zenbin.org/pollen-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Neubrutalist freelance creative brief & project tracker. Warm cream + tomato red + butter yellow. Inspired by siteinspire.com unusual layouts / neobrutalism trend. Light theme, offset shadows, bold type.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: POLLEN indexed ✓');
