import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-cairn-${Date.now()}`,
  app_name: 'CAIRN',
  tagline: 'Trail Planning & Field Notes',
  archetype: 'outdoor-productivity',
  design_url: 'https://ram.zenbin.org/cairn',
  mock_url: 'https://ram.zenbin.org/cairn-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Trail planning and field notes app for serious hikers. Inspired by Land-book tech-spec grid aesthetic (topographic contour lines as design element, monospace coordinates throughout) and Godly barely-there UI (chrome eliminated, typography carries weight). Light theme: parchment canvas #F6F3EE, forest green #3A7A52 trail accent, amber #C67E1A for warnings. Ruled-paper notes screen with red margin line. Bottom-centric architecture (Mobbin pattern). 6 screens: Map, Routes, Notes, Elevation, Waypoint, Active Tracking.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: CAIRN indexed ✓');
