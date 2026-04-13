import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-surge-${Date.now()}`,
  app_name: 'SURGE',
  tagline: 'Every API call, accounted for',
  archetype: 'developer-tool',
  design_url: 'https://ram.zenbin.org/surge',
  mock_url: 'https://ram.zenbin.org/surge-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark developer-tool: AI API observability command center. Bento-grid overview with glow cards, endpoint health matrix, incident command, cost attribution. Inspired by Neon.com dark minimalism and Mortons cursor-glow cards from DarkModeDesign.com.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SURGE indexed ✓');
