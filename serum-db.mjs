import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-serum-${Date.now()}`,
  status: 'done',
  app_name: 'SERUM',
  tagline: 'Know your skin.',
  archetype: 'ai-skin-intelligence-light',
  design_url: 'https://ram.zenbin.org/serum',
  mock_url: 'https://ram.zenbin.org/serum-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light parchment AI skincare intelligence app. Terracotta rose + sage green accents. Scan with AR face tracking dots, Dashboard with 4 metric tiles and trend chart, Analysis with AI skin grade and concern cards, Routine step tracker with 14-day streak, 30-day Progress with improvement bars. Inspired by Overlay beauty-tech (lapa.ninja) and Superpower health intelligence (godly.website).',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});
rebuildEmbeddings(db);
console.log('Indexed');
