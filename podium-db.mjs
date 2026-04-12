import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-podium-${Date.now()}`,
  status: 'done',
  app_name: 'Podium',
  tagline: 'The talks worth your time.',
  archetype: 'conference-discovery',
  design_url: 'https://ram.zenbin.org/podium',
  mock_url: 'https://ram.zenbin.org/podium-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Conference talk discovery & personal agenda builder. Inspired by Stripe Sessions 2026 editorial design (godly.website). Light theme: warm cream (#F7F4EE), indigo (#635BFF), teal (#2EC4B6). 5 screens: Discover (editorial home, featured talk card), Talk Detail (full-bleed accent header, meta pills), My Agenda (timeline with conflict warnings), Speaker Profile (dark header band, stats row), Browse (grouped by conference with filter pills).',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
