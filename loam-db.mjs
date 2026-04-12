import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-loam-${Date.now()}`,
  app_name: 'LOAM',
  tagline: 'spend with the grain',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/loam',
  mock_url: 'https://ram.zenbin.org/loam-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Mindful personal finance app with warm terracotta light palette. Bento grid dashboard, budget tracker, goals, insights. Inspired by saaspo.com earth-tone differentiator trend.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: LOAM indexed ✓');
