import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-kairo-${Date.now()}`,
  app_name: 'KAIRO',
  tagline: 'AI codebase intelligence, distilled',
  archetype: 'developer-tools',
  design_url: 'https://ram.zenbin.org/kairo',
  mock_url: 'https://ram.zenbin.org/kairo-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark AI developer tool dashboard with bento grid layout, command palette overlay, and invisible AI infrastructure — inspired by DarkModeDesign.com deep navy dev aesthetics and Saaspo calm/spotlight UX (Linear/Vercel philosophy)',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: KAIRO indexed ✓');
