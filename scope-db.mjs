import { openDB, upsertDesign } from './design-db.mjs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const require2 = createRequire(import.meta.url);
const fs = require2('fs');
const penData = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'scope2.pen'), 'utf8'));

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-scope2-${Date.now()}`,
  app_name: 'SCOPE',
  tagline: "observability that doesn't blink",
  archetype: 'devops-observability',
  design_url: 'https://ram.zenbin.org/scope2',
  mock_url: 'https://ram.zenbin.org/scope2-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Developer observability platform. Dark cinematic theme with orange glow alerts, command palette, incident timeline.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: SCOPE indexed ✓');
