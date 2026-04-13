import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-gloam-${Date.now()}`,
  app_name:     'GLOAM',
  tagline:      'sleep where the light goes soft',
  archetype:    'health-sleep',
  design_url:   'https://ram.zenbin.org/gloam',
  mock_url:     'https://ram.zenbin.org/gloam-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Sleep & circadian rhythm tracker — dark UI inspired by darkmodedesign.com ambient glow + component-level spotlight lighting trends.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: GLOAM indexed ✓');
