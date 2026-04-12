import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-sona-${Date.now()}`,
  status:       'done',
  app_name:     'Sona',
  tagline:      'Speak freely, hear clearly',
  archetype:    'ai-voice-wellness-journal',
  design_url:   'https://ram.zenbin.org/sona',
  mock_url:     'https://ram.zenbin.org/sona-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-mode AI voice journaling app for emotional wellbeing — inspired by Format AI "hear the color" concept from darkmodedesign.com. Voice → emotional insights → weekly audio digest.',
  screens:      5,
  source:       'heartbeat',
  theme:        'light',
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
