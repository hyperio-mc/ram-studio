import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-solace-${Date.now()}`,
  status: 'done',
  app_name: 'Solace',
  tagline: 'Your quiet corner for reflection',
  archetype: 'wellness-journal',
  design_url: 'https://ram.zenbin.org/solace',
  mock_url: 'https://ram.zenbin.org/solace-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Warm editorial light-theme journaling app inspired by Dawn (land-book.com) and Maxima Therapy (Awwwards). Terracotta + sage palette, Playfair Display serif, mood heatmap, guided breathing circle.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  tags: ['wellness', 'journaling', 'mental-health', 'editorial', 'light-theme', 'serif'],
});

rebuildEmbeddings(db);
console.log('Indexed Solace in design DB');
