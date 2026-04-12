import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-apex-${Date.now()}`,
  status: 'done',
  app_name: 'APEX',
  tagline: 'Peak code quality, every sprint.',
  archetype: 'code-quality-saas',
  design_url: 'https://ram.zenbin.org/apex',
  mock_url: 'https://ram.zenbin.org/apex-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-mode code quality intelligence dashboard inspired by Codegen OS for Code Agents trend on land-book.com. Warm orange accents on paper-white editorial style. 5 screens: Overview, Issues, Coverage, Insights, Trends.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
