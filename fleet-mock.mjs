import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FLEET',
  tagline:   'Run your agents, not your tools.',
  archetype: 'developer-tools',

  palette: {  // Dark (primary)
    bg:      '#080C12',
    surface: '#0F1520',
    text:    '#E8EDF5',
    accent:  '#22D3EE',
    accent2: '#A78BFA',
    muted:   'rgba(232,237,245,0.4)',
  },

  lightPalette: {  // Light variant
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0F1A2E',
    accent:  '#0891B2',
    accent2: '#7C3AED',
    muted:   'rgba(15,26,46,0.4)',
  },

  screens: [
    {
      id: 'screen1', label: 'Mission Control',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',  value: '14'   },
          { label: 'Queued',  value: '53'   },
          { label: 'Done',    value: '2.8K' },
        ]},
        { type: 'text', label: 'Agent Status', value: '4 agents monitored · radial health rings' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Scout-01',  sub: 'Fetched 342 records · batch 3/4',    badge: '●' },
          { icon: 'check',    title: 'Recon-07',  sub: 'Webhook delivered → Slack #ops',      badge: '✓' },
          { icon: 'zap',      title: 'Forge-12',  sub: 'Generated Q2 PDF report (4.2 MB)',    badge: '✓' },
          { icon: 'alert',    title: 'Sync-03',   sub: 'Rate-limited — retry in 28s',         badge: '!' },
        ]},
      ],
    },
    {
      id: 'screen2', label: 'Agent Fleet',
      content: [
        { type: 'text', label: 'Fleet Status', value: '16 deployed · 14 active · 1 warning' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Scout-01',  sub: 'Web Scraper · 88% health',    badge: '88%' },
          { icon: 'star',     title: 'Recon-07',  sub: 'Data Enrichment · 97% health', badge: '97%' },
          { icon: 'alert',    title: 'Sync-03',   sub: 'API Connector · 40% health',   badge: '40%' },
          { icon: 'layers',   title: 'Forge-12',  sub: 'Report Builder · 75% health',  badge: '75%' },
          { icon: 'eye',      title: 'Pulse-04',  sub: 'Health Monitor · Idle',         badge: '—'   },
          { icon: 'bell',     title: 'Echo-09',   sub: 'Notif Relay · 91% health',      badge: '91%' },
        ]},
      ],
    },
    {
      id: 'screen3', label: 'Task Queue',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running',   value: '14'  },
          { label: 'Pending',   value: '53'  },
          { label: 'Critical',  value: '1'   },
        ]},
        { type: 'progress', items: [
          { label: 'TK-4821 Crawl pricing pages (Scout-01)',   pct: 68 },
          { label: 'TK-4819 Enrich 500 leads (Recon-07)',     pct: 91 },
          { label: 'TK-4817 Q2 pipeline report (Forge-12)',   pct: 34 },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'TK-4820 Send daily digest',     sub: 'CRITICAL', badge: '!' },
          { icon: 'activity', title: 'TK-4818 Sync CRM to HubSpot',  sub: 'HIGH',     badge: '↑' },
          { icon: 'list',     title: 'TK-4816 Archive completed',     sub: 'NORMAL',   badge: '·' },
        ]},
      ],
    },
    {
      id: 'screen4', label: 'Trace Log',
      content: [
        { type: 'metric-row', items: [
          { label: 'Steps',    value: '12/18' },
          { label: 'Duration', value: '4m 12s' },
          { label: 'Tokens',   value: '14.2K' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: '01 Initialize agent context',    sub: '0.1s',  badge: '✓' },
          { icon: 'check',    title: '02 Load URL list (342 targets)', sub: '0.4s',  badge: '✓' },
          { icon: 'check',    title: '03 OAuth2 authentication',      sub: '1.2s',  badge: '✓' },
          { icon: 'check',    title: '04 Fetch batch 1/4',            sub: '12.4s', badge: '✓' },
          { icon: 'check',    title: '11 LLM extraction pass',        sub: '8.7s',  badge: '✓' },
          { icon: 'activity', title: '12 Fetch batch 4/4',            sub: '...',   badge: '◎' },
          { icon: 'eye',      title: '13 Final dedup + merge',        sub: '—',     badge: '○' },
          { icon: 'eye',      title: '14 Write to database',          sub: '—',     badge: '○' },
        ]},
      ],
    },
    {
      id: 'screen5', label: 'Deploy Agent',
      content: [
        { type: 'text',  label: 'Agent Name',   value: 'e.g. Scout-02' },
        { type: 'text',  label: 'Agent Type',   value: 'Web Scraper ▾' },
        { type: 'text',  label: 'Source URL',   value: 'https://target.example.com' },
        { type: 'tags',  label: 'Trigger Type', items: ['Schedule', 'Webhook', 'Manual'] },
        { type: 'text',  label: 'Cron',         value: '0 */6 * * *  ·  Every 6 hours' },
        { type: 'metric', label: 'Status', value: 'Ready', sub: 'Agent will start within 30 seconds' },
      ],
    },
  ],

  nav: [
    { id: 'screen1', label: 'Control', icon: 'grid'     },
    { id: 'screen2', label: 'Fleet',   icon: 'layers'   },
    { id: 'screen3', label: 'Queue',   icon: 'list'     },
    { id: 'screen4', label: 'Trace',   icon: 'activity' },
    { id: 'screen5', label: 'Deploy',  icon: 'play'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'fleet-mock', 'FLEET — Interactive Mock');
console.log('Mock live at:', result.url);
