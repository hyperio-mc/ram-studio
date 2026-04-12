import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-plex-${Date.now()}`,
  app_name:     'PLEX',
  tagline:      'Developer team intelligence',
  archetype:    'developer-tooling',
  design_url:   'https://ram.zenbin.org/plex',
  mock_url:     'https://ram.zenbin.org/plex-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark developer analytics dashboard inspired by DarkModeDesign.com B2B SaaS palette (Deep Navy + Cyan) and Saaspo bento grid layouts. 6 screens: Dashboard (bento grid), Pull Requests, Team, Code Quality, Deployments, Settings.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: PLEX indexed ✓');
