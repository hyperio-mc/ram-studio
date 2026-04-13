import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-koda-${Date.now()}`,
  app_name: 'KODA',
  tagline: 'Wealth Constellation Tracker',
  archetype: 'fintech-wealth',
  design_url: 'https://ram.zenbin.org/koda',
  mock_url: 'https://ram.zenbin.org/koda-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-powered wealth tracking app with constellation visual language — inspired by Superpower.com concept-driven metaphors (Godly), QASE starfield-glow dark pattern (Dark Mode Design), and KidSuper World monospace-as-luxury-identity (Awwwards). Dark theme with electric cyan glow accents, monospace data labels, and orbital arc progress rings.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: KODA indexed ✓');
