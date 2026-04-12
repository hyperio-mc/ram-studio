import { openDB, upsertDesign } from './design-db.mjs';
const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-pause-${Date.now()}`,
  app_name: 'PAUSE',
  tagline: 'Daily Reflection & Journaling',
  archetype: 'wellness',
  design_url: 'https://ram.zenbin.org/pause',
  mock_url: 'https://ram.zenbin.org/pause-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Daily reflection and journaling app. Light theme — Cloud Dancer warm off-white base #F8F6F1. Desaturated sage green #5A8A6E accent. Georgia/Lora serif for all prompts and pull quotes, Inter sans for body. Anti-gamification: no streaks, no badges, no rings. Inspired by Dribbble calm-UI signal, Land-book Instrument Serif editorial wellness trend, Mobbin bottom-centric onboarding. 6 screens: Today, Journal, Reflect, Prompts, Onboarding, Write.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: PAUSE indexed ✓');
