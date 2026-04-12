import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-canopy-${Date.now()}`,
  status: 'done',
  app_name: 'CANOPY',
  tagline: 'Know your carbon. Prove your progress.',
  archetype: 'sustainability',
  design_url: 'https://ram.zenbin.org/canopy',
  mock_url: 'https://ram.zenbin.org/canopy-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Enterprise carbon intelligence platform. Light theme: warm ivory #FAF8F2, forest green #1C3D2B, terracotta #C25C2A. Inspired by Relace.ai editorial cream aesthetic (lapa.ninja) and The Footprint Firm (siteinspire SOTD March 23 2026). 5 screens: Scope overview dashboard, supply chain supplier audit, Scope 1/2/3 breakdown, offset marketplace, compliance report builder.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('✓ CANOPY indexed in design DB');
