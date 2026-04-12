// spire-mock.mjs — Interactive Svelte mock for SPIRE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPIRE',
  tagline:   'Every signal, every sprint, in focus',
  archetype: 'ai-project-intelligence',

  palette: {           // DARK theme (primary)
    bg:      '#0C0B0A',
    surface: '#181614',
    text:    '#EDE9E2',
    accent:  '#5468D4',
    accent2: '#D4723A',
    muted:   'rgba(237,233,226,0.38)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F4F1ED',
    surface: '#FFFFFF',
    text:    '#1B1916',
    accent:  '#5468D4',
    accent2: '#D4723A',
    muted:   'rgba(27,25,22,0.40)',
  },

  screens: [
    {
      id: 'command', label: 'Command',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Agents', value: '12' },
          { label: 'Open Signals',  value: '7'  },
          { label: 'On Track',      value: '84%'},
          { label: 'Velocity',      value: '↑22'},
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Scope Tracker',  sub: 'Atlas UI Redesign',    badge: '●' },
          { icon: 'alert',    title: 'Risk Detector',  sub: 'API Platform v2',      badge: '!' },
          { icon: 'activity', title: 'Velocity Coach', sub: 'Mobile App Launch',    badge: '●' },
          { icon: 'zap',      title: 'PR Summariser',  sub: 'Core Engine Refactor', badge: '→' },
        ]},
        { type: 'progress', items: [
          { label: 'Atlas UI — Sprint 14', pct: 67 },
          { label: 'API Platform — Sprint 14', pct: 42 },
        ]},
        { type: 'text', label: 'Sprint Pulse', value: '12 of 18 issues closed · 3 days remaining' },
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'At Risk', 'On Hold'] },
        { type: 'list', items: [
          { icon: 'check',  title: 'Atlas UI Redesign',    sub: 'Design · Frontend · 3 agents', badge: '67%' },
          { icon: 'alert',  title: 'API Platform v2',      sub: 'Platform · 2 agents',          badge: '42%' },
          { icon: 'check',  title: 'Mobile App Launch',    sub: 'Mobile · 4 agents',            badge: '81%' },
          { icon: 'layers', title: 'Core Engine Refactor', sub: 'Backend · 1 agent',            badge: '28%' },
          { icon: 'check',  title: 'Data Pipeline',        sub: 'Data · 2 agents',              badge: '55%' },
        ]},
        { type: 'progress', items: [
          { label: 'Atlas UI Redesign',    pct: 67 },
          { label: 'API Platform v2',      pct: 42 },
          { label: 'Mobile App Launch',    pct: 81 },
          { label: 'Core Engine Refactor', pct: 28 },
          { label: 'Data Pipeline',        pct: 55 },
        ]},
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '12' },
          { label: 'Idle',    value: '3'  },
          { label: 'Alert',   value: '1'  },
        ]},
        { type: 'list', items: [
          { icon: 'eye',      title: 'Scope Tracker',  sub: 'Scope stable — 2 additions flagged',  badge: 'RUN' },
          { icon: 'alert',    title: 'Risk Detector',  sub: '⚠ Dependency delay — 3-day impact',   badge: 'ALT' },
          { icon: 'activity', title: 'Velocity Coach', sub: 'Team at 108% avg velocity',           badge: 'IDL' },
          { icon: 'zap',      title: 'PR Summariser',  sub: 'Digest ready — 12 PRs today',         badge: 'RUN' },
        ]},
        { type: 'text', label: 'Agent Intelligence', value: 'Agents autonomously monitor scope, risk, velocity, and PR activity across all connected projects. Signals are generated in real-time.' },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1'  },
          { label: 'Warning',  value: '4'  },
          { label: 'Info',     value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Dependency delay detected',  sub: 'API Platform v2 · Risk Detector · 8 min ago',      badge: 'CRIT' },
          { icon: 'alert', title: 'Scope creep flagged',        sub: 'Atlas UI Redesign · Scope Tracker · 34 min ago',    badge: 'WARN' },
          { icon: 'eye',   title: 'Velocity above baseline',    sub: 'Mobile App Launch · Velocity Coach · 1 hr ago',     badge: 'INFO' },
          { icon: 'zap',   title: 'Weekly PR digest ready',     sub: 'Core Engine Refactor · PR Summariser · 2 hrs ago',  badge: 'INFO' },
        ]},
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'text', label: 'Q2 2026', value: 'Sprint 14 → Sprint 18 · 5 active projects' },
        { type: 'progress', items: [
          { label: 'Atlas UI Redesign',     pct: 67 },
          { label: 'API Platform v2',       pct: 42 },
          { label: 'Mobile App Launch',     pct: 81 },
          { label: 'Core Engine Refactor',  pct: 28 },
          { label: 'Data Pipeline',         pct: 55 },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Design review',   sub: 'Atlas UI Redesign · Tomorrow',  badge: '→' },
          { icon: 'calendar', title: 'Pipeline live',   sub: 'Data Pipeline · Apr 7',         badge: '→' },
          { icon: 'alert',    title: 'Auth unblock',    sub: 'API Platform v2 · Apr 8',       badge: '!' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'command',  label: 'Command',  icon: 'grid'     },
    { id: 'projects', label: 'Projects', icon: 'layers'   },
    { id: 'agents',   label: 'Agents',   icon: 'activity' },
    { id: 'signals',  label: 'Signals',  icon: 'alert'    },
    { id: 'timeline', label: 'Timeline', icon: 'calendar' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'spire-mock', 'SPIRE — Interactive Mock');
console.log('Mock live at:', result.url);
