// meridian-db.mjs — index MERIDIAN in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: 'heartbeat-meridian-' + Date.now(),
  status: 'done',
  app_name: 'MERIDIAN',
  tagline: 'read the signal, not the noise.',
  archetype: 'analytics-saas',
  design_url: 'https://ram.zenbin.org/meridian',
  mock_url: 'https://ram.zenbin.org/meridian-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI signal analytics for growth teams — light theme. Inspired by Equals (GTM analytics) on land-book.com: warm editorial cream palette, Lora serif for data display, muted mauve AI accent, soft yellow metric cards.',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed MERIDIAN in design DB');
