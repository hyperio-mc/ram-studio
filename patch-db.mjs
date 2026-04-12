import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = await openDB();

await upsertDesign(db, {
  id: 'patch',
  name: 'PATCH',
  tagline: 'Know your land.',
  theme: 'dark',
  archetype: 'precision-agriculture-dark',
  palette: JSON.stringify({ bg: '#0A0F07', surface: '#111A0C', accent: '#6ED940', accent2: '#E8B233', text: '#E8F0E2' }),
  screens: 5,
  elements: 361,
  url: 'https://ram.zenbin.org/patch',
  viewerUrl: 'https://ram.zenbin.org/patch-viewer',
  mockUrl: 'https://ram.zenbin.org/patch-mock',
  inspiration: 'RonDesignLab satellite zone UI (Dribbble); Drink Mockly bold dark typography (siteinspire)',
  heartbeat: 6,
  tags: 'agriculture,precision-farming,satellite,dark,zone-mapping,soil-sensors,yield-forecast,AI',
  createdAt: new Date().toISOString(),
});

await rebuildEmbeddings(db);
console.log('✅ PATCH indexed in design DB');
