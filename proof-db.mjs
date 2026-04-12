import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-proof',
  app_name: 'PROOF',
  tagline: 'Customer Impact Stories for B2B Buyers',
  archetype: 'editorial-impact',
  design_url: 'https://ram.zenbin.org/proof',
  mock_url: 'https://ram.zenbin.org/proof-mock',
  screens: 6,
  source: 'heartbeat',
  published_at: new Date().toISOString(),
  prompt: 'Light editorial B2B case study platform. Warm white + deep navy. Inspired by Evervault customer stories (godly.website) — editorial layout with serif display type, stacked story cards, metric callouts, Before vs After comparisons.',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
