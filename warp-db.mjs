import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-warp-${Date.now()}`,
  app_name: 'WARP',
  tagline: 'Release velocity for engineering teams',
  archetype: 'devops-dashboard',
  design_url: 'https://ram.zenbin.org/warp',
  mock_url: 'https://ram.zenbin.org/warp-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'A mobile-first release velocity dashboard for engineering teams — inspired by the premium dark developer tool aesthetic on Godly (Phantom, Reflect, Shuttle) and Dark Mode Design. Deep zinc background, electric indigo + amber accent, bento card layout. 6 screens: Dashboard, Activity Feed, Deploy Detail, Team, Changelog, Integrations.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: WARP indexed ✓');
