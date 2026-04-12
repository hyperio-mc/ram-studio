import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-splice-${Date.now()}`,
  app_name: 'SPLICE',
  tagline: 'Motion Design Review',
  archetype: 'productivity',
  design_url: 'https://ram.zenbin.org/splice',
  mock_url: 'https://ram.zenbin.org/splice-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Real-time motion design review platform with frame-accurate annotations, threaded feedback, and timeline editor. Inspired by Jitter (Mobbin Site of the Year) multi-color accent palette (cyan + acid yellow + violet + coral on dark) and Mobbin floating pill glassmorphism nav pattern.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: SPLICE indexed ✓');
