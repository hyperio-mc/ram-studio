import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-pave-${Date.now()}`,
  app_name: 'PAVE',
  tagline: 'wealth, made clear',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/pave',
  mock_url: 'https://ram.zenbin.org/pave-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Personal wealth intelligence app — light theme, warm cream palette, teal + terracotta accents, finance-minimal aesthetic inspired by Old Tom Capital (minimal.gallery).',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: PAVE indexed ✓');
