import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-sonar-${Date.now()}`,
  app_name:     'SONAR',
  tagline:      'Voice intelligence, decoded',
  archetype:    'voice-ai-ops',
  design_url:   'https://ram.zenbin.org/sonar',
  mock_url:     'https://ram.zenbin.org/sonar-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       "AI voice agent monitoring platform with a \"spaceship manual\" / engineering diagram aesthetic — inspired by Godly.website's labeled callout-line, hairline technical grid trend and Saaspo's AI voice agent SaaS category.",
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SONAR indexed ✓');
