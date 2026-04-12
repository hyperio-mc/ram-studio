/**
 * mill-mock.mjs — Svelte 5 interactive mock for MILL
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MILL',
  tagline:   'set tasks in motion',
  archetype: 'ai-task-orchestrator',
  palette: {           // DARK version (required)
    bg:      '#1A1715',
    surface: '#242018',
    text:    '#F5F1EB',
    accent:  '#2D6A4F',
    accent2: '#C4741A',
    muted:   'rgba(245,241,235,0.42)',
  },
  lightPalette: {      // LIGHT — main theme for this design
    bg:      '#F5F1EB',
    surface: '#FFFFFF',
    text:    '#1A1715',
    accent:  '#2D6A4F',
    accent2: '#C4741A',
    muted:   'rgba(26,23,21,0.45)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'text', label: 'Good morning, Alex.', value: 'Saturday, March 28' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '12' },
          { label: 'Done today', value: '7' },
          { label: 'Agents on', value: '3/5' },
        ]},
        { type: 'list', items: [
          { icon: 'search', title: 'Research Q2 competitors', sub: 'Researcher · 80% done', badge: '●' },
          { icon: 'edit',   title: 'Draft onboarding emails', sub: 'Writer · 45% done', badge: '◐' },
          { icon: 'alert',  title: 'Fix checkout flow bug', sub: 'Dev · Blocked', badge: '⚠' },
        ]},
        { type: 'progress', items: [
          { label: 'Researcher', pct: 80 },
          { label: 'Writer',     pct: 45 },
          { label: 'Analyst',    pct: 55 },
        ]},
      ],
    },
    {
      id: 'tasks', label: 'Tasks',
      content: [
        { type: 'metric', label: 'Total Tasks', value: '19', sub: '12 active · 7 done' },
        { type: 'list', items: [
          { icon: 'check', title: 'Research competitors',   sub: 'Researcher · in progress', badge: '80%' },
          { icon: 'check', title: 'Draft email sequence',   sub: 'Writer · in progress',     badge: '45%' },
          { icon: 'alert', title: 'Fix checkout bug',       sub: 'Dev · blocked',            badge: '!' },
          { icon: 'star',  title: 'Schedule investor calls',sub: 'Scheduler · done',         badge: '✓' },
          { icon: 'star',  title: 'Summarise analytics',    sub: 'Analyst · done',           badge: '✓' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Done', 'Blocked'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'text', label: 'Agent Roster', value: '3 active · 2 available' },
        { type: 'list', items: [
          { icon: 'user', title: 'Researcher',  sub: 'Web research & synthesis · 80% load',  badge: '●' },
          { icon: 'user', title: 'Writer',      sub: 'Copy, emails & long-form · 60% load',  badge: '●' },
          { icon: 'code', title: 'Dev',         sub: 'Code review & bug fixes · 20% load',   badge: '◐' },
          { icon: 'user', title: 'Scheduler',   sub: 'Calendar & meetings · 10% load',       badge: '○' },
          { icon: 'chart',title: 'Analyst',     sub: 'Data summaries · 55% load',            badge: '●' },
        ]},
        { type: 'progress', items: [
          { label: 'Researcher', pct: 80 },
          { label: 'Writer',     pct: 60 },
          { label: 'Dev',        pct: 20 },
          { label: 'Analyst',    pct: 55 },
        ]},
      ],
    },
    {
      id: 'new', label: 'New',
      content: [
        { type: 'text', label: 'New Task', value: 'Describe what you need done in plain language' },
        { type: 'metric', label: 'Suggested Agent', value: 'Researcher', sub: 'Best match for this task' },
        { type: 'tags', label: 'Priority', items: ['Normal', 'High', 'Urgent'] },
        { type: 'tags', label: 'Recent prompts', items: ['Research leads', 'Write email', 'Fix bug', 'Schedule call'] },
        { type: 'text', label: 'Tip', value: 'Just describe the outcome you want. Mill assigns the right agent automatically.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Delegated', value: '63' },
          { label: 'Completion', value: '94%' },
        ]},
        { type: 'metric', label: 'Time Saved', value: '14.2 hrs', sub: '↑ 22% vs last week' },
        { type: 'progress', items: [
          { label: 'Researcher (26 tasks)', pct: 86 },
          { label: 'Writer (18 tasks)',     pct: 60 },
          { label: 'Analyst (12 tasks)',    pct: 40 },
          { label: 'Scheduler (7 tasks)',   pct: 23 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Mon', sub: '7 tasks', badge: '7' },
          { icon: 'activity', title: 'Tue', sub: '12 tasks', badge: '12' },
          { icon: 'activity', title: 'Wed', sub: '5 tasks',  badge: '5' },
          { icon: 'activity', title: 'Thu', sub: '9 tasks',  badge: '9' },
          { icon: 'activity', title: 'Fri', sub: '14 tasks', badge: '14' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',     label: 'Home',     icon: 'home' },
    { id: 'tasks',    label: 'Tasks',    icon: 'check' },
    { id: 'agents',   label: 'Agents',   icon: 'layers' },
    { id: 'new',      label: 'New',      icon: 'plus' },
    { id: 'insights', label: 'Insights', icon: 'activity' },
  ],
};

console.log('Generating Svelte component…');
const svelteSource = generateSvelteComponent(design);

console.log('Building compiled HTML…');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

console.log('Publishing mock…');
const result = await publishMock(html, 'mill-mock', 'MILL — Interactive Mock');
console.log('Mock live at:', result.url);
