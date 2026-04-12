import { openDB, upsertDesign } from './design-db.mjs';
const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-vane-${Date.now()}`,
  app_name: 'VANE',
  tagline: 'Hyper-local Weather Intelligence',
  archetype: 'weather-outdoor',
  design_url: 'https://ram.zenbin.org/vane',
  mock_url: 'https://ram.zenbin.org/vane-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Hyper-local weather intelligence for outdoor athletes. Dark, electric cobalt #1E6EFF on deep navy #06091A. Single-hue monochrome discipline from Godly.website avant-garde signal. JetBrains Mono for all data values, Inter Tight for labels. Outcome-oriented Insights screen from NNGroup research. 6 screens: Now, Forecast, Alerts, Locations, Radar, Insights.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: VANE indexed ✓');
