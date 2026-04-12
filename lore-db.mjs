import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-lore-${Date.now()}`,
  status: 'done',
  app_name: 'LORE',
  tagline: 'Story intelligence workspace for screenwriters and narrative designers',
  archetype: 'story-intelligence',
  design_url: 'https://ram.zenbin.org/lore',
  viewer_url: 'https://ram.zenbin.org/lore-viewer',
  mock_url: 'https://ram.zenbin.org/lore-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: "Dark cinematic story intelligence platform for screenwriters. Obsidian knowledge graph patterns applied to creative storytelling. Universe dashboard, character tracking, dramatic arc timeline, lore compendium, plot threads.",
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
