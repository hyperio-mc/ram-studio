import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-echo-voice-${Date.now()}`,
  status: 'done',
  app_name: 'Echo',
  tagline: 'Async voice messaging for distributed teams',
  archetype: 'communication',
  design_url: 'https://ram.zenbin.org/echo-voice',
  mock_url: 'https://ram.zenbin.org/echo-voice-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark UI voice messaging app for async teams. Pure-black foundation, electric violet/teal accents, waveform motifs, auto-transcription. Inspired by Format Podcasts and Haptic.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
