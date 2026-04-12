import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-chisel-${Date.now()}`,
  app_name: 'CHISEL',
  tagline: 'AI pull-request analytics',
  archetype: 'dev-tools',
  design_url: 'https://ram.zenbin.org/chisel',
  mock_url: 'https://ram.zenbin.org/chisel-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark mode PR analytics dashboard inspired by Godly.website Technical Mono / Code Brutalism (Vercel, Factory AI), Raycast single-electric-accent system from DarkModeDesign.com, bento grid layouts from Saaspo.com. 4-level layered dark surfaces, electric amber accent, JetBrains Mono for metrics.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: CHISEL indexed ✓');
