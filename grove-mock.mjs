import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GROVE',
  tagline:   'grow with intention',
  archetype: 'wellness-productivity',
  palette: {           // dark theme (required)
    bg:      '#0D1A10',
    surface: '#122016',
    text:    '#E8F2EC',
    accent:  '#4A7C59',
    accent2: '#D4856A',
    muted:   'rgba(232,242,236,0.45)',
  },
  lightPalette: {      // light theme (the primary for this design)
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1A16',
    accent:  '#4A7C59',
    accent2: '#D4856A',
    muted:   'rgba(28,26,22,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: '🔥 Day Streak', value: '47', sub: 'Your longest run yet' },
        { type: 'metric-row', items: [{ label: 'Done', value: '8' }, { label: 'Total', value: '12' }, { label: 'Rate', value: '67%' }] },
        { type: 'list', items: [
          { icon: 'check', title: 'Morning Meditation', sub: '10 min · done', badge: '✓' },
          { icon: 'check', title: 'Read 20 Pages', sub: 'done', badge: '✓' },
          { icon: 'eye', title: 'Journal 5 min', sub: 'pending', badge: '○' },
          { icon: 'activity', title: 'Exercise 30 min', sub: 'pending', badge: '○' },
          { icon: 'heart', title: 'Evening Walk', sub: '15 min · pending', badge: '○' },
        ]},
        { type: 'text', label: 'Daily Quote', value: '"Small habits compound into extraordinary results."' },
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'metric', label: 'Morning Meditation', value: '08:32', sub: 'Breathe out slowly · Round 2/3' },
        { type: 'progress', items: [{ label: 'Session Progress', pct: 42 }] },
        { type: 'metric-row', items: [{ label: 'Elapsed', value: '1:28' }, { label: 'Remaining', value: '8:32' }] },
        { type: 'tags', label: 'Session Type', items: ['Mindfulness', 'Day 47', '10 min'] },
        { type: 'text', label: 'Guidance', value: 'Focus on the natural rhythm of your breath. Let thoughts pass like clouds.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [{ label: 'Completion', value: '87%' }, { label: 'Active', value: '23' }, { label: 'Streak', value: '47d' }] },
        { type: 'progress', items: [
          { label: 'Mindfulness', pct: 92 },
          { label: 'Physical', pct: 78 },
          { label: 'Learning', pct: 65 },
          { label: 'Creative', pct: 54 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Best Day: Thursday', sub: '100% completion · 12/12 habits', badge: '🏆' },
          { icon: 'zap', title: 'Biggest Win', sub: 'Meditation — 47 consecutive days', badge: '🔥' },
          { icon: 'chart', title: 'Trend', sub: 'Improving 14% vs last week', badge: '↑' },
        ]},
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'metric', label: 'Entry #128', value: 'Apr 12', sub: 'Sunday · 142 words' },
        { type: 'text', label: 'What are you grateful for today?', value: 'I\'m grateful for the quiet morning light, the smell of coffee, and the way a good book can transport you completely out of your own head...' },
        { type: 'tags', label: 'Mood', items: ['😌 Calm', '🌱 Growing', '☀️ Optimistic'] },
        { type: 'list', items: [
          { icon: 'star', title: 'One thing I learned', sub: 'Tap to add', badge: '+' },
          { icon: 'heart', title: "Tomorrow's intention", sub: 'Tap to add', badge: '+' },
          { icon: 'zap', title: 'A moment of joy', sub: 'Tap to add', badge: '+' },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'list', items: [
          { icon: 'star', title: 'Read 24 Books', sub: '4 of 24 · 320 days left', badge: '17%' },
          { icon: 'activity', title: 'Daily Meditation', sub: '47/90 days · streak goal', badge: '52%' },
          { icon: 'zap', title: '5K Under 25 Min', sub: 'Current best: 27:14', badge: '65%' },
        ]},
        { type: 'progress', items: [
          { label: 'Read 24 Books', pct: 17 },
          { label: 'Daily Meditation', pct: 52 },
          { label: '5K Under 25 Min', pct: 65 },
        ]},
        { type: 'tags', label: 'Completed Goals', items: ['30-Day Journaling ✓', 'Cold Shower Week ✓', 'Digital Detox ✓'] },
      ],
    },
    {
      id: 'explore', label: 'Explore',
      content: [
        { type: 'metric', label: 'Habit Library', value: '10K+', sub: 'growers building better habits' },
        { type: 'tags', label: 'Browse by', items: ['All', 'Mindfulness', 'Physical', 'Creative', 'Learning', 'Sleep'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Morning Pages', sub: '15 min · 89% stick rate', badge: 'Creative' },
          { icon: 'heart', title: 'Box Breathing', sub: '5 min · 94% stick rate', badge: 'Mind' },
          { icon: 'activity', title: 'Cold Shower', sub: '5 min · 71% stick rate', badge: 'Physical' },
          { icon: 'eye', title: 'Digital Sunset', sub: '60 min before bed · 82%', badge: 'Sleep' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'session',  label: 'Session',  icon: 'play' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'journal',  label: 'Journal',  icon: 'star' },
    { id: 'goals',    label: 'Goals',    icon: 'check' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'grove-mock', 'GROVE — Interactive Mock');
console.log('Mock result:', result.status, '→ https://ram.zenbin.org/grove-mock');
