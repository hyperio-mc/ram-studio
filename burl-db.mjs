import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-burl-${Date.now()}`,
  app_name: 'BURL',
  tagline: 'Craft your revenue. Own your time.',
  archetype: 'freelance-finance',
  design_url: 'https://ram.zenbin.org/burl',
  mock_url: 'https://ram.zenbin.org/burl-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Freelance revenue & time tracker — warm cream editorial aesthetic, bold serif typography, bento grid dashboard, gamified milestones. Inspired by the warm-neutral counter-trend on Land-book and minimal.gallery.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: BURL indexed ✓');
