import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Grove',
  tagline:   'Deep work, by design.',
  archetype: 'focus-tracker',
  palette: {
    bg:      '#1A1C16',
    surface: '#242820',
    text:    '#E8E4D8',
    accent:  '#4A7C59',
    accent2: '#C4874A',
    muted:   'rgba(232,228,216,0.4)',
  },
  lightPalette: {
    bg:      '#F9F7EF',
    surface: '#FFFFFF',
    text:    '#111008',
    accent:  '#4A7C59',
    accent2: '#C4874A',
    muted:   'rgba(17,16,8,0.4)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Good morning', value: 'Tuesday', sub: 'April 8, 2026' },
        { type: 'metric-row', items: [
          { label: 'FOCUSED', value: '2h 45m' },
          { label: 'REMAINING', value: '3h 45m' },
          { label: 'STREAK', value: '12 days' },
        ]},
        { type: 'text', label: 'Today\'s Intention', value: 'Finish the API spec and get it reviewed by the team before 3pm.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Deep work — Product spec', sub: '7:00–8:30 · 1h 28m', badge: '✓' },
          { icon: 'check', title: 'Research — Competitor UX', sub: '9:00–10:30 · 1h 32m', badge: '✓' },
          { icon: 'activity', title: 'Writing — Quarterly OKRs', sub: '11:00–12:00 · in progress', badge: '40%' },
          { icon: 'play', title: 'Code review — API layer', sub: '2:00–3:30 · upcoming', badge: '→' },
          { icon: 'calendar', title: '1:1 with team', sub: '4:00–4:30 · meeting', badge: '○' },
        ]},
        { type: 'progress', items: [
          { label: 'Day energy', pct: 63 },
        ]},
      ],
    },
    {
      id: 'active', label: 'Focus',
      content: [
        { type: 'metric', label: 'Active Session', value: '37:22', sub: 'remaining · Writing OKRs' },
        { type: 'metric-row', items: [
          { label: 'PHASE', value: '2 of 3' },
          { label: 'SESSION', value: '40 min' },
          { label: 'GOAL', value: 'OKR Draft' },
        ]},
        { type: 'progress', items: [
          { label: 'Session progress', pct: 61 },
          { label: 'Today\'s pace', pct: 62 },
        ]},
        { type: 'tags', label: 'Controls', items: ['⏸ Pause', '+5 min', 'Skip →'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Session Goal', sub: 'Draft Eng OKRs for Q2 — delivery velocity metrics', badge: '✎' },
          { icon: 'heart', title: 'Ambient Sound', sub: 'Lo-fi Rain · playing', badge: '♪' },
          { icon: 'lock', title: 'Do Not Disturb', sub: 'Active · notifications blocked', badge: '⊘' },
        ]},
      ],
    },
    {
      id: 'log', label: 'Log',
      content: [
        { type: 'metric', label: 'Session Log', value: '15h', sub: 'this week · 5 sessions today' },
        { type: 'progress', items: [
          { label: 'Mon', pct: 64 },
          { label: 'Tue', pct: 73 },
          { label: 'Wed', pct: 51 },
          { label: 'Thu', pct: 95 },
          { label: 'Fri', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Writing — Quarterly OKRs', sub: '23 min · ●●●●○', badge: '11:02' },
          { icon: 'star', title: 'Research — Competitor UX', sub: '1h 32m · ●●●●●', badge: '9:00' },
          { icon: 'star', title: 'Deep work — Product spec', sub: '1h 28m · ●●●●●', badge: '7:04' },
          { icon: 'check', title: 'Code review — API layer', sub: '2h 01m · ●●●●○', badge: 'Yest' },
          { icon: 'check', title: 'Writing — Blog draft', sub: '1h 15m · ●●●○○', badge: 'Yest' },
        ]},
      ],
    },
    {
      id: 'review', label: 'Review',
      content: [
        { type: 'metric', label: 'Weekly Review — Week 14', value: '15h 42m', sub: 'deep work · ↑18% vs last week' },
        { type: 'metric-row', items: [
          { label: 'FOCUS SCORE', value: '87' },
          { label: 'BEST STREAK', value: '12 days' },
          { label: 'SESSIONS', value: '23' },
        ]},
        { type: 'progress', items: [
          { label: 'Work (7.2h)', pct: 100 },
          { label: 'Research (4.5h)', pct: 62 },
          { label: 'Writing (2.8h)', pct: 39 },
          { label: 'Dev (1.2h)', pct: 17 },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'Best focus: Tue mornings', sub: 'avg 2h 10m per session', badge: '◎' },
          { icon: 'alert', title: 'Writing lowest completion', sub: '58% session completion rate', badge: '◑' },
          { icon: 'chart', title: '40% more morning focus', sub: 'vs afternoon sessions', badge: '◐' },
        ]},
      ],
    },
    {
      id: 'settings', label: 'You',
      content: [
        { type: 'metric', label: 'Your Grove', value: 'Rakis', sub: 'Level 3 · Deep Worker' },
        { type: 'metric-row', items: [
          { label: 'TOTAL TIME', value: '234h' },
          { label: 'SESSIONS', value: '187' },
          { label: 'SINCE', value: 'Jan 2026' },
        ]},
        { type: 'tags', label: 'Priority Blocks', items: ['▣ Deep Work', '✎ Writing', '◈ Research', '⊡ Planning'] },
        { type: 'list', items: [
          { icon: 'settings', title: 'Session Defaults', sub: '40 min blocks · 10 min breaks', badge: '→' },
          { icon: 'heart', title: 'Ambient Sounds', sub: 'Lo-fi Rain (default)', badge: '→' },
          { icon: 'bell', title: 'Notifications', sub: 'Session start/end only', badge: '→' },
          { icon: 'calendar', title: 'Calendar Sync', sub: 'Google Calendar · connected', badge: '✓' },
          { icon: 'share', title: 'Export Data', sub: 'Download session history as CSV', badge: '→' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',  icon: 'home' },
    { id: 'active',  label: 'Focus',  icon: 'play' },
    { id: 'log',     label: 'Log',    icon: 'list' },
    { id: 'review',  label: 'Review', icon: 'chart' },
    { id: 'settings',label: 'You',    icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'grove-mock', 'Grove — Interactive Mock');
console.log('Mock live at:', result.url);
