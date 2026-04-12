// VERDANT — Svelte Interactive Mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VERDANT',
  tagline:   'Tend your growth. Track your seasons.',
  archetype: 'wellness',
  palette: {           // Dark theme (required)
    bg:      '#1A2019',
    surface: '#242B22',
    text:    '#E8F0EA',
    accent:  '#5FA675',
    accent2: '#D4894A',
    muted:   'rgba(232,240,234,0.45)',
  },
  lightPalette: {      // Light theme — primary for this design
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1C1A16',
    accent:  '#3D6B4F',
    accent2: '#C4692A',
    muted:   'rgba(28,26,22,0.45)',
  },
  screens: [
    {
      id: 'garden',
      label: 'Garden',
      content: [
        { type: 'metric', label: 'Today', value: 'Sunday', sub: '22 March · Week 12 of Growth' },
        { type: 'metric-row', items: [
          { label: 'Day Streak', value: '24' },
          { label: 'Practices', value: '6' },
          { label: 'Vitality', value: '84%' },
        ]},
        { type: 'text', label: '🌿 Spring Equinox', value: 'A season of new roots. Your consistency this week has been remarkable — 6 of 7 practices completed.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Morning Breathwork', sub: 'Completed 7:12 AM', badge: '✓' },
          { icon: 'check', title: 'Mindful Reading', sub: 'Completed 8:30 AM', badge: '✓' },
          { icon: 'activity', title: 'Nature Walk', sub: 'Not yet today', badge: '·' },
          { icon: 'star', title: 'Evening Journal', sub: 'Not yet today', badge: '·' },
        ]},
      ],
    },
    {
      id: 'practices',
      label: 'Practices',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Body', 'Mind', 'Spirit'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning Breathwork', sub: 'Box breathing · 10 min · 6:30 AM', badge: '24d' },
          { icon: 'map', title: 'Nature Walk', sub: 'Outdoor walking · 30–45 min', badge: '11d' },
          { icon: 'star', title: 'Evening Journal', sub: 'Reflective writing · 15 min', badge: '24d' },
          { icon: 'eye', title: 'Mindful Reading', sub: 'Deep reading · 30 min', badge: '18d' },
          { icon: 'heart', title: 'Morning Yoga', sub: 'Gentle flow · 20 min · 7:00 AM', badge: '9d' },
          { icon: 'zap', title: 'Cold Shower', sub: 'Contrast therapy · 2 min', badge: '6d' },
        ]},
        { type: 'progress', items: [
          { label: 'Morning Breathwork', pct: 86 },
          { label: 'Evening Journal', pct: 57 },
          { label: 'Nature Walk', pct: 71 },
          { label: 'Mindful Reading', pct: 82 },
        ]},
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: 'Today\'s Reflection', value: 'Mar 22', sub: 'Sunday · Flowing mood' },
        { type: 'tags', label: 'Mood', items: ['🌱 Rooted', '☀️ Energised', '🌊 Flowing', '🌙 Reflective', '🌿 Calm'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Gratitude 1', sub: 'The quiet of early morning before the house wakes up.', badge: '🙏' },
          { icon: 'star', title: 'Gratitude 2', sub: 'How the light fell through the kitchen window at 7am.', badge: '🙏' },
          { icon: 'star', title: 'Gratitude 3', sub: 'A conversation with an old friend I hadn\'t expected.', badge: '🙏' },
        ]},
        { type: 'text', label: '✍️ Free Pages', value: 'There\'s something about Sundays in late March — the way the season feels genuinely suspended between what was and what\'s coming. I found myself standing still in the garden today, noticing how the soil smells different now...' },
        { type: 'tags', label: 'Tags', items: ['#spring', '#gratitude', '#stillness', '#nature'] },
      ],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: [
        { type: 'metric', label: 'March 2026', value: '22', sub: 'days into spring' },
        { type: 'metric-row', items: [
          { label: 'Practices', value: '52' },
          { label: 'Journals', value: '20' },
          { label: 'Streak', value: '22d' },
        ]},
        { type: 'progress', items: [
          { label: 'Practices completed', pct: 78 },
          { label: 'Journal entries', pct: 91 },
          { label: 'Streak maintained', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: '24-Day Breathwork Streak', sub: 'Mar 22 · Unbroken since Feb 27', badge: '🌱' },
          { icon: 'star', title: 'Completed "Braiding Sweetgrass"', sub: 'Mar 15 · Three weeks of mindful reading', badge: '📖' },
          { icon: 'activity', title: 'Cold Water Immersion — First Time', sub: 'Mar 8 · Two minutes at Chesil Beach', badge: '🌊' },
          { icon: 'heart', title: 'Spring Season Begins', sub: 'Mar 1 · Set intentions for renewal', badge: '🌿' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: '🌸 Spring Pattern', value: 'You\'re most consistent in the mornings. Practices completed before 9am have a 94% completion rate vs 61% for afternoon slots.' },
        { type: 'metric-row', items: [
          { label: 'Avg daily', value: '4.2' },
          { label: 'Best day', value: 'Mon' },
          { label: 'Month score', value: 'A−' },
        ]},
        { type: 'progress', items: [
          { label: 'Morning Breathwork', pct: 96 },
          { label: 'Evening Journal', pct: 87 },
          { label: 'Mindful Reading', pct: 82 },
          { label: 'Nature Walk', pct: 71 },
          { label: 'Morning Yoga', pct: 64 },
          { label: 'Cold Shower', pct: 58 },
        ]},
        { type: 'text', label: '💡 Insight', value: '"The garden suggests there might be a place where we can meet nature halfway." — Michael Pollan' },
        { type: 'tags', label: 'Your strengths', items: ['Morning', 'Consistency', 'Journaling', 'Breathwork'] },
      ],
    },
  ],
  nav: [
    { id: 'garden',    label: 'Garden',    icon: 'home' },
    { id: 'practices', label: 'Habits',    icon: 'activity' },
    { id: 'journal',   label: 'Journal',   icon: 'star' },
    { id: 'timeline',  label: 'Timeline',  icon: 'calendar' },
    { id: 'insights',  label: 'Insights',  icon: 'eye' },
  ],
};

console.log('🌿 Building VERDANT Svelte mock…');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

console.log('📡 Publishing VERDANT mock…');
const result = await publishMock(html, 'verdant-mock', 'VERDANT — Interactive Mock · Biophilic Wellness Garden');
console.log('✅ Mock live at:', result.url);
