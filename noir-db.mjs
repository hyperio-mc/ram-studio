import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-noir-${Date.now()}`,
  status: 'done',
  app_name: 'NOIR',
  tagline: 'Revenue intelligence for creative studios.',
  archetype: 'studio-dashboard-finance-dark-editorial',
  design_url: 'https://ram.zenbin.org/noir',
  mock_url: 'https://ram.zenbin.org/noir-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark editorial studio revenue dashboard. Inspired by DARKROOM condensed type on black (darkmodedesign.com) and Neon DB data-dense dark UI. Near-black #080808, parchment #EDE8DC, chartreuse #D4FF47. Five screens: Dashboard, Pipeline, Project Detail, Clients, Invoices.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ NOIR indexed in design DB');
