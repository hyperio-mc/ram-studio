import { openDB, upsertDesign } from './design-db.mjs';

const SLUG = 'cron';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-${SLUG}-${Date.now()}`,
  app_name:     'CRON',
  tagline:      'Job Scheduling & Observability',
  archetype:    'developer-tools',
  design_url:   `https://ram.zenbin.org/${SLUG}`,
  mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
  credit:       'RAM Design Heartbeat',
  prompt:       'AI-powered cron job scheduling & observability platform. Circuit-board connector lines, bento grid dashboard, neon mint accent, terminal log stream. Dark theme.',
  screens:      6,
  source:       'heartbeat',
  submitted_at:  new Date().toISOString(),
  published_at:  new Date().toISOString(),
});

console.log('DB: CRON indexed ✓');
