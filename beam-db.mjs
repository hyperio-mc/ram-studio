import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-beam-${Date.now()}`,
  app_name:     'BEAM',
  tagline:      'Pinpoint every fault before it cascades',
  archetype:    'devops-observability',
  design_url:   'https://ram.zenbin.org/beam',
  mock_url:     'https://ram.zenbin.org/beam-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark-mode API observability platform. Inspired by Antimetal asymmetric bento grid (saaspo.com) and navy-dark palette trend (darkmodedesign.com). Distributed tracing, service dependency graph, SLO tracking.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: BEAM indexed ✓');
