import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-arch-${Date.now()}`,
  app_name: 'ARCH',
  tagline: 'Architecture studio · project & commission tracker',
  archetype: 'architecture-studio',
  design_url: 'https://ram.zenbin.org/arch',
  mock_url: 'https://ram.zenbin.org/arch-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-mode architecture studio project tracker inspired by minimal.gallery editorial serif + warm cream Swiss grid aesthetic and Land-book Big Type genre. 6 screens: Dashboard, Projects, Detail (floor plan), Schedule, Team, Commission Brief.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: ARCH indexed ✓');
