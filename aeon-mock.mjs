// aeon-mock.mjs — Svelte interactive mock for AEON
// AEON — Persistent memory inspector for production AI agents
// Theme: DARK — indigo + cyan-teal + data-dense

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'AEON',
  tagline:   'Persistent memory for production AI agents.',
  archetype: 'ai-devtools',
  palette: {           // DARK theme
    bg:      '#08090E',
    surface: '#0F1118',
    text:    '#D2D8F0',
    accent:  '#5865F4',
    accent2: '#22D3C8',
    muted:   'rgba(210,216,240,0.38)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F4F5FA',
    surface: '#FFFFFF',
    text:    '#0D0E1A',
    accent:  '#4752E8',
    accent2: '#0CBAB0',
    muted:   'rgba(13,14,26,0.42)',
  },
  screens: [
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric', label: 'Fleet Status', value: '4 / 5', sub: 'agents active · 1 error state' },
        { type: 'metric-row', items: [
          { label: 'Total Tokens', value: '325k' },
          { label: 'Active', value: '3' },
          { label: 'Alerts', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Aria · Customer Support', sub: 'ACTIVE · 72% mem · 94.2k tokens · 12s ago', badge: '72%' },
          { icon: 'activity', title: 'Rex · Code Review', sub: 'ACTIVE · 48% mem · 61.1k tokens · 1m ago', badge: '48%' },
          { icon: 'star',     title: 'Luma · Research Digest', sub: 'IDLE · 31% mem · 39.7k tokens · 22m ago', badge: '31%' },
          { icon: 'zap',      title: 'Volt · Ops Automation', sub: 'ACTIVE · 88% mem · 112.4k tokens · 5s ago', badge: '88%' },
          { icon: 'alert',    title: 'Iris · Data Extraction', sub: 'ERROR · 15% mem · 18.3k tokens · 3h ago', badge: 'ERR' },
        ]},
      ],
    },
    {
      id: 'memory', label: 'Memory',
      content: [
        { type: 'metric', label: 'Aria · Context Window', value: '72%', sub: '94.2k / 128k tokens used' },
        { type: 'progress', items: [
          { label: 'Context window', pct: 72 },
        ]},
        { type: 'tags', label: 'Fragment Types', items: ['Persona', 'Preference', 'Context', 'Learning'] },
        { type: 'list', items: [
          { icon: 'user',   title: 'PERSONA · 14d ago', sub: 'You are Aria, a warm and precise customer support specialist...', badge: '0.8k' },
          { icon: 'star',   title: 'PREFERENCE · 6d ago', sub: 'User prefers formal tone. Avoids jargon. Last escalation...', badge: '0.4k' },
          { icon: 'layers', title: 'CONTEXT · 2h ago', sub: 'Current open ticket #4892: Pro plan downgrade request...', badge: '1.2k' },
          { icon: 'chart',  title: 'LEARNING · 3d ago', sub: 'Billing queries spike Mondays 9–11am UTC. Pre-load FAQ...', badge: '0.6k' },
        ]},
      ],
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Write', 'Read', 'Inject', 'Error'] },
        { type: 'list', items: [
          { icon: 'code',     title: 'WRITE · Aria · 09:41:02', sub: 'Context block updated — ticket #4892 status changed to open', badge: 'W' },
          { icon: 'eye',      title: 'READ · Volt · 09:38:54', sub: 'Ops runbook retrieved — incident playbook #7 loaded', badge: 'R' },
          { icon: 'zap',      title: 'INJECT · Rex · 09:35:11', sub: 'Manual injection — PR #2041 diff by @devadmin', badge: '!' },
          { icon: 'filter',   title: 'PRUNE · Luma · 09:31:40', sub: 'Memory compaction — 12 stale fragments pruned, freed 8.4k tokens', badge: 'P' },
          { icon: 'alert',    title: 'ERROR · Iris · 09:28:07', sub: 'Memory write failed — context window overflow at 128k limit', badge: '✗' },
          { icon: 'code',     title: 'WRITE · Aria · 09:22:50', sub: 'Learning fragment appended — billing spike pattern detected', badge: 'W' },
        ]},
      ],
    },
    {
      id: 'health', label: 'Health',
      content: [
        { type: 'metric', label: 'Fleet Health', value: 'NOMINAL', sub: '4/5 agents healthy · 1 error · 96% score' },
        { type: 'metric-row', items: [
          { label: 'Avg Memory', value: '55%' },
          { label: 'Writes/min', value: '284' },
          { label: 'Injections', value: '12' },
        ]},
        { type: 'progress', items: [
          { label: 'Aria · Customer Support', pct: 72 },
          { label: 'Rex · Code Review', pct: 48 },
          { label: 'Volt · Ops Automation', pct: 88 },
          { label: 'Luma · Research Digest', pct: 31 },
          { label: 'Iris · Data Extraction', pct: 15 },
        ]},
      ],
    },
    {
      id: 'inject', label: 'Inject',
      content: [
        { type: 'metric', label: 'Target Agent', value: 'Aria', sub: 'Customer Support · 94.2k tokens active' },
        { type: 'tags', label: 'Memory Type', items: ['Context', 'Persona', 'Learning', 'Instruction'] },
        { type: 'text', label: 'Content Preview', value: 'The user has been flagged as a VIP enterprise customer (ARR $120k+). Always acknowledge their premium status and escalate to Level-2 support if unresolved in 2 exchanges.' },
        { type: 'metric-row', items: [
          { label: 'TTL', value: '24h' },
          { label: 'Priority', value: 'HIGH' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',  title: 'Rex · Context · 09:35', sub: 'PR #2041 diff injected by @devadmin', badge: '!' },
          { icon: 'zap',  title: 'Luma · Instruction · Yesterday', sub: 'Research scope updated by @ops-bot', badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'agents',   label: 'Agents',   icon: 'layers' },
    { id: 'memory',   label: 'Memory',   icon: 'code' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'health',   label: 'Health',   icon: 'heart' },
    { id: 'inject',   label: 'Inject',   icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'aeon-mock', 'AEON — Interactive Mock');
console.log('Mock live at:', result.url);
