// gust-db.mjs — index Gust in design vector DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-gust-${Date.now()}`,
  status: 'done',
  app_name: 'Gust',
  tagline: 'Home Air & Climate Wellness',
  archetype: 'home-wellness',
  design_url: 'https://ram.zenbin.org/gust',
  mock_url: 'https://ram.zenbin.org/gust-mock',
  submitted_at:  new Date().toISOString(),
  published_at:  new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme home air quality & plant wellness app. Fluid Glass + Gluwz Household Harmony inspired. Warm bone cream, forest green, amber palette. Glass morphism cards, large AQI typography, room-by-room, plant care, weekly insights.',
  screens: 6,
  source: 'heartbeat',
  theme: 'light',
});

rebuildEmbeddings(db);
console.log('Indexed Gust in design DB ✓');
