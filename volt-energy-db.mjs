import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-volt-energy-${Date.now()}`,
  status: 'done',
  app_name: 'VOLT',
  tagline: 'Know Your Energy',
  archetype: 'athlete-biometrics',
  design_url: 'https://ram.zenbin.org/volt-energy',
  mock_url: 'https://ram.zenbin.org/volt-energy-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark athlete biometrics app — readiness score ring, HRV tracking, strain monitoring, body composition, AI insights. Volt yellow on deep black. Inspired by Fluid Glass Awwwards SOTD.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
