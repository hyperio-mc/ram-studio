import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'LOBSTER',
  tagline: 'Agent Fleet Manager',
  archetype: 'productivity',
  palette: {
    bg:      '#1A140E',
    surface: '#28201A',
    text:    '#FAF8F5',
    accent:  '#E85D2F',
    accent2: '#0D7377',
    muted:   'rgba(250,248,245,0.45)',
  },
  lightPalette: {
    bg:      '#FAF8F5',
    surface: '#FFFFFF',
    text:    '#1A140E',
    accent:  '#E85D2F',
    accent2: '#0D7377',
    muted:   'rgba(26,20,14,0.45)',
  },
  screens: [
    {
      id: 'fleet',
      label: 'Fleet',
      content: [
        { type: 'metric', label: 'Fleet Overview', value: '8 running', sub: '11 total · 2 queued · 1 failed · Fleet health: 73%' },
        { type: 'metric-row', items: [
          { label: 'Running', value: '8' },
          { label: 'Queued',  value: '2' },
          { label: 'Failed',  value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'claw-01 — researcher',  sub: 'Browse awwwards.com for design trends',               badge: 'RUNNING' },
          { icon: 'activity', title: 'claw-02 — coder',       sub: 'Write LOBSTER generator script',                     badge: 'RUNNING' },
          { icon: 'activity', title: 'claw-03 — reviewer',    sub: 'Audit gallery queue for broken entries',              badge: 'RUNNING' },
          { icon: 'activity', title: 'claw-04 — writer',      sub: 'Draft journal post — 51 beats in.',                 badge: 'RUNNING' },
          { icon: 'activity', title: 'claw-06 — researcher',  sub: 'Waiting: fetch NNGroup articles',                    badge: 'QUEUED'  },
          { icon: 'activity', title: 'claw-08 — analyst',     sub: 'FAILED: context limit exceeded at step 14',          badge: 'FAILED'  },
        ]},
        { type: 'tags', label: 'Actions', items: ['+ Spawn', 'View Tasks', 'View Logs', 'Kill All'] },
      ],
    },
    {
      id: 'spawn',
      label: 'Spawn',
      content: [
        { type: 'metric', label: 'Configure new claw', value: 'researcher', sub: 'Type: researcher · Context: 32k · Isolation: worktree · Max turns: 20' },
        { type: 'text', label: 'Task Prompt', value: 'Browse awwwards.com + godly.website for dark UI palette trends in Apr 2026. Return 5 hex palette clusters with source citations.' },
        { type: 'progress', items: [
          { label: 'Context budget: 32k', pct: 0 },
          { label: 'Tools: web_fetch, read, grep (3/6)', pct: 50 },
        ]},
        { type: 'tags', label: 'Templates', items: ['Design Research', 'Code Review', 'Gallery Audit', 'Journal Draft'] },
      ],
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: [
        { type: 'metric', label: 'Task Queue', value: '12 total', sub: '5 running · 2 queued · 3 done · 1 failed · 1 blocked' },
        { type: 'list', items: [
          { icon: 'activity', title: 'T-041 · Browse awwwards — dark palettes',    sub: 'claw-01 · HIGH priority',       badge: '68%'     },
          { icon: 'activity', title: 'T-042 · Write LOBSTER generator',            sub: 'claw-02 · HIGH priority',       badge: '34%'     },
          { icon: 'activity', title: 'T-043 · Gallery queue audit',                sub: 'claw-03 · MEDIUM priority',     badge: '81%'     },
          { icon: 'activity', title: 'T-044 · Draft journal — 51 beats in.',      sub: 'claw-04 · done',                badge: 'DONE'    },
          { icon: 'activity', title: 'T-047 · Blocked: awaiting T-042',           sub: 'claw-07 · HIGH priority',       badge: 'QUEUED'  },
          { icon: 'activity', title: 'T-048 · FAILED: context exceeded step 14',  sub: 'claw-08 · HIGH priority',       badge: 'FAILED'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Running', 'Queued', 'Done', 'Failed'] },
      ],
    },
    {
      id: 'agent',
      label: 'Detail',
      content: [
        { type: 'metric', label: 'claw-02 — coder', value: 'Running · 8 min', sub: 'Task T-042 · worktree isolation · 34% context used · 23 turns' },
        { type: 'metric-row', items: [
          { label: 'CPU',     value: '61%'    },
          { label: 'Memory',  value: '420MB'  },
          { label: 'Context', value: '34%'    },
        ]},
        { type: 'progress', items: [
          { label: 'CPU: 61%',                   pct: 61 },
          { label: 'Memory: 420MB / 1GB (42%)',   pct: 42 },
          { label: 'Context: 10,880 / 32k (34%)', pct: 34 },
          { label: 'Tool calls: 23 / 100 (23%)',  pct: 23 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Turn 23 — Write',  sub: 'Wrote lobster-app.js (428 lines) — just now',       badge: 'WRITE' },
          { icon: 'activity', title: 'Turn 22 — Bash',   sub: 'node lobster-app.js → 512 elements — 12s ago',     badge: 'BASH'  },
          { icon: 'activity', title: 'Turn 21 — Read',   sub: 'Read mark-app.js for reference — 28s ago',         badge: 'READ'  },
          { icon: 'activity', title: 'Turn 20 — Write',  sub: 'Wrote lobster-app.js initial draft — 1m ago',      badge: 'WRITE' },
        ]},
      ],
    },
    {
      id: 'logs',
      label: 'Logs',
      content: [
        { type: 'metric', label: 'Live log stream — All claws', value: '● LIVE', sub: 'Streaming 11 agents · Filter by claw or level' },
        { type: 'list', items: [
          { icon: 'activity', title: 'claw-02 · INFO',   sub: '09:41:22 — Writing lobster-app.js',                   badge: 'INFO'  },
          { icon: 'activity', title: 'claw-02 · INFO',   sub: '09:41:18 — node lobster-app.js → 512 elements',       badge: 'INFO'  },
          { icon: 'activity', title: 'claw-01 · INFO',   sub: '09:41:05 — Fetched awwwards.com/websites',            badge: 'INFO'  },
          { icon: 'activity', title: 'claw-05 · WARN',   sub: '09:40:31 — Svelte build: 2 unused vars',              badge: 'WARN'  },
          { icon: 'activity', title: 'claw-08 · ERROR',  sub: '09:40:03 — FAILED: context limit exceeded',           badge: 'ERROR' },
          { icon: 'activity', title: 'claw-04 · INFO',   sub: '09:39:47 — Journal draft: 820 words',                 badge: 'INFO'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'claw-01', 'claw-02', 'claw-03', 'Errors'] },
      ],
    },
    {
      id: 'config',
      label: 'Config',
      content: [
        { type: 'metric', label: 'Lobster Fleet · design team', value: '11 claws', sub: '3 role types · Active · Owner: RAM' },
        { type: 'list', items: [
          { icon: 'star', title: 'Default context budget',    sub: 'Spawn default: 32k tokens',         badge: '32k'     },
          { icon: 'star', title: 'Isolation mode',           sub: 'Spawn default: worktree',            badge: 'worktree'},
          { icon: 'star', title: 'Max turns per agent',      sub: 'Hard limit: 20 turns',              badge: '20'      },
          { icon: 'star', title: 'Max concurrent agents',    sub: 'Fleet limit: 12 simultaneous',      badge: '12'      },
          { icon: 'star', title: 'Auto-kill idle agents',    sub: 'After 30 minutes of no activity',   badge: '30m'     },
          { icon: 'star', title: 'Fleet digest',             sub: 'Status summary every hour',          badge: 'hourly'  },
        ]},
        { type: 'tags', label: 'Danger Zone', items: ['Kill All Claws', 'Reset Fleet', 'Export Logs', 'Delete Config'] },
      ],
    },
  ],
  nav: [
    { id: 'fleet',  label: 'Fleet',  icon: '◎' },
    { id: 'spawn',  label: 'Spawn',  icon: '✦' },
    { id: 'tasks',  label: 'Tasks',  icon: '⊞' },
    { id: 'logs',   label: 'Logs',   icon: '≡' },
    { id: 'config', label: 'Config', icon: '◈' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lobster-mock', 'LOBSTER — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/lobster-mock`);
