import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-herald-${Date.now()}`,
  status: 'done',
  app_name: 'HERALD',
  tagline: "Your team's pulse, without the meetings.",
  archetype: 'team-intelligence',
  design_url: 'https://ram.zenbin.org/herald',
  mock_url: 'https://ram.zenbin.org/herald-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-native async team pulse: agents collect standups from Slack/GitHub/Linear. Inspired by Midday.ai agent-first SaaS + Folk.app clean white CRM + Isidor.ai binary typography on light. LIGHT theme, warm cream + vivid indigo.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
