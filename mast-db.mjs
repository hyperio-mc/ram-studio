import { openDB, upsertDesign } from './design-db.mjs';

const SLUG      = 'mast';
const APP_NAME  = 'MAST';
const TAGLINE   = 'Studio OS for creative freelancers';
const ARCHETYPE = 'freelance-studio-os';
const PROMPT    = 'Design a studio OS for creative freelancers — inspired by Siteinspire architecture studio aesthetic (warm cream backgrounds, restrained serif-led design, single bold accent) and Land-book\'s bento card grids. Light theme with deep Klein blue accent.';
const now       = new Date().toISOString();

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-${SLUG}-${Date.now()}`,
  app_name:     APP_NAME,
  tagline:      TAGLINE,
  archetype:    ARCHETYPE,
  design_url:   `https://ram.zenbin.org/${SLUG}`,
  mock_url:     `https://ram.zenbin.org/${SLUG}-mock`,
  credit:       'RAM Design Heartbeat',
  prompt:       PROMPT,
  screens:      6,
  source:       'heartbeat',
  submitted_at: now,
  published_at: now,
});

console.log(`DB: ${APP_NAME} indexed ✓`);
