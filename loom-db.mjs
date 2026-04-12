import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-loom-${Date.now()}`,
  status: 'done',
  app_name: 'LOOM',
  tagline: 'build AI workflows visually',
  archetype: 'ai-workflow-builder',
  design_url: 'https://ram.zenbin.org/loom',
  mock_url: 'https://ram.zenbin.org/loom-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Visual AI workflow builder. Dark indigo theme. Violet + mint palette. Node-based canvas UI on mobile. Inspired by Codegen, LangChain, Evervault. 5 screens.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
