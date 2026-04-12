import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Conductor',
  tagline:   'Orchestrate your AI agents, effortlessly',
  archetype: 'ai-ops-dashboard',

  palette: {          // dark theme
    bg:      '#13121A',
    surface: '#1C1B26',
    text:    '#F0EFF8',
    accent:  '#7B6FF5',
    accent2: '#F59E0B',
    muted:   'rgba(240,239,248,0.4)',
  },
  lightPalette: {     // light theme
    bg:      '#F5F4F1',
    surface: '#FFFFFF',
    text:    '#18181A',
    accent:  '#5046E5',
    accent2: '#F59E0B',
    muted:   'rgba(24,24,26,0.42)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Agents', value: '3' },
          { label: 'Tasks Done',    value: '47' },
          { label: 'Avg Speed',     value: '1.8s' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Researcher',  sub: 'Scanning tech papers · batch 4/12', badge: '67%' },
          { icon: 'activity', title: 'Codesmith',   sub: 'Refactoring auth module · pass 2',  badge: '34%' },
          { icon: 'alert',    title: 'Validator',   sub: 'Schema lint failed · retry #2',     badge: 'ERR' },
          { icon: 'eye',      title: 'Summariser',  sub: 'Idle — awaiting task assignment',   badge: '—'   },
        ]},
        { type: 'text', label: 'Live Feed', value: 'Researcher completed batch 3 · Validator error: lint schema.v2 · Codesmith started auth pass 2' },
      ],
    },
    {
      id: 'agent-detail', label: 'Agent Detail',
      content: [
        { type: 'metric', label: 'Researcher — Running', value: '94%', sub: 'Accuracy · last 50 tasks' },
        { type: 'metric-row', items: [
          { label: 'Tasks Done', value: '36' },
          { label: 'Speed',      value: '2.1s' },
          { label: 'Batch',      value: '4/12'  },
        ]},
        { type: 'progress', items: [
          { label: 'Current Batch Progress', pct: 67 },
          { label: 'Daily Task Target',      pct: 82 },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: '14:22', sub: 'Batch 4 started — 12 items queued' },
          { icon: 'check',    title: '14:18', sub: 'Batch 3 complete — 12/12 ✓' },
          { icon: 'settings', title: '14:11', sub: 'Source filter applied (tech, AI)' },
          { icon: 'check',    title: '13:55', sub: 'Batch 2 complete — 12/12 ✓' },
        ]},
      ],
    },
    {
      id: 'tasks', label: 'Task Queue',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',   value: '6' },
          { label: 'Running', value: '2' },
          { label: 'Queued',  value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'T-091 · Summarise paper batch', sub: 'Researcher — HIGH',  badge: '67%' },
          { icon: 'activity', title: 'T-090 · Refactor auth module',  sub: 'Codesmith — HIGH',   badge: '34%' },
          { icon: 'alert',    title: 'T-089 · Lint schema v2.1',      sub: 'Validator — MED',    badge: 'ERR' },
          { icon: 'list',     title: 'T-088 · Generate API docs',     sub: 'Unassigned — LOW',   badge: 'Q'   },
          { icon: 'list',     title: 'T-087 · Unit test coverage',    sub: 'Unassigned — MED',   badge: 'Q'   },
          { icon: 'eye',      title: 'T-086 · Summarise Q1 metrics',  sub: 'Summariser — LOW',   badge: 'IDL' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Tasks', value: '120' },
          { label: 'Success',     value: '96%' },
          { label: 'Errors',      value: '5'   },
        ]},
        { type: 'progress', items: [
          { label: 'Researcher efficiency', pct: 96 },
          { label: 'Codesmith efficiency',  pct: 88 },
          { label: 'Summariser efficiency', pct: 72 },
          { label: 'Validator efficiency',  pct: 60 },
        ]},
        { type: 'tags', label: 'Top Task Types', items: ['Research', 'Code Review', 'Summarise', 'Lint', 'Test', 'Docs'] },
        { type: 'text', label: 'Insight', value: 'Researcher leads with 47 tasks today (+18% vs yesterday). Validator errors down 2 from yesterday.' },
      ],
    },
    {
      id: 'compose', label: 'Compose Task',
      content: [
        { type: 'text', label: 'Task Name', value: 'Summarise Q1 growth metrics and generate executive summary' },
        { type: 'text', label: 'Instructions', value: 'Analyse Q1 2026 dashboard data. Output: 3-paragraph executive summary, 5 key numbers, and 2 recommendations.' },
        { type: 'tags', label: 'Assign to Agent', items: ['Summariser', 'Researcher', 'Codesmith', 'Validator'] },
        { type: 'tags', label: 'Priority',        items: ['High', 'Medium', 'Low'] },
        { type: 'tags', label: 'Run Mode',        items: ['Autonomous', 'Step-by-step', 'Supervised'] },
        { type: 'metric', label: 'Ready to Dispatch', value: '→', sub: 'Task will be sent to Summariser' },
      ],
    },
  ],

  nav: [
    { id: 'overview',     label: 'Overview',  icon: 'grid'     },
    { id: 'agent-detail', label: 'Agents',    icon: 'activity' },
    { id: 'tasks',        label: 'Tasks',     icon: 'list'     },
    { id: 'analytics',    label: 'Analytics', icon: 'chart'    },
    { id: 'compose',      label: 'Compose',   icon: 'plus'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'conductor-mock', 'Conductor — Interactive Mock');
console.log('Mock live at:', result.url);
