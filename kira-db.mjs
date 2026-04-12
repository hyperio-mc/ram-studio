import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-kira-${Date.now()}`,
  app_name:     'KIRA',
  tagline:      'creator intelligence, amplified',
  archetype:    'creator-analytics',
  design_url:   'https://ram.zenbin.org/kira',
  mock_url:     'https://ram.zenbin.org/kira-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Creator analytics dashboard — deep navy dark palette inspired by QASE on darkmodedesign.com, bento grid metrics from land-book, glassmorphism cards from godly. 6 screens: Dashboard, Content, Audience, Revenue, Insights, Profile.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: KIRA indexed ✓');
