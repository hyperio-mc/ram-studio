import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-hook-${Date.now()}`,
  app_name: 'HOOK',
  tagline: 'Webhook Inspector & Debugger',
  archetype: 'developer-tools',
  design_url: 'https://ram.zenbin.org/hook',
  mock_url: 'https://ram.zenbin.org/hook-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Webhook delivery inspector and debugger for developers. Real-time event feed, request/response inspection with JSON syntax highlighting, per-endpoint health monitoring, alert rules, and delivery timeline. Inspired by Linear spatial elevation, Darknode two-accent minimalism, Orbit ML monitoring. Dark theme.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: HOOK indexed ✓');
