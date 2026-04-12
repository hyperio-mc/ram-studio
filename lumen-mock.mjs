import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'LUMEN',
  tagline: 'precision for deep work',
  archetype: 'productivity-tools',
  palette: {
    bg: '#1C1A18',
    surface: '#252320',
    text: '#F8F7F4',
    accent: '#E85D04',
    accent2: '#502BD8',
    muted: 'rgba(248,247,244,0.42)',
  },
  lightPalette: {
    bg: '#F8F7F4',
    surface: '#FFFFFF',
    text: '#1C1A18',
    accent: '#E85D04',
    accent2: '#502BD8',
    muted: 'rgba(28,26,24,0.42)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Focus Score', value: '84%', sub: 'Wednesday · April 9' },
        { type: 'metric-row', items: [{ label: 'Sessions', value: '6' }, { label: 'Streak', value: '14d' }, { label: 'Goal', value: '72%' }] },
        { type: 'progress', items: [{ label: 'Daily Goal (3.2h of 4h)', pct: 80 }, { label: 'Deep Work', pct: 65 }] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Design System', sub: '32 min · score 91', badge: '91' },
          { icon: 'code', title: 'Code Review', sub: '25 min · score 82', badge: '82' },
          { icon: 'search', title: 'Research', sub: '45 min · score 88', badge: '88' },
        ]},
      ],
    },
    {
      id: 'timer', label: 'Timer',
      content: [
        { type: 'metric', label: 'Active Session', value: '18:32', sub: 'Design System · elapsed 6:28' },
        { type: 'metric-row', items: [{ label: 'Elapsed', value: '6:28' }, { label: 'Sessions', value: '3' }, { label: 'Depth', value: 'Deep' }] },
        { type: 'progress', items: [{ label: 'Session Progress', pct: 62 }] },
        { type: 'tags', label: 'Session Mode', items: ['Deep Work', 'Design', '25 min', 'Pomodoro'] },
        { type: 'text', label: 'Focus Note', value: 'Working on nav component wireframes. Minimal distractions, high depth.' },
      ],
    },
    {
      id: 'review', label: 'Review',
      content: [
        { type: 'metric', label: 'Focus Score', value: '92', sub: 'Design System · 25 min session' },
        { type: 'metric-row', items: [{ label: 'Duration', value: '25:00' }, { label: 'Distractions', value: '1' }, { label: 'Streak', value: '15d' }] },
        { type: 'text', label: 'Session Notes', value: 'Completed nav wireframes. Good flow, minimal context switching. Blocked on color token naming.' },
        { type: 'progress', items: [{ label: 'Daily Progress (3.2h of 4h)', pct: 80 }] },
        { type: 'tags', label: 'Next Action', items: ['New Session', 'Take Break', '15-min break'] },
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'metric', label: 'This Week', value: '22.4h', sub: 'Avg focus score: 87 · +3 vs last week' },
        { type: 'metric-row', items: [{ label: 'Mon', value: '3.2h' }, { label: 'Tue', value: '4.1h' }, { label: 'Wed', value: '2.8h' }, { label: 'Thu', value: '3.8h' }] },
        { type: 'progress', items: [
          { label: 'Design System', pct: 84 },
          { label: 'Engineering', pct: 62 },
          { label: 'Research', pct: 41 },
        ]},
        { type: 'metric-row', items: [{ label: 'Streak', value: '15d' }, { label: 'Best Time', value: '9-11am' }] },
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'list', items: [
          { icon: 'layers', title: 'Design System', sub: '24.6h · 18 sessions', badge: '82%' },
          { icon: 'code', title: 'Engineering Sprint', sub: '18.2h · 14 sessions', badge: '91%' },
          { icon: 'search', title: 'Research & Discovery', sub: '11.8h · 9 sessions', badge: '79%' },
          { icon: 'message', title: 'Stakeholder Comms', sub: '5.4h · 6 sessions', badge: '68%' },
          { icon: 'star', title: 'Personal Learning', sub: '8.1h · 12 sessions', badge: '100%' },
        ]},
        { type: 'progress', items: [
          { label: 'Design System goal (30h)', pct: 82 },
          { label: 'Engineering Sprint goal (20h)', pct: 91 },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Jordan Davis', value: '247h', sub: 'Senior Designer · 94-day user' },
        { type: 'metric-row', items: [{ label: 'Total Hours', value: '247h' }, { label: 'Sessions', value: '412' }, { label: 'Streak', value: '15d' }] },
        { type: 'tags', label: 'Achievements', items: ['Early Adopter', 'Streak Master', 'Deep Worker', '100h Club'] },
        { type: 'list', items: [
          { icon: 'settings', title: 'Focus Settings', sub: 'Session length, sounds, breaks', badge: '>' },
          { icon: 'bell', title: 'Notifications', sub: 'Goal alerts, weekly reports', badge: '>' },
          { icon: 'activity', title: 'Integrations', sub: 'Calendar, Slack, Notion', badge: '>' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today', label: 'Today', icon: 'home' },
    { id: 'timer', label: 'Timer', icon: 'play' },
    { id: 'stats', label: 'Stats', icon: 'chart' },
    { id: 'projects', label: 'Projects', icon: 'list' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const built = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'lumen-mock', 'LUMEN — Interactive Mock');
console.log('Mock live at:', result.url);
