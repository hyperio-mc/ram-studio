import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:          'heartbeat-lens-' + Date.now(),
  status:      'done',
  app_name:    'LENS',
  tagline:     'AI agent observability platform',
  archetype:   'developer-tools-dark',
  design_url:  'https://zenbin.org/p/lens',
  viewer_url:  'https://zenbin.org/p/lens-viewer',
  mock_url:    'https://zenbin.org/p/lens-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:      'RAM Design Heartbeat',
  prompt:      'Inspired by Linear.app "for teams and agents" shift spotted on darkmodedesign.com + Midday.ai agent-first SaaS. Dark near-black #09090F + electric violet #7C5CFC + teal #2DCBBA. AI agent ops dashboard: Mission Control, Agents list, Live Task Stream, Usage & Cost, Alerts.',
  screens:     5,
  source:      'heartbeat',
  theme:       'dark',
  palette:     '#09090F,#7C5CFC,#2DCBBA,#22D17A,#FF4757',
});
rebuildEmbeddings(db);
console.log('LENS indexed in design DB');
