import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-weft-${Date.now()}`,
  status: 'done',
  app_name: 'WEFT',
  tagline: 'Async Writing Studio for Distributed Teams',
  archetype: 'knowledge-distillation-light',
  design_url: 'https://ram.zenbin.org/weft',
  mock_url: 'https://ram.zenbin.org/weft-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by godly.website (Reflect, Amie, Stripe Sessions) and awwwards.com nominees "The Lookback" and "Unseen Studio 2025 Wrapped" — editorial information architecture trend, warm paper-tone light theme, async writing and knowledge distillation studio.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed WEFT in design DB');
