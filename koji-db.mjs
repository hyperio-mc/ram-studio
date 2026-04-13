import { openDB, upsertDesign } from './design-db.mjs';
const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-koji-${Date.now()}`,
  app_name: 'KOJI',
  tagline: 'Fermentation Culture Companion',
  archetype: 'fermentation-lifestyle',
  design_url: 'https://ram.zenbin.org/koji',
  mock_url: 'https://ram.zenbin.org/koji-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Fermentation culture companion. Dark theme — deep forest-black #0A1208, warm amber #D97706 accent. Culture as protagonist with narrative Timeline screen. Organic bubble motifs as trust signal (NNGroup Handmade Designs Apr 2026). Activity glow strips on culture cards. Science screen with pH trend chart and optimal zone band. Diagnose screen: symptom → narrative. Bake screen: readiness-matched recipes. 6 screens: Cultures, Timeline, Feed, Science, Diagnose, Bake.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: KOJI indexed ✓');
