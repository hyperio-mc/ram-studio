import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { writeFileSync } from 'fs';

const design = {
  appName:   'RUNR',
  tagline:   'Your agents, in production.',
  archetype: 'ai-runtime-platform',
  palette: {           // DARK theme
    bg:      '#080810',
    surface: '#0F0F1A',
    text:    '#E8E6FF',
    accent:  '#6EE7B7',
    accent2: '#A78BFA',
    muted:   'rgba(232,230,255,0.38)',
  },
  lightPalette: {
    bg:      '#F0F2F8',
    surface: '#FFFFFF',
    text:    '#0D0D1A',
    accent:  '#059669',
    accent2: '#7C3AED',
    muted:   'rgba(13,13,26,0.42)',
  },
  screens: [
    {
      id: 'fleet', label: 'Fleet',
      content: [
        { type: 'text', label: 'Mon 24 Mar · 15:42 UTC', value: 'Agent Fleet' },
        { type: 'metric-row', items: [
          { label: 'Running', value: '12' },
          { label: 'Idle',    value: '8'  },
          { label: 'Failed',  value: '1'  },
          { label: 'Tasks/hr',value: '847'},
        ]},
        { type: 'progress', items: [
          { label: 'scraper-v3 · Run #312 · 2h 14m', pct: 78 },
          { label: 'embedder-xl · Run active · 1h 02m', pct: 91 },
          { label: 'summarizer · Run #89 · 45m',       pct: 54 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'scraper-v3',  sub: 'RUNNING · 312 tasks', badge: '●' },
          { icon: 'activity', title: 'summarizer',  sub: 'RUNNING · 89 tasks',  badge: '●' },
          { icon: 'zap',      title: 'embedder-xl', sub: 'RUNNING · 205 tasks', badge: '●' },
          { icon: 'eye',      title: 'classifier',  sub: 'IDLE · 0 tasks',      badge: '○' },
          { icon: 'alert',    title: 'router-edge', sub: 'ERROR · 503 upstream',badge: '!' },
        ]},
      ],
    },
    {
      id: 'live', label: 'Live',
      content: [
        { type: 'text', label: 'scraper-v3 · agt-a1b2', value: 'Run #312 in progress' },
        { type: 'metric-row', items: [
          { label: 'Model',   value: 'Sonnet' },
          { label: 'Avg',     value: '0.8s'  },
          { label: 'Cost/run',value: '$0.0024'},
          { label: 'Tokens',  value: '1.8k'  },
        ]},
        { type: 'progress', items: [
          { label: '✓ plan — Planning route (182ms)',           pct: 100 },
          { label: '✓ fetch — Fetching page (640ms)',          pct: 100 },
          { label: '⟳ extract — Extracting content…',         pct: 55  },
          { label: '· validate — Validate output (pending)',   pct: 0   },
          { label: '· store — Write to store (pending)',       pct: 0   },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '15:42:11 [INFO]',  sub: 'Agent started run #312',          badge: '✓' },
          { icon: 'check', title: '15:42:12 [INFO]',  sub: 'GET https://target.io — 200',     badge: '✓' },
          { icon: 'play',  title: '15:42:13 [INFO]',  sub: 'Extracting 48 items from DOM…',   badge: '⟳' },
        ]},
        { type: 'metric', label: 'Context window', value: '1,420 in · 384 out', sub: '~22% of 8,192 token limit' },
      ],
    },
    {
      id: 'traces', label: 'Traces',
      content: [
        { type: 'text', label: 'Last 50 runs · scraper-v3', value: 'Execution Traces' },
        { type: 'tags', label: 'Filter', items: ['All', 'Success', 'Error', 'Slow >2s'] },
        { type: 'list', items: [
          { icon: 'activity', title: '#312 · RUNNING',  sub: 'In progress · 1.8k tokens',    badge: '⟳' },
          { icon: 'check',    title: '#311 · SUCCESS',  sub: '1.2s · 2.1k tokens · $0.0026', badge: '✓' },
          { icon: 'check',    title: '#310 · SUCCESS',  sub: '0.9s · 1.9k tokens · $0.0022', badge: '✓' },
          { icon: 'alert',    title: '#309 · ERROR',    sub: '4.1s · TimeoutError 503',       badge: '✗' },
          { icon: 'check',    title: '#308 · SUCCESS',  sub: '1.1s · 2.0k tokens · $0.0024', badge: '✓' },
          { icon: 'zap',      title: '#307 · SLOW',     sub: '3.8s · 4.2k tokens · $0.0051', badge: '⚠' },
        ]},
        { type: 'text', label: 'Run #309 · Error detail', value: 'TimeoutError: fetch exceeded 4000ms. Server returned 503. Retry scheduled.' },
      ],
    },
    {
      id: 'logs', label: 'Logs',
      content: [
        { type: 'text', label: 'All agents · Live tail', value: 'Log Stream' },
        { type: 'tags', label: 'Level', items: ['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] },
        { type: 'list', items: [
          { icon: 'check', title: '15:42:13 INFO  scraper-v3',    sub: 'Extracting 48 items from DOM…',       badge: 'I' },
          { icon: 'check', title: '15:42:12 INFO  summarizer',    sub: 'Chunk 3/7 complete (tok: 284)',        badge: 'I' },
          { icon: 'alert', title: '15:42:11 WARN  embedder-xl',   sub: 'Rate limit approaching (87%)',         badge: 'W' },
          { icon: 'check', title: '15:42:10 INFO  scraper-v3',    sub: 'GET /products — 200 OK (640ms)',       badge: 'I' },
          { icon: 'alert', title: '15:42:08 ERROR router-edge',   sub: 'Upstream 503 — marking failed',        badge: 'E' },
          { icon: 'code',  title: '15:42:07 DEBUG classifier',    sub: 'Model warmed up, waiting…',            badge: 'D' },
        ]},
      ],
    },
    {
      id: 'settings', label: 'Keys',
      content: [
        { type: 'text', label: 'Manage runtime credentials', value: 'API Keys & Secrets' },
        { type: 'list', items: [
          { icon: 'lock', title: 'ANTHROPIC_KEY',  sub: 'sk-ant-••••••7F3A · All agents',    badge: '✓' },
          { icon: 'lock', title: 'OPENAI_KEY',     sub: 'sk-••••••••9K2B · embedder-xl',     badge: '✓' },
          { icon: 'lock', title: 'SCRAPER_TOKEN',  sub: 'tok_••••••••••• · scraper-v3',      badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'Anthropic — 340 / 1,000 RPM',   pct: 34 },
          { label: 'OpenAI — 87k / 100k TPM ⚠',     pct: 87 },
          { label: 'Scraper — 120 / 1,000 RPH',      pct: 12 },
        ]},
        { type: 'tags', label: 'Actions', items: ['+ Add Secret', 'Rotate Keys', 'Audit Log'] },
      ],
    },
  ],
  nav: [
    { id: 'fleet',    label: 'Fleet',   icon: 'grid'     },
    { id: 'live',     label: 'Live',    icon: 'activity' },
    { id: 'traces',   label: 'Traces',  icon: 'layers'   },
    { id: 'logs',     label: 'Logs',    icon: 'list'     },
    { id: 'settings', label: 'Keys',    icon: 'lock'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
writeFileSync('./runr-mock.html', html, 'utf8');
console.log('Mock HTML written locally');

const result = await publishMock(html, 'runr-agent-mock', 'RUNR — Interactive Mock');
console.log('Mock live at:', result.url);
