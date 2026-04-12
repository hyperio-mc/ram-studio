import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id:           `heartbeat-crew-${Date.now()}`,
  app_name:     'Crew',
  tagline:      'AI Workforce Platform',
  archetype:    'ai-workforce-productivity',
  design_url:   'https://ram.zenbin.org/crew',
  mock_url:     'https://ram.zenbin.org/crew-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Dark deep-slate AI workforce platform. Hire AI agents, manage task boards, review deliverables. Inspired by Paperclip "zero-human companies" trend and Evervault dark aesthetic. 683 elements.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: Crew indexed ✓');
