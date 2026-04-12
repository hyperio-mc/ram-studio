import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-glare-${Date.now()}`,
  app_name:     'GLARE',
  tagline:      'Creator intelligence, amplified',
  archetype:    'creator-analytics',
  design_url:   'https://ram.zenbin.org/glare',
  mock_url:     'https://ram.zenbin.org/glare-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Creator analytics OS: true-black dark UI with electric chartreuse glowing data visualizations, inspired by Neon on darkmodedesign.com. 6 screens: Command dashboard, Reach analytics, Revenue intelligence, Content performance, Signals, Profile.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: GLARE indexed ✓');
