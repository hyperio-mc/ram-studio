import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id:           `heartbeat-take-${Date.now()}`,
  app_name:     'Take',
  tagline:      'AI Video Creation Studio',
  archetype:    'ai-video-creative-tools',
  design_url:   'https://ram.zenbin.org/take',
  mock_url:     'https://ram.zenbin.org/take-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark cinematic AI video studio. Cinema black + electric coral + teal + violet + amber. Generate → Timeline Editor → Library → Analytics. Three-lane track system with AI enhancement suite. Inspired by Runway ML, Pika, CapCut Pro. 672 elements.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: Take indexed ✓');
