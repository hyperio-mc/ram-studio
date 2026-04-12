import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-pike-${Date.now()}`,
  app_name: 'PIKE',
  tagline: 'Know your body daily',
  archetype: 'health-biometrics',
  design_url: 'https://ram.zenbin.org/pike',
  mock_url: 'https://ram.zenbin.org/pike-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Health biometrics tracker inspired by NoGood studio (minimal.gallery) — warm off-white background, electric lime accent, 4-color constraint from Tayte.co. Light theme, 6 screens: Today overview with Body Score, Sleep analysis with stage chart, Activity rings, Vitals panel, Goals tracker, Profile.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: PIKE indexed ✓');
