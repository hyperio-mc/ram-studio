import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-diffr-${Date.now()}`,
  app_name: 'DIFFR',
  tagline: 'AI code review at terminal speed',
  archetype: 'dev-tooling',
  design_url: 'https://ram.zenbin.org/diffr',
  mock_url: 'https://ram.zenbin.org/diffr-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Terminal/hacker aesthetic AI code review tool inspired by Overrrides on Godly.website (pure black + neon chartreuse, monospace-everywhere, dense grid) and Neon.com single-accent philosophy from DarkModeDesign.com',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: DIFFR indexed ✓');
