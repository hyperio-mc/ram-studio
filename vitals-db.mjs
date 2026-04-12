import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-vitals-${Date.now()}`,
  app_name: 'VITALS',
  tagline: 'Personal Health Dashboard',
  archetype: 'health',
  design_url: 'https://ram.zenbin.org/vitals',
  mock_url: 'https://ram.zenbin.org/vitals-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Personal health dashboard with per-metric hue ownership model. Today readiness ring, Heart Rate (coral), Sleep (purple), HRV (teal), Insights (amber), Recovery (green). Inspired by Reflect\'s #030014 purple-black substrate, Phantom\'s per-section hue model, and Augen\'s four-accent signal system. Dark theme, opacity-based text hierarchy, AI provenance disclosure (Cosmos Show/Blur/Hide pattern).',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: VITALS indexed ✓');
