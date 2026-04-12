import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'RAFT',
  tagline:   'Sprint intelligence for healthy teams',
  archetype: 'sprint-intelligence',
  palette: {           // dark mode
    bg:      '#1A1F16',
    surface: '#242B1E',
    text:    '#E8EDE4',
    accent:  '#52B788',
    accent2: '#F4A261',
    muted:   'rgba(232,237,228,0.4)',
  },
  lightPalette: {      // light mode (primary)
    bg:      '#F8F5EF',
    surface: '#FFFFFF',
    text:    '#1C1A17',
    accent:  '#2D6A4F',
    accent2: '#F4A261',
    muted:   'rgba(28,26,23,0.45)',
  },
  screens: [
    {
      id: 'screen1', label: 'Sprint',
      content: [
        { type: 'metric', label: 'Sprint Health', value: '78', sub: '/ 100 — ↑ 6 pts' },
        { type: 'metric-row', items: [
          { label: 'Velocity', value: '42 pts' },
          { label: 'Done', value: '18 tasks' },
          { label: 'Blocked', value: '3' },
        ]},
        { type: 'progress', items: [
          { label: 'Redesign onboarding flow', pct: 70 },
          { label: 'API rate limiting v2', pct: 45 },
          { label: 'Write Q2 OKR brief', pct: 90 },
        ]},
        { type: 'text', label: '✦ AI Insight', value: 'Blocker pattern mirrors Sprint 21 slowdown. View trend →' },
      ],
    },
    {
      id: 'screen2', label: 'Pulse',
      content: [
        { type: 'metric', label: 'Overall Mood', value: 'Energized', sub: '↑ up from Neutral' },
        { type: 'progress', items: [
          { label: 'Collaboration', pct: 84 },
          { label: 'Workload', pct: 62 },
          { label: 'Process clarity', pct: 76 },
          { label: 'Manager support', pct: 92 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: '😊 Great', sub: '"Really liked how we handled the backend incident."', badge: 'Process' },
          { icon: 'alert', title: '😐 Meh', sub: '"Too many context switches this sprint."', badge: 'Workload' },
        ]},
      ],
    },
    {
      id: 'screen3', label: 'Trends',
      content: [
        { type: 'metric', label: 'Current Sprint', value: '42', sub: 'story points' },
        { type: 'metric-row', items: [
          { label: 'S19', value: '28' },
          { label: 'S21', value: '31' },
          { label: 'S23', value: '34' },
          { label: 'S24', value: '42 ↑' },
        ]},
        { type: 'progress', items: [
          { label: 'Features', pct: 52 },
          { label: 'Bug fixes', pct: 29 },
          { label: 'Tech debt', pct: 12 },
          { label: 'Discovery', pct: 7 },
        ]},
        { type: 'text', label: '✦ Prediction', value: 'Next sprint: 46–50 pts based on 3-sprint trend.' },
      ],
    },
    {
      id: 'screen4', label: 'Actions',
      content: [
        { type: 'tags', label: 'Filter', items: ['All  8', 'Open  5', 'Done  3'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Add daily async standup template', sub: 'Jordan Lee · Due Apr 5', badge: 'HIGH' },
          { icon: 'check', title: 'Document API rollback procedure', sub: 'Maya Kim · Due Apr 8', badge: 'HIGH' },
          { icon: 'check', title: 'Schedule design-eng sync weekly', sub: 'Rakis · Due Apr 3', badge: 'MED' },
          { icon: 'check', title: 'Create on-call rotation doc', sub: 'Alex Liu · Due Apr 10', badge: 'LOW' },
        ]},
      ],
    },
    {
      id: 'screen5', label: 'Team',
      content: [
        { type: 'metric', label: 'Team Average Health', value: '77', sub: '/ 100 · 4 members' },
        { type: 'list', items: [
          { icon: 'user', title: 'Jordan Lee  Design Lead', sub: '😊  88 health · 12 pts', badge: '88' },
          { icon: 'user', title: 'Maya Kim  Backend Eng', sub: '🙂  74 health · 18 pts', badge: '74' },
          { icon: 'user', title: 'Rakis  Product', sub: '😊  91 health · 8 pts', badge: '91' },
          { icon: 'user', title: 'Alex Liu  Frontend', sub: '😐  56 health — at risk', badge: '56' },
        ]},
        { type: 'text', label: '✦ AI Recommendation', value: 'Alex\'s health has dropped 3 sprints in a row. Consider a 1:1 before next sprint planning.' },
      ],
    },
  ],
  nav: [
    { id: 'screen1', label: 'Sprint',  icon: 'grid' },
    { id: 'screen2', label: 'Pulse',   icon: 'heart' },
    { id: 'screen3', label: 'Trends',  icon: 'activity' },
    { id: 'screen4', label: 'Actions', icon: 'check' },
    { id: 'screen5', label: 'Team',    icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'raft-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
