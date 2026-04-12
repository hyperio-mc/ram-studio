// haze-mock.mjs — Svelte interactive mock for HAZE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HAZE',
  tagline:   'focus deep, drift less',
  archetype: 'focus-productivity',

  palette: {   // DARK
    bg:      '#07080F',
    surface: '#111827',
    text:    '#E8EAFF',
    accent:  '#7C5CFC',
    accent2: '#2DD4BF',
    muted:   'rgba(232,234,255,0.35)',
  },

  lightPalette: {  // LIGHT
    bg:      '#F5F7FF',
    surface: '#FFFFFF',
    text:    '#0F1320',
    accent:  '#6B4EEC',
    accent2: '#17B8A6',
    muted:   'rgba(15,19,32,0.42)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'text',       label: 'Good evening, Alex', value: 'Thursday, March 27 · 3 active sessions today' },
        { type: 'metric',     label: "Today's Focus",      value: '4h 22m', sub: 'Your deepest session was 87 min — a personal best. Flow state detected twice today.' },
        { type: 'metric-row', items: [{ label: 'Sessions', value: '3' }, { label: 'Score', value: '92' }, { label: 'vs last wk', value: '+14%' }] },
        { type: 'text',       label: 'How are you feeling?', value: '🔥 Flow  ·  😌 Calm  ·  🌫 Foggy  ·  ⚡ Wired' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Deep work block',  sub: 'Today · 87 min',      badge: '96' },
          { icon: 'zap',      title: 'Writing sprint',   sub: 'Today · 45 min',      badge: '88' },
          { icon: 'eye',      title: 'Planning',         sub: 'Yesterday · 30 min',  badge: '74' },
        ]},
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'metric',     label: 'Active — Deep Work',  value: '23:41',  sub: 'Flow state detected ✦' },
        { type: 'metric-row', items: [{ label: 'Elapsed', value: '36m' }, { label: 'Distract.', value: '2' }, { label: 'HR avg', value: '62bpm' }] },
        { type: 'text',       label: 'Ambient sound', value: '🌧 Rain on Glass · Spatial · 44Hz' },
        { type: 'progress', items: [
          { label: 'Session progress', pct: 62 },
          { label: 'Volume',           pct: 68 },
        ]},
        { type: 'tags',  label: 'Controls', items: ['⏸ Pause', '↩ Restart', '⤵ End early', '+ Note'] },
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'text',  label: '24 soundscapes', value: 'Curated for focus, creativity, and rest.' },
        { type: 'tags',  label: 'Mood filter', items: ['All', 'Deep Work', 'Creative', 'Calm', 'Wind Down'] },
        { type: 'list', items: [
          { icon: 'play',  title: 'Rain on Glass',  sub: 'Spatial · Focus',    badge: '▶' },
          { icon: 'heart', title: 'Brown Noise',    sub: 'Pure · 40Hz',        badge: '♡' },
          { icon: 'star',  title: 'Forest at Dawn', sub: 'Binaural · Natural', badge: '✦' },
          { icon: 'play',  title: 'Lo-fi Studio',   sub: 'Music · 90 BPM',    badge: '♡' },
          { icon: 'play',  title: 'Deep Ocean',     sub: 'Spatial · Sleep',   badge: '♡' },
        ]},
      ],
    },
    {
      id: 'history', label: 'History',
      content: [
        { type: 'text',       label: '35-day activity map', value: 'March 2026 · tap any day for details' },
        { type: 'metric-row', items: [{ label: 'Sessions', value: '12' }, { label: 'Total', value: '18h' }, { label: 'Avg score', value: '89' }, { label: 'Streak', value: '6d 🔥' }] },
        { type: 'progress', items: [
          { label: 'Mon', pct: 0.72 },
          { label: 'Tue', pct: 0.95 },
          { label: 'Wed', pct: 0.88 },
          { label: 'Thu', pct: 0.70 },
          { label: 'Fri', pct: 0.89 },
          { label: 'Sat', pct: 0.85 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Today',     sub: '3 sessions · 4h 22m', badge: '92' },
          { icon: 'activity', title: 'Yesterday', sub: '2 sessions · 2h 10m', badge: '88' },
          { icon: 'activity', title: 'Tuesday',   sub: '4 sessions · 6h 05m', badge: '95' },
          { icon: 'activity', title: 'Monday',    sub: '1 session  · 45m',    badge: '70' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text',   label: 'Weekly Brief · Mar 24–30', value: 'Solid week. You logged 18 hours across 12 sessions — up 23% from last week. Your peak window holds at 9–11am. Tuesday\'s 6h day powered your streak. Watch your evening sessions: they score 18 points lower on average.' },
        { type: 'metric-row', items: [{ label: 'Peak window', value: '9–11am' }, { label: 'Top sound', value: 'Rain 🌧' }] },
        { type: 'progress', items: [
          { label: 'Mon', pct: 0.72 },
          { label: 'Tue', pct: 0.95 },
          { label: 'Wed', pct: 0.88 },
          { label: 'Thu', pct: 0.70 },
          { label: 'Fri', pct: 0.89 },
          { label: 'Sat', pct: 0.85 },
          { label: 'Today', pct: 0.92 },
        ]},
        { type: 'text',   label: '⚡ Recommendation', value: 'Try a 90-min ultradian session. Your flow data suggests you consistently peak past the standard 25-min block.' },
      ],
    },
  ],

  nav: [
    { id: 'home',    label: 'Home',    icon: 'home'     },
    { id: 'session', label: 'Session', icon: 'play'     },
    { id: 'library', label: 'Library', icon: 'heart'    },
    { id: 'history', label: 'History', icon: 'calendar' },
    { id: 'insights',label: 'Insights',icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'haze-mock', 'HAZE — Interactive Mock');
console.log('Mock live at:', result.url);
