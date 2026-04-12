import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-revel-${Date.now()}`,
  app_name: 'REVEL',
  tagline: "Find what's happening around you",
  archetype: 'event-discovery',
  design_url: 'https://ram.zenbin.org/revel',
  mock_url: 'https://ram.zenbin.org/revel-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme event discovery app with warm editorial serif aesthetic. Inspired by Lapa Ninja serif revival trend and Land-book 1950s warm earthy advertising palette. Terracotta + forest green on warm cream. Counter-trend to dark SaaS default.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: REVEL indexed ✓');
