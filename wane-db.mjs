import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-wane-${Date.now()}`,
  app_name: 'WANE',
  tagline: 'Wind down. Find your rhythm.',
  archetype: 'ai-circadian-wellness',
  design_url: 'https://ram.zenbin.org/wane',
  viewer_url: 'https://ram.zenbin.org/wane-viewer',
  mock_url: 'https://ram.zenbin.org/wane-mock',
  theme: 'dark',
  palette: 'midnight indigo, violet glow, teal neon, amber warmth',
  screens: 6,
  source: 'heartbeat',
  prompt: 'AI circadian rhythm companion. Focus sessions, mood check-ins, sleep ritual, insights. Dark neon-wellness aesthetic from darkmodedesign.com + land-book Dawn AI feature Apr 2026.',
  published_at: new Date().toISOString(),
});
rebuildEmbeddings(db);
console.log('Indexed WANE in design DB ✓');
