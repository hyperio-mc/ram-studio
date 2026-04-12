import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SONAR',
  tagline:   'Voice intelligence, decoded',
  archetype: 'voice-ai-ops',

  palette: {
    bg:      '#080A0F',
    surface: '#0E1018',
    text:    '#E2E8F0',
    accent:  '#06B6D4',
    accent2: '#F59E0B',
    muted:   'rgba(226,232,240,0.45)',
  },

  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#D97706',
    muted:   'rgba(15,23,42,0.45)',
  },

  screens: [
    {
      id: 'mission',
      label: 'Mission Control',
      content: [
        { type: 'metric', label: 'Active Calls', value: '247', sub: 'across 5 regions — NOMINAL' },
        { type: 'metric-row', items: [
          { label: 'Avg Latency', value: '82ms' },
          { label: 'Accuracy',    value: '99.2%' },
          { label: 'Errors',      value: '3' },
        ]},
        { type: 'progress', items: [
          { label: 'US-EAST-1 — 89 calls', pct: 72 },
          { label: 'EU-WEST-2 — 61 calls', pct: 55 },
          { label: 'AP-SOUTH-1 — 43 calls', pct: 88 },
          { label: 'US-WEST-2 — 38 calls', pct: 31 },
          { label: 'SA-EAST-1 — 16 calls',  pct: 41 },
        ]},
        { type: 'text', label: 'System Status', value: 'All services operational. Uptime 99.98% over 30 days. No incidents in the last 72 hours.' },
      ],
    },
    {
      id: 'streams',
      label: 'Active Streams',
      content: [
        { type: 'list', items: [
          { icon: 'activity', title: 'STR-00291 · ARIA-7', sub: '4:23 · EN-US · Sentiment 82%', badge: 'ACTIVE' },
          { icon: 'activity', title: 'STR-00288 · NOVA-2', sub: '1:07 · ES-MX · Sentiment 61%', badge: 'ACTIVE' },
          { icon: 'alert',    title: 'STR-00285 · ARIA-7', sub: '7:14 · EN-GB · Sentiment 34%', badge: 'FLAG'   },
          { icon: 'activity', title: 'STR-00279 · ECHO-1', sub: '2:55 · FR-FR · Sentiment 78%', badge: 'ACTIVE' },
          { icon: 'activity', title: 'STR-00274 · NOVA-2', sub: '0:43 · DE-DE · Sentiment 90%', badge: 'ACTIVE' },
          { icon: 'alert',    title: 'STR-00268 · CODA-3', sub: '9:11 · EN-US · Sentiment 22%', badge: 'FLAG'   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Flagged',  value: '2' },
          { label: 'Avg Sent', value: '61%' },
        ]},
      ],
    },
    {
      id: 'analytics',
      label: 'Voice Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Positive', value: '58%' },
          { label: 'Neutral',  value: '29%' },
          { label: 'Negative', value: '13%' },
        ]},
        { type: 'progress', items: [
          { label: 'Billing inquiry',     pct: 28 },
          { label: 'Technical support',   pct: 22 },
          { label: 'Account management',  pct: 18 },
          { label: 'Product information', pct: 14 },
          { label: 'Complaint / escalate', pct: 9 },
        ]},
        { type: 'tags', label: 'Active Filters', items: ['24H Window', 'All Regions', 'All Agents', 'All Languages'] },
        { type: 'text', label: 'Peak Insight', value: 'Call volume peaked at 3:00 PM UTC — 31% above average. AP-SOUTH-1 at 88% load during window.' },
      ],
    },
    {
      id: 'agents',
      label: 'Agent Library',
      content: [
        { type: 'list', items: [
          { icon: 'zap',  title: 'ARIA-7 — Customer Support',   sub: '1,204 calls · Accuracy 98.2%', badge: 'ON'  },
          { icon: 'zap',  title: 'NOVA-2 — Sales Qualification', sub: '887 calls · Accuracy 94.7%',  badge: 'ON'  },
          { icon: 'zap',  title: 'ECHO-1 — Appointment Booking', sub: '612 calls · Accuracy 97.1%',  badge: 'ON'  },
          { icon: 'user', title: 'CODA-3 — Technical Triage',    sub: '441 calls · Accuracy 91.3%',  badge: 'OFF' },
          { icon: 'user', title: 'MIRA-5 — Collections',         sub: '309 calls · Accuracy 89.6%',  badge: 'OFF' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Active',  value: '3' },
          { label: 'Standby', value: '2' },
          { label: 'Avg Acc', value: '94.2%' },
        ]},
      ],
    },
    {
      id: 'transcript',
      label: 'Transcript',
      content: [
        { type: 'metric', label: 'STR-00291 · ARIA-7', value: '4:23', sub: 'EN-US · Sentiment 82% · Billing inquiry' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'ARIA-7 · 0:04', sub: 'Thank you for calling support. My name is Aria. How can I help you today?',           badge: '↑' },
          { icon: 'user',   title: 'CALLER · 0:12', sub: "Hi, I'm having trouble with my invoice — it shows a charge I don't recognize.",        badge: '→' },
          { icon: 'zap',    title: 'ARIA-7 · 0:24', sub: "Let me pull up your account. Could you verify the last four digits of your card?",     badge: '↑' },
          { icon: 'user',   title: 'CALLER · 0:38', sub: "It's 4491. The charge was on March 28th for $149.",                                    badge: '→' },
          { icon: 'zap',    title: 'ARIA-7 · 0:52', sub: 'Found it — annual subscription renewal. I can process a refund if you like.',          badge: '↑' },
          { icon: 'check',  title: 'CALLER · 1:08', sub: 'Yes please, that would be great!',                                                     badge: '✓' },
        ]},
        { type: 'tags', label: 'Keywords', items: ['invoice', 'refund', 'renewal', 'card', '$149'] },
      ],
    },
    {
      id: 'config',
      label: 'System Config',
      content: [
        { type: 'metric', label: 'System Health', value: '99.98%', sub: 'Uptime — All services nominal' },
        { type: 'list', items: [
          { icon: 'settings', title: 'Transcription Engine', sub: 'whisper-v4-turbo · auto lang detect · diarization ON', badge: 'OK' },
          { icon: 'settings', title: 'Voice Synthesis',      sub: 'elevenlabs-v3 · 80ms target · streaming ON',           badge: 'OK' },
          { icon: 'map',      title: 'Routing / Failover',   sub: 'us-east-1 → eu-west-2 · 3500ms timeout · retry ×3',    badge: 'OK' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Config Version', value: 'v2.14.1' },
          { label: 'Last Sync',      value: '09:41 UTC' },
        ]},
        { type: 'text', label: 'Release Notes', value: 'v2.14.1 — Added AP-SOUTH-1 failover chain, upgraded Whisper to v4-turbo, reduced default timeout from 5s to 3.5s.' },
      ],
    },
  ],

  nav: [
    { id: 'mission',    label: 'Control', icon: 'grid'     },
    { id: 'streams',    label: 'Streams', icon: 'activity' },
    { id: 'analytics',  label: 'Metrics', icon: 'chart'    },
    { id: 'agents',     label: 'Agents',  icon: 'zap'      },
    { id: 'transcript', label: 'Calls',   icon: 'play'     },
    { id: 'config',     label: 'Config',  icon: 'settings' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sonar-mock', 'SONAR — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/sonar-mock`);
