import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-pulsar-${Date.now()}`,
  app_name:     'PULSAR',
  tagline:      'Real-time API pulse monitor',
  archetype:    'developer-tools',
  design_url:   'https://ram.zenbin.org/pulsar',
  mock_url:     'https://ram.zenbin.org/pulsar-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark luxury API monitoring app — pure black base with aurora violet/cyan/green palette inspired by Orbi (darkmodedesign.com) multicolor light-streak gradient and Neon DB terminal green aesthetic. 6 screens: Dashboard, Endpoint Detail, Alert Center, Log Stream, Integrations, Settings.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: PULSAR indexed ✓');
