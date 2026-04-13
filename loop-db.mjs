import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-loop-${Date.now()}`,
  app_name:     'LOOP',
  tagline:      'close the feedback loop',
  archetype:    'analytics-platform',
  design_url:   'https://ram.zenbin.org/loop',
  mock_url:     'https://ram.zenbin.org/loop-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'AI-powered user behavior analytics platform. Dark zinc palette with orange (#F97316) + violet (#8B5CF6). Spaceship Instruction Manual aesthetic from godly.website — hairlines, monospace precision, measurement annotations. Bento grid dashboard, funnel analysis, session replay, AI insights.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: LOOP indexed ✓');
