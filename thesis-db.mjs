import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-thesis-${Date.now()}`,
  app_name: 'THESIS',
  tagline: 'AI Research Assistant',
  archetype: 'productivity',
  design_url: 'https://ram.zenbin.org/thesis',
  mock_url: 'https://ram.zenbin.org/thesis-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-powered academic research assistant for synthesizing literature across 200M+ papers. Inspired by AfterQuery academic aesthetic (CMU Serif + terracotta on lavender-white) and Stripe Sessions editorial parchment (ultra-light Söhne weight 250). Light theme, warm parchment palette.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: THESIS indexed ✓');
