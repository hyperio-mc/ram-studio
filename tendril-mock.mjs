import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Tendril',
  tagline:   'Small habits. Exponential growth.',
  archetype: 'wellness-tracker',

  palette: {           // DARK theme (required by builder)
    bg:      '#16131A',
    surface: '#1E1A26',
    text:    '#EDE8F5',
    accent:  '#9B8FD4',
    accent2: '#74C78E',
    muted:   'rgba(237,232,245,0.40)',
  },
  lightPalette: {      // LIGHT theme — this is the primary Tendril palette
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#7C6EAD',
    accent2: '#5A9E78',
    muted:   'rgba(28,25,23,0.45)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',   label: 'Morning Intention', value: '"Small roots grow the deepest. Show up for just one habit." — Tendril Daily ✦' },
        { type: 'metric', label: 'Day Streak 🔥', value: '18', sub: 'Personal best · Meditation' },
        { type: 'metric-row', items: [
          { label: 'Completion', value: '67%' },
          { label: 'Done',       value: '4/6'  },
          { label: 'Pace',       value: '+12%' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Morning Meditation',  sub: '10 min · 18-day streak',     badge: '✓' },
          { icon: 'activity', title: 'Hydration',           sub: '6 of 8 glasses',              badge: '◉' },
          { icon: 'star',     title: 'Evening Reading',     sub: '20 min · in progress',        badge: '◈' },
          { icon: 'map',      title: 'Walk Outside',        sub: '30 min · not started',        badge: '○' },
        ]},
        { type: 'tags', label: 'Focus', items: ['All', 'Body', 'Mind', 'Rest', 'Social'] },
      ],
    },
    {
      id: 'garden', label: 'Garden',
      content: [
        { type: 'metric-row', items: [
          { label: 'Meditation', value: '100%' },
          { label: 'Hydration',  value: '82%'  },
          { label: 'Reading',    value: '71%'  },
          { label: 'Walking',    value: '64%'  },
        ]},
        { type: 'progress', items: [
          { label: 'Meditation · 18-day streak', pct: 100 },
          { label: 'Hydration · Week 12',         pct: 82  },
          { label: 'Reading · 5 of 7 days',       pct: 71  },
          { label: 'Walking · 4 of 7 days',        pct: 64  },
        ]},
        { type: 'text', label: 'Weekly Insight', value: 'Your meditation habit is now automatic — 100% this week. Hydration is your next opportunity: 6 more glasses would hit your weekly goal.' },
        { type: 'tags', label: 'View', items: ['W12', 'W11', 'W10', '30d', '90d'] },
      ],
    },
    {
      id: 'reflect', label: 'Reflect',
      content: [
        { type: 'text', label: '✦ Tonight\'s Prompt', value: 'What one small win are you proud of today?' },
        { type: 'metric-row', items: [
          { label: 'Mood', value: '😌' },
          { label: 'Energy', value: '◎◎◎' },
          { label: 'Words', value: '142' },
        ]},
        { type: 'text', label: 'Your Entry', value: 'I managed to meditate this morning even though I felt rushed. It only took 10 minutes but it set a calm tone for the whole day. Small wins adding up...' },
        { type: 'tags', label: 'Tags', items: ['self-compassion', 'growth', 'mindfulness', 'progress'] },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Yesterday',   sub: '"Feeling scattered but grateful for the walk."', badge: '◇' },
          { icon: 'calendar', title: 'Mon Mar 24',  sub: '"Best meditation session yet. 20 minutes."',     badge: '★' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Completion Rate', value: '84%', sub: '+12% vs last week · Week 12' },
        { type: 'metric-row', items: [
          { label: 'Best Streak', value: '18d'  },
          { label: 'Done',        value: '47'   },
          { label: 'Journaled',   value: '6/7'  },
        ]},
        { type: 'progress', items: [
          { label: 'Meditation · this week', pct: 100 },
          { label: 'Hydration · this week',  pct: 82  },
          { label: 'Reading · this week',    pct: 71  },
          { label: 'Walking · this week',    pct: 64  },
        ]},
        { type: 'text', label: 'Trend', value: 'You completed 84% of scheduled habits this week — your highest ever. At this pace, you\'ll hit your 30-day milestone in 12 days.' },
        { type: 'tags', label: 'Range', items: ['7d', '30d', '90d', '1y'] },
      ],
    },
    {
      id: 'circles', label: 'Circles',
      content: [
        { type: 'metric', label: 'Group Streak', value: '12d', sub: 'Morning Risers pod · best week' },
        { type: 'list', items: [
          { icon: 'user',  title: 'Priya Sharma',  sub: '5 habits · 18-day streak',  badge: '🔥' },
          { icon: 'user',  title: 'James Okafor',  sub: '4 habits · 14-day streak',  badge: '🔥' },
          { icon: 'user',  title: 'Luna Park',     sub: '3 habits · 7-day streak',   badge: '◉'  },
          { icon: 'user',  title: 'Raj Mehta',     sub: '6 habits · 12-day streak',  badge: '🔥' },
        ]},
        { type: 'tags', label: 'Pods', items: ['Morning Risers', 'Night Readers', 'Discover'] },
        { type: 'text', label: 'Pod Insight', value: 'Your pod hasn\'t missed a single day this week! Send a celebration nudge to keep the momentum going.' },
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'garden',   label: 'Garden',   icon: 'layers'   },
    { id: 'reflect',  label: 'Reflect',  icon: 'heart'    },
    { id: 'insights', label: 'Insights', icon: 'chart'    },
    { id: 'circles',  label: 'Circles',  icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'tendril-mock', 'Tendril — Interactive Mock');
console.log('Mock live at:', result.url);
