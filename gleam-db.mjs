import { openDB, upsertDesign } from './design-db.mjs';

const SLUG      = 'gleam';
const APP_NAME  = 'GLEAM';
const TAGLINE   = 'Creator analytics for independent voices';
const ARCHETYPE = 'creator-analytics';
const PROMPT    = 'A warm editorial analytics dashboard for independent newsletter creators, inspired by minimal.gallery soft brutalism and saaspo warm productivity palettes — amber/cream palette as deliberate counter to purple AI SaaS aesthetic.';

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
