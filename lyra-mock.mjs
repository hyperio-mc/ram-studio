import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LYRA',
  tagline:   'AI Agent Orchestration. Command your fleet.',
  archetype: 'productivity',
  palette: {
    bg:      '#05060F',
    surface: '#0B0D1E',
    text:    '#E8E6FF',
    accent:  '#5548FF',
    accent2: '#00DDB5',
    muted:   'rgba(232, 230, 255, 0.38)',
  },
  screens: [
    {
      id: 'command', label: 'Command',
      content: [
        { type: 'metric', label: 'ACTIVE AGENTS', value: '24', sub: '● of 32 provisioned · ↑ 3 new today' },
        { type: 'metric-row', items: [
          { label: 'TASKS/HR',  value: '1,024' },
          { label: 'QUEUED',    value: '88'    },
          { label: 'ERRORS',    value: '2'     },
        ]},
        { type: 'progress', items: [
          { label: 'Inference — NOMINAL',   pct: 99 },
          { label: 'Embeddings — NOMINAL',  pct: 100 },
          { label: 'Storage — DEGRADED',    pct: 87 },
          { label: 'Webhooks — NOMINAL',    pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'lyra-7 finished task #4504',         sub: '8s ago',  badge: '✓ Done'  },
          { icon: 'zap',   title: 'lyra-3 queued: refactor-ui #4505',   sub: '31s ago', badge: '◈ Queue' },
          { icon: 'alert', title: 'lyra-11 error: rate limit exceeded',  sub: '1m ago',  badge: '✗ Error' },
          { icon: 'play',  title: 'lyra-2 started: analyze-logs #4503', sub: '2m ago',  badge: '● Live'  },
        ]},
      ],
    },
    {
      id: 'fleet', label: 'Fleet',
      content: [
        { type: 'metric-row', items: [
          { label: 'TOTAL',   value: '32' },
          { label: 'ACTIVE',  value: '24' },
          { label: 'IDLE',    value: '6'  },
          { label: 'ERROR',   value: '2'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All · 32', 'Active · 24', 'Idle · 6', 'Error · 2'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'lyra-alpha-7',  sub: 'claude-3-5-sonnet · Code review #4504', badge: '● ACTIVE'  },
          { icon: 'activity', title: 'lyra-beta-3',   sub: 'gpt-4o · Refactor UI module',            badge: '● ACTIVE'  },
          { icon: 'alert',    title: 'lyra-gamma-11', sub: 'claude-3-5-sonnet · Rate limit error',   badge: '✗ ERROR'   },
          { icon: 'activity', title: 'lyra-delta-2',  sub: 'claude-3-haiku · Analyze logs #4503',   badge: '● ACTIVE'  },
          { icon: 'eye',      title: 'lyra-eta-5',    sub: 'gpt-4o-mini · Idle',                     badge: '○ IDLE'    },
          { icon: 'activity', title: 'lyra-zeta-9',   sub: 'claude-3-opus · Summarize reports',      badge: '● ACTIVE'  },
        ]},
      ],
    },
    {
      id: 'task', label: 'Tasks',
      content: [
        { type: 'metric', label: 'TASK #4504 · TOKEN USAGE', value: '38.2K', sub: 'of 100K limit · lyra-alpha-7' },
        { type: 'progress', items: [
          { label: 'Cloned repository ✓',          pct: 100 },
          { label: 'Parsed 847 source files ✓',    pct: 100 },
          { label: 'Identifying issues… ◉',        pct: 62  },
          { label: 'Generate recommendations ○',   pct: 0   },
          { label: 'Output final report ○',         pct: 0   },
        ]},
        { type: 'list', items: [
          { icon: 'code',  title: '[1m 12s] Scanning /src/components/Button.tsx…', sub: 'In progress', badge: '◉ Now'  },
          { icon: 'check', title: '[1m 02s] Parsing App.tsx — 612 loc',            sub: 'Complete',    badge: '✓ Done' },
          { icon: 'check', title: '[0m 44s] Checking peer dependencies…',          sub: 'Complete',    badge: '✓ Done' },
          { icon: 'check', title: '[0m 09s] Repository cloned ✓',                  sub: 'Complete',    badge: '✓ Done' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Stats',
      content: [
        { type: 'metric', label: 'TASK SUCCESS RATE · 7D', value: '98.1%', sub: '↑ 0.8% vs last week' },
        { type: 'metric-row', items: [
          { label: 'TOTAL TASKS',   value: '18.4K'  },
          { label: 'AVG DURATION',  value: '3m 51s' },
          { label: 'TOKENS / DAY',  value: '2.8M'   },
        ]},
        { type: 'progress', items: [
          { label: 'claude-3-5-sonnet — 54%', pct: 54 },
          { label: 'gpt-4o — 26%',            pct: 26 },
          { label: 'claude-3-opus — 13%',      pct: 13 },
          { label: 'gpt-4o-mini — 7%',         pct: 7  },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'P50 Latency',  sub: '1.8 seconds average',  badge: '● OK'  },
          { icon: 'chart', title: 'P95 Latency',  sub: '7.2 seconds average',  badge: '⚠ Watch' },
          { icon: 'chart', title: 'P99 Latency',  sub: '16.4 seconds average', badge: '● OK'  },
          { icon: 'zap',   title: 'Error Rate',   sub: '1.9% of all tasks',    badge: '● OK'  },
        ]},
      ],
    },
    {
      id: 'configure', label: 'Config',
      content: [
        { type: 'text', label: 'NEW AGENT WIZARD · STEP 3 OF 4', value: 'Configure permissions for lyra-epsilon-12. Choose what resources this agent can access during task execution.' },
        { type: 'list', items: [
          { icon: 'check',  title: 'File System Read',  sub: 'Access workspace files',    badge: '✓ ON'  },
          { icon: 'check',  title: 'File System Write', sub: 'Modify and create files',   badge: '✓ ON'  },
          { icon: 'lock',   title: 'Network Access',    sub: 'Fetch external URLs',       badge: '○ OFF' },
          { icon: 'lock',   title: 'Shell Execution',   sub: 'Run bash commands',         badge: '○ OFF' },
        ]},
        { type: 'tags', label: 'Selected Model', items: ['claude-3-5-sonnet-20241022', 'RECOMMENDED'] },
        { type: 'metric-row', items: [
          { label: 'AGENT NAME',   value: 'lyra-ε-12' },
          { label: 'MODEL',        value: 'Claude 3.5' },
          { label: 'PERMISSIONS',  value: '2 / 4'      },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'command',   label: 'Command',  icon: 'home'     },
    { id: 'fleet',     label: 'Fleet',    icon: 'layers'   },
    { id: 'task',      label: 'Tasks',    icon: 'list'     },
    { id: 'analytics', label: 'Stats',    icon: 'chart'    },
    { id: 'configure', label: 'Config',   icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building LYRA Svelte 5 mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'lyra-mock', 'LYRA — Interactive Mock');
console.log('Mock live at:', result.url);
