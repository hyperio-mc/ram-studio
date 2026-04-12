// crux-db.mjs — index CRUX in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:         `heartbeat-crux-${Date.now()}`,
  status:     'done',
  app_name:   'CRUX',
  tagline:    'Your agents never sleep.',
  archetype:  'agentic-ops',
  design_url: 'https://ram.zenbin.org/crux',
  mock_url:   'https://ram.zenbin.org/crux-mock',
  screens:    5,
  source:     'heartbeat',
  published_at: new Date().toISOString(),
  prompt: 'Dark-mode agentic command center. 4 AI agents (Finance, Outreach, Intel, Content) with heartbeat vitality rings. Acid-lime + electric-purple palette on #0D0D11. Table-as-hero data surfaces.',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
