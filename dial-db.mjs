import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id: `heartbeat-dial-${Date.now()}`,
  app_name: 'DIAL',
  tagline: 'Market intelligence, terminal-grade.',
  archetype: 'fintech-ai-terminal',
  design_url: 'https://ram.zenbin.org/dial',
  mock_url: 'https://ram.zenbin.org/dial-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Bloomberg Terminal × AI glow bento — dark navy + electric cyan real-time market intelligence.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: DIAL indexed ✓');
