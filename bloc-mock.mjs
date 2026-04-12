import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'BLOC',
  tagline: 'every team, in one grid',
  archetype: 'productivity-dashboard',
  palette: {
    bg:      '#0E1018',
    surface: '#161B28',
    text:    '#F0F2F8',
    accent:  '#4360F5',
    accent2: '#F5954B',
    muted:   'rgba(240,242,248,0.4)',
  },
  lightPalette: {
    bg:      '#EFF2F8',
    surface: '#FFFFFF',
    text:    '#1B1B1F',
    accent:  '#4360F5',
    accent2: '#F5954B',
    muted:   'rgba(27,27,31,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Grid',
      content: [
        { type: 'metric', label: 'Team Health', value: '84%', sub: '↑ 6% from last sprint' },
        { type: 'metric-row', items: [{ label: 'Active', value: '12' }, { label: 'Blockers', value: '3' }, { label: 'Members', value: '14' }] },
        { type: 'list', items: [
          { icon: 'check', title: 'Meridian App', sub: 'iOS · 8 members · 72% done', badge: 'On track' },
          { icon: 'alert', title: 'Atlas Dashboard', sub: 'Web · 5 members · 45% done', badge: 'At risk' },
          { icon: 'zap',   title: 'Relay API v3', sub: 'API · 4 members · 28% done', badge: 'Blocked' },
        ]},
        { type: 'tags', label: 'Squad Filter', items: ['All', 'Design', 'Frontend', 'Backend'] },
      ],
    },
    {
      id: 'project',
      label: 'Projects',
      content: [
        { type: 'metric', label: 'Sprint Progress', value: '18/25', sub: 'tasks · Sprint 14 ends in 4 days' },
        { type: 'progress', items: [
          { label: 'Features', pct: 72 },
          { label: 'Bug Fixes', pct: 88 },
          { label: 'Tech Debt', pct: 40 },
        ]},
        { type: 'list', items: [
          { icon: 'eye',  title: 'Design token update', sub: 'Kai · In Review', badge: '●' },
          { icon: 'code', title: 'Auth regression tests', sub: 'Leo · In Progress', badge: '●' },
          { icon: 'alert',title: 'API rate limit fix', sub: 'Priya · Blocked', badge: '⚑' },
          { icon: 'list', title: 'Onboarding checklist UI', sub: 'Maya · Open', badge: '○' },
        ]},
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric-row', items: [{ label: 'Online', value: '9' }, { label: 'Squads', value: '4' }, { label: 'Total', value: '14' }] },
        { type: 'list', items: [
          { icon: 'user',  title: 'Maya Chen', sub: 'Design Lead · Working on Meridian tokens', badge: '🟢' },
          { icon: 'user',  title: 'Kai Tanaka', sub: 'Frontend · Atlas dashboard sprint', badge: '🟢' },
          { icon: 'user',  title: 'Priya Rao',  sub: 'Backend · Relay API — blocked', badge: '🔴' },
          { icon: 'user',  title: 'Leo Müller', sub: 'Frontend · Last seen 2h ago', badge: '⚫' },
          { icon: 'user',  title: 'Sara Kim',   sub: 'PM · Sprint planning docs', badge: '🟢' },
        ]},
        { type: 'tags', label: 'Status', items: ['All', 'Online', 'Away', 'Blocked'] },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      content: [
        { type: 'metric-row', items: [{ label: 'Velocity', value: '92pts' }, { label: 'Done', value: '87%' }, { label: 'Fixed', value: '11' }] },
        { type: 'progress', items: [
          { label: 'Features', pct: 68 },
          { label: 'Bug Fixes', pct: 22 },
          { label: 'Tech Debt', pct: 10 },
        ]},
        { type: 'list', items: [
          { icon: 'check',title: 'Smooth Figma token handoffs', sub: 'Sprint 13 Retro', badge: '✓' },
          { icon: 'alert',title: 'API bottlenecked 3 features', sub: 'Sprint 13 Retro', badge: '△' },
          { icon: 'star', title: 'Add async standups next sprint', sub: 'Action item', badge: '→' },
        ]},
        { type: 'text', label: 'Sprint 13 Note', value: 'Velocity improved 6% over Sprint 12. Design-dev handoffs dramatically smoother with Figma token pipeline.' },
      ],
    },
    {
      id: 'checkin',
      label: 'Check-in',
      content: [
        { type: 'metric', label: 'Quick Check-in', value: 'Meridian App', sub: 'Sprint 14 · Kai Tanaka' },
        { type: 'tags', label: 'Status', items: ['On track', 'At risk', 'Blocked'] },
        { type: 'text', label: 'What did you work on?', value: 'Completed auth token refresh logic, reviewing PR for mobile nav components.' },
        { type: 'text', label: 'Any blockers?', value: 'No blockers today — cleared the API auth issue with Priya.' },
        { type: 'progress', items: [{ label: 'Team Pulse', pct: 82 }] },
        { type: 'tags', label: 'Mood', items: ['😩', '😐', '🙂', '😊', '🚀'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Grid',    icon: 'grid' },
    { id: 'project',   label: 'Projects', icon: 'layers' },
    { id: 'team',      label: 'Team',     icon: 'user' },
    { id: 'reports',   label: 'Reports',  icon: 'chart' },
    { id: 'checkin',   label: 'Check-in', icon: 'check' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'bloc-mock', 'BLOC — Interactive Mock');
console.log('Mock live at:', result.url);
