import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-gavel-${Date.now()}`,
  app_name:     'GAVEL',
  tagline:      'AI Legal Co-Pilot',
  archetype:    'legal-ai',
  design_url:   'https://ram.zenbin.org/gavel',
  mock_url:     'https://ram.zenbin.org/gavel-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark violet AI legal co-pilot — contract risk detection, precedent research, case timeline, and AI insights. Inspired by saaspo.com purple AI SaaS aesthetic and darkmodedesign.com glassmorphism patterns.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: GAVEL indexed ✓');
