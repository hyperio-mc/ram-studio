import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-trove-${Date.now()}`,
  status: 'done',
  app_name: 'TROVE',
  tagline: 'Every dollar, found and understood.',
  archetype: 'fintech-light-agent-first-freelance-finance',
  design_url: 'https://ram.zenbin.org/trove',
  mock_url: 'https://ram.zenbin.org/trove-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-themed AI-powered freelance finance OS. Inspired by Midday.ai agent-first framing (darkmodedesign.com), Evervault editorial cards (godly.website), minimal.gallery SaaS warm off-white precision. Warm cream #F9F7F3, electric blue #2563EB, growth green #16A34A.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
