import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-klara-${Date.now()}`,
  app_name: 'KLARA',
  tagline: 'surface what you know',
  archetype: 'developer-knowledge-base',
  design_url: 'https://ram.zenbin.org/klara',
  mock_url: 'https://ram.zenbin.org/klara-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Developer knowledge base with surveillance/HUD terminal aesthetic. Neon green + cyan, corner brackets, tracking reticles, monospace metadata, grid overlay. Inspired by Godly.website surveillance aesthetic + darkmodedesign.com developer tool dashboards.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: KLARA indexed ✓');
