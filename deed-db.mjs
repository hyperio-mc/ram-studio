import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-deed-${Date.now()}`,
  app_name: 'DEED',
  tagline: 'Contract Intelligence',
  archetype: 'legal-tech',
  design_url: 'https://ram.zenbin.org/deed',
  mock_url: 'https://ram.zenbin.org/deed-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme legal-tech contract management app. Inspired by Land-Book Stripe-style SaaS minimalism, Lapa Ninja serif renaissance (Georgia/Instrument Serif), and Minimal Gallery purposeful asymmetry. Features warm off-white palette with deep navy accent, serif display typography, left-stripe status indicators, and bento-grid template browser.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: DEED indexed ✓');
