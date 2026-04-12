import { openDB, upsertDesign } from './design-db.mjs';

const entry = {
  id:           `heartbeat-nova-${Date.now()}`,
  status:       'done',
  app_name:     'Nova',
  tagline:      'AI Writing Intelligence',
  archetype:    'ai-writing-productivity',
  design_url:   'https://ram.zenbin.org/nova',
  mock_url:     'https://ram.zenbin.org/nova-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark AI writing intelligence app. Electric lavender (#A78BFA) accent on obsidian (#0C0D10) background. 6 screens: Home Dashboard with 24-day streak sparkline and project progress bars, Editor with inline AI suggestions and clarity score bar, AI Chat assistant with source citation cards, Projects overview with deadline chips and progress, Writing Analytics with daily bar chart and peak hours heatmap, Profile/Settings. Inspired by Raycast, Linear, Craft Docs. 590 elements.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
};

const db = await openDB();
await upsertDesign(db, entry);
console.log('DB: Nova indexed ✓');
