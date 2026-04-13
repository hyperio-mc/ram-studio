import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();

await upsertDesign(db, {
  id: `heartbeat-loft-${Date.now()}`,
  app_name: 'LOFT',
  tagline: 'Studio project workspace for creative teams',
  archetype: 'studio-management',
  design_url: 'https://ram.zenbin.org/loft',
  mock_url: 'https://ram.zenbin.org/loft-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Creative studio project management workspace. Inspired by Minimal Gallery SaaS minimalism (Folk, Composio, PostHog restraint pattern) × Land-Book heritage craft aesthetic (warm off-white, serif revival, terracotta, 1950s-70s artisanal references). Light theme.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: LOFT indexed ✓');
