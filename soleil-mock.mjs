import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Soleil',
  tagline: 'Clarity for freelancers',
  archetype: 'freelance-dashboard',
  palette: {           // DARK fallback
    bg:      '#1C1917',
    surface: '#252019',
    text:    '#F7F3EE',
    accent:  '#D4622A',
    accent2: '#2A7A5A',
    muted:   'rgba(247,243,238,0.42)',
  },
  lightPalette: {      // LIGHT theme (primary)
    bg:      '#F7F3EE',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#D4622A',
    accent2: '#2A7A5A',
    muted:   'rgba(28,25,23,0.45)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Clarity Score', value: '82', sub: 'You\'re on track — cash flow healthy' },
        { type: 'metric-row', items: [{ label: 'Billed', value: '$4.2K' }, { label: 'Hours', value: '27h' }, { label: 'Tasks', value: '14/18' }] },
        { type: 'text', label: '✦ AI Insight', value: 'Buffer week available Apr 18 — perfect for a short project or planned rest.' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Helio Rebrand', sub: 'Helio Studio · Due Apr 14', badge: '72%' },
          { icon: 'layers', title: 'Vega Web Design', sub: 'Vega Corp · Due Apr 28', badge: '45%' },
        ]},
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Active', 'Paused', 'Done'] },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Helio Rebrand', sub: 'Design phase · Apr 1–14', badge: 'Active' },
          { icon: 'calendar', title: 'Vega Web Design', sub: 'Build phase · Apr 5–28', badge: 'Active' },
          { icon: 'calendar', title: 'Orion Pitch', sub: 'Strategy · Apr 14–21', badge: 'Active' },
          { icon: 'calendar', title: 'Lunar Brand Guide', sub: 'Kickoff · Apr 19–28', badge: 'New' },
        ]},
        { type: 'metric-row', items: [{ label: 'Contracted', value: '$21.7K' }, { label: 'On Track', value: '3 / 4' }, { label: 'Buffer Days', value: '8d' }] },
        { type: 'text', label: '✦ AI Alert', value: 'Orion Pitch overlaps with Vega — consider pushing start by 3 days.' },
      ],
    },
    {
      id: 'finance', label: 'Finance',
      content: [
        { type: 'metric', label: 'April Revenue', value: '$14,200', sub: '↑ 18.3% vs March' },
        { type: 'progress', items: [
          { label: 'Helio Studio — Due Apr 14', pct: 0 },
          { label: 'Vega Corp — Paid Apr 3', pct: 100 },
          { label: 'Orion Media — Draft', pct: 20 },
        ]},
        { type: 'metric-row', items: [{ label: 'Due', value: '$3,000' }, { label: 'Paid', value: '$4,750' }, { label: 'Draft', value: '$2,200' }] },
        { type: 'text', label: '📊 May Forecast', value: '$15,800 projected — based on 2 confirmed projects + 1 lead.' },
      ],
    },
    {
      id: 'time', label: 'Time',
      content: [
        { type: 'metric', label: 'This Week', value: '27h 40m', sub: '68% utilization · On pace ✓' },
        { type: 'progress', items: [
          { label: 'Monday', pct: 94 },
          { label: 'Tuesday', pct: 75 },
          { label: 'Wednesday', pct: 69 },
          { label: 'Thursday', pct: 100 },
          { label: 'Friday (today)', pct: 9 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Helio — Brand exploration', sub: '9:00–11:30 · 2h 30m', badge: '2.5h' },
          { icon: 'activity', title: 'Client call — Vega Corp', sub: '13:00–14:00 · 1h', badge: '1h' },
        ]},
        { type: 'text', label: '✦ AI Pattern', value: 'You work best 9–12am — you complete 60% of deep work in that window. Protect it.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Clarity Score', value: '82 / 100', sub: '↑ +6 points this week' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Peak focus window', sub: '9–12am — protect it every weekday', badge: '◎' },
          { icon: 'check', title: 'Cash flow: healthy', sub: 'Helio $3K due Apr 14 — send reminder', badge: '◈' },
          { icon: 'calendar', title: 'Availability gap', sub: 'Apr 18–20 buffer — rest or short project', badge: '◉' },
        ]},
        { type: 'tags', label: 'Actions', items: ['Block calendar', 'Send reminder', 'Explore leads'] },
      ],
    },
  ],
  nav: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'projects', label: 'Projects', icon: 'layers' },
    { id: 'finance', label: 'Finance', icon: 'chart' },
    { id: 'time', label: 'Time', icon: 'activity' },
    { id: 'insights', label: 'Insights', icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'soleil-mock', 'Soleil — Interactive Mock');
console.log('Mock live at:', result.url);
