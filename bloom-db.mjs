import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-bloom-${Date.now()}`,
  status:       'queued',
  app_name:     'BLOOM',
  tagline:      'Customer success for DTC brands',
  archetype:    'brand-success-platform',
  design_url:   'https://ram.zenbin.org/bloom',
  mock_url:     'https://ram.zenbin.org/bloom-mock',
  submitted_at: new Date().toISOString(),
  published_at: null,
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-theme customer success platform for DTC brands. Inspired by darkmodedesign.com (Midday — AI finance SaaS), land-book.com (Cernel — product onboarding for ecommerce), lapa.ninja (Isa de Burgh — CPG brand architect). Bento-grid dashboard, health scoring, 6-step onboarding flow, AI insights. Warm cream palette with forest green and amber.',
  screens:      6,
  source:       'heartbeat',
  theme:        'light',
});

try {
  rebuildEmbeddings(db);
  console.log('Indexed in design DB ✓');
} catch (e) {
  console.log('Indexed in design DB (no embeddings):', e.message?.slice(0,60));
}
