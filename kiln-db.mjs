import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-kiln-${Date.now()}`,
  app_name: 'KILN',
  tagline: 'Build & Deploy Pipeline Monitor',
  archetype: 'developer-tools',
  design_url: 'https://ram.zenbin.org/kiln',
  mock_url: 'https://ram.zenbin.org/kiln-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Build and deploy pipeline CI/CD monitor. Dark warm near-black #120F0A with amber accent. Inter Tight + JetBrains Mono type system. Inspired by absence of warm-tone dark dashboards (Awwwards), MICRODOT clinical reference codes (Siteinspire), NNGroup AI agent legibility research. 6 screens: Pipeline, Build detail, Live logs, Deployments, Metrics, Config.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: KILN indexed ✓');
