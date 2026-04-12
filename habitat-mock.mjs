import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HABITAT',
  tagline:   'deep work, compounded daily',
  archetype: 'habit-tracker',
  palette: {
    bg:      '#1C1917',
    surface: '#2A2623',
    text:    '#F7F4EF',
    accent:  '#E8490A',
    accent2: '#2A6B8C',
    muted:   'rgba(247,244,239,0.4)',
  },
  lightPalette: {
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#E8490A',
    accent2: '#2A6B8C',
    muted:   'rgba(28,25,23,0.42)',
  },
  screens: [
    {
      id: 'today', label: "Today's Habits",
      content: [
        { type: 'metric', label: 'completed today', value: '72%', sub: '13 of 18 habits done · 🔥 21d streak' },
        { type: 'metric-row', items: [
          { label: 'Deep Work', value: '2h 30m' },
          { label: 'Pages', value: '3' },
          { label: 'Sessions', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Deep Work Block', sub: '2h 30m · teal', badge: '✓' },
          { icon: 'check', title: 'Morning Pages', sub: '3 pages · green', badge: '✓' },
          { icon: 'star',  title: 'Cold Shower', sub: 'pending', badge: '○' },
          { icon: 'check', title: 'No Social Media', sub: '4h clean', badge: '✓' },
          { icon: 'activity', title: 'Exercise', sub: 'pending', badge: '○' },
          { icon: 'eye',  title: 'Read', sub: '20 pages target', badge: '○' },
        ]},
        { type: 'tags', label: 'Habit groups', items: ['Morning', 'Afternoon', 'Evening', 'Wellness', 'Creative'] },
      ],
    },
    {
      id: 'streaks', label: 'Streak Board',
      content: [
        { type: 'metric', label: 'top streak — Deep Work Block', value: '21d', sub: 'Best ever: 34 days' },
        { type: 'metric-row', items: [
          { label: 'Morning Pages', value: '18d' },
          { label: 'No Social', value: '14d' },
          { label: 'Read', value: '11d' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep Work', pct: 62 },
          { label: 'Morning Pages', pct: 53 },
          { label: 'No Social Media', pct: 41 },
          { label: 'Cold Shower', pct: 21 },
          { label: 'Exercise', pct: 9 },
        ]},
        { type: 'text', label: 'March Heatmap', value: '24 of 25 days completed this month. You are on a 21-day streak — keep it going through the weekend.' },
      ],
    },
    {
      id: 'focus', label: 'Focus Timer',
      content: [
        { type: 'metric', label: 'remaining — Session 1 of 4', value: '47:23', sub: '61% of deep work block complete' },
        { type: 'metric-row', items: [
          { label: 'Today', value: '2h 13m' },
          { label: 'Sessions', value: '8' },
          { label: 'Best day', value: 'Fri' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Classic 25/5', sub: 'Active mode', badge: '●' },
          { icon: 'zap',   title: 'Deep 50/10', sub: 'Long session', badge: '○' },
          { icon: 'activity', title: 'Flow 90/20', sub: 'Extended flow state', badge: '○' },
        ]},
        { type: 'tags', label: 'Focus aids', items: ['Lo-fi Mix', 'Brain.fm', 'White Noise', 'Silence'] },
        { type: 'text', label: 'Working on', value: 'Chapter 4 — Systems Thinking · Writing project' },
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'metric', label: "today's mood", value: '😊', sub: 'Wednesday, March 25' },
        { type: 'text', label: 'Biggest win today', value: 'Finished the outline for Chapter 4 without any distractions — 2 full Pomodoros back to back.' },
        { type: 'text', label: 'Weekly intention', value: '"Ship the first draft of Systems Thinking without self-editing."' },
        { type: 'list', items: [
          { icon: 'star',  title: 'Tue Mar 24', sub: 'Finished chapter outline...', badge: '★' },
          { icon: 'check', title: 'Mon Mar 23', sub: 'Struggled with focus early...', badge: '◎' },
          { icon: 'star',  title: 'Sun Mar 22', sub: 'Best session of the week...', badge: '★' },
        ]},
      ],
    },
    {
      id: 'review', label: 'Weekly Review',
      content: [
        { type: 'metric', label: 'completion — Week 12 · Mar 17–23', value: '84%', sub: '▲ +9% vs last week · Best in 3 months 🏆' },
        { type: 'metric-row', items: [
          { label: 'Deep Work', value: '6/7' },
          { label: 'Cold Shower', value: '7/7' },
          { label: 'Exercise', value: '4/7' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep Work', pct: 86 },
          { label: 'Morning Pages', pct: 71 },
          { label: 'Exercise', pct: 57 },
          { label: 'Cold Shower', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'You focus best on Fridays (5h avg)', sub: 'Schedule your hardest task then', badge: '◎' },
          { icon: 'alert', title: 'Weekend habits drop 42%', sub: 'Try a lighter Saturday routine', badge: '⚡' },
          { icon: 'chart', title: 'Focus hours up 18% this month', sub: 'Consistency driving the trend', badge: '▲' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'streaks', label: 'Streaks', icon: 'zap' },
    { id: 'focus',   label: 'Focus',   icon: 'eye' },
    { id: 'journal', label: 'Journal', icon: 'list' },
    { id: 'review',  label: 'Review',  icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'habitat-mock', 'HABITAT — Interactive Mock');
console.log('Mock live at:', result.url);
