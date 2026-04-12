import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-karat-${Date.now()}`,
  app_name:     'KARAT',
  tagline:      'Wealth Intelligence Dashboard',
  archetype:    'fintech-wealth',
  design_url:   'https://ram.zenbin.org/karat',
  mock_url:     'https://ram.zenbin.org/karat-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark fintech wealth intelligence dashboard inspired by Land-book FinTech SaaS hero palette (deep violet #7454FA + warm gold #B28A4E) and bento-grid layout trends. 6 screens: Portfolio Overview, Holdings, Cash Flow, Goals, AI Insights, Performance.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: KARAT indexed ✓');
