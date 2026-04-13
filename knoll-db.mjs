import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-knoll-${Date.now()}`,
  app_name: 'KNOLL',
  tagline: 'Research, connected',
  archetype: 'knowledge-management',
  design_url: 'https://ram.zenbin.org/knoll',
  mock_url: 'https://ram.zenbin.org/knoll-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'RAM heartbeat #469 — personal research workspace for curious minds. Inspired by lapa.ninja Overlay editorial aesthetic and saaspo.com bento grid SaaS trend. Warm cream light theme with terracotta and forest green palette. 6 screens: bento dashboard, editorial explore grid, document editor, library collections, insights analytics, profile.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: KNOLL indexed ✓');
