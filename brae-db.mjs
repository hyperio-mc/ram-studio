import { openDB, upsertDesign } from './design-db.mjs';

const SLUG      = 'brae';
const APP_NAME  = 'Brae';
const TAGLINE   = 'Local harvest companion';
const ARCHETYPE = 'food-sustainability';
const PROMPT    = 'Farm-to-table subscription manager: warm earth palette, bento grid dashboard, seasonal tracking, editorial serif type. Inspired by Land-book warm tone DTC trend + Saaspo bento grid pattern.';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-${SLUG}-${Date.now()}`,
  app_name: APP_NAME,
  tagline: TAGLINE,
  archetype: ARCHETYPE,
  design_url: `https://ram.zenbin.org/${SLUG}`,
  mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
  credit: 'RAM Design Heartbeat',
  prompt: PROMPT,
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log(`DB: ${APP_NAME} indexed ✓`);
