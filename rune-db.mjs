import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-rune-${Date.now()}`,
  status: 'done',
  app_name: 'Rune',
  tagline: 'Zero-config secret management for teams',
  archetype: 'developer-security',
  design_url: 'https://ram.zenbin.org/rune',
  mock_url: 'https://ram.zenbin.org/rune-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark-mode developer secret management app. Inspired by Twingate zero-trust (godly.website) and Evervault encryption tooling + Midday.ai financial clarity UI (darkmodedesign.com).',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
