import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SYLVAN',
  tagline:   'Slow Living, Daily Reflection',
  archetype: 'wellness',
  palette: {
    bg:      '#1C1917',
    surface: '#292522',
    text:    '#FAF8F3',
    accent:  '#C8614A',
    accent2: '#8FAF78',
    muted:   'rgba(250,248,243,0.4)',
  },
  lightPalette: {
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C8614A',
    accent2: '#8FAF78',
    muted:   'rgba(28,25,23,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',  label: 'Good morning, Rakis.', value: 'Sunday · March 22' },
        { type: 'metric-row', items: [
          { label: 'Mood', value: '😊' },
          { label: 'Water', value: '6/8' },
          { label: 'Breathe', value: '✓' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Morning walk without headphones', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Read 20 pages of Deep Work',       sub: 'Completed', badge: '✓' },
          { icon: 'star',  title: 'Call Mom in the evening',           sub: 'Pending'  },
          { icon: 'star',  title: 'Cook something new for dinner',     sub: 'Pending'  },
        ]},
        { type: 'text', label: 'Quote', value: '"The present moment is the only time over which we have dominion." — Tolstoy' },
        { type: 'progress', items: [
          { label: 'Water (6/8 glasses)', pct: 75 },
          { label: 'Intentions (2/4 done)', pct: 50 },
        ]},
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'metric-row', items: [
          { label: 'Streak', value: '14d' },
          { label: 'Entries', value: '47' },
          { label: 'This Week', value: '5/7' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Today · March 22', sub: 'Calmer after the morning walk without...', badge: '😊' },
          { icon: 'star',  title: 'Yesterday · 21',   sub: 'Meeting went better than expected. Learning...', badge: '😐' },
          { icon: 'heart', title: 'March 20',         sub: 'Cooked a new recipe. Reminded me of simpler...', badge: '😁' },
        ]},
        { type: 'tags', label: 'Common Themes', items: ['Gratitude', 'Work', 'Joy', 'Family', 'Rest'] },
      ],
    },
    {
      id: 'habits', label: 'Habits',
      content: [
        { type: 'metric-row', items: [
          { label: 'Done Today', value: '7/9' },
          { label: 'Streak',     value: '14d' },
          { label: 'Best',       value: '31d' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Morning Pages',       sub: '🔥 14 days', badge: '✓' },
          { icon: 'check', title: 'Meditation 10 min',   sub: '🔥 8 days',  badge: '✓' },
          { icon: 'check', title: 'No phone before 9am', sub: '🔥 21 days', badge: '✓' },
          { icon: 'check', title: 'Gratitude List',      sub: '🔥 14 days', badge: '✓' },
          { icon: 'check', title: 'Walk / Move',         sub: '🔥 5 days',  badge: '✓' },
          { icon: 'star',  title: 'Read 20 pages',       sub: '🔥 6 days' },
          { icon: 'star',  title: 'Digital Sunset 9pm',  sub: '🔥 3 days' },
          { icon: 'star',  title: 'Evening Reflection',  sub: '🔥 14 days' },
        ]},
      ],
    },
    {
      id: 'garden', label: 'Garden',
      content: [
        { type: 'metric', label: 'March Garden', value: '82%', sub: '18 of 22 days completed' },
        { type: 'metric-row', items: [
          { label: 'Morning Pages', value: '🌿' },
          { label: 'Meditation',    value: '🌙' },
          { label: 'Movement',      value: '🌅' },
        ]},
        { type: 'progress', items: [
          { label: 'Week 1 — Foundation', pct: 100 },
          { label: 'Week 2 — Growth',     pct: 86  },
          { label: 'Week 3 — Deepening',  pct: 71  },
          { label: 'Week 4 — Blooming',   pct: 60  },
        ]},
        { type: 'text', label: 'Garden Status', value: '🌱 Flourishing — best month yet!' },
        { type: 'tags', label: 'Strongest Habits', items: ['No Phone Before 9am', 'Morning Pages', 'Gratitude List'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Mood', value: '4.1' },
          { label: 'Best Day', value: 'Tue' },
          { label: 'Top Habit', value: '📖' },
        ]},
        { type: 'progress', items: [
          { label: 'Monday',    pct: 58 },
          { label: 'Tuesday',   pct: 74 },
          { label: 'Wednesday', pct: 48 },
          { label: 'Thursday',  pct: 80 },
          { label: 'Friday',    pct: 44 },
          { label: 'Saturday',  pct: 34 },
          { label: 'Sunday',    pct: 70 },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'Best day: Tuesday',  sub: 'You feel most energetic — schedule creative work then.', badge: '🌅' },
          { icon: 'heart',  title: 'Reading = calm',      sub: 'On reading days, mood scores 23% higher.',              badge: '📖' },
          { icon: 'check',  title: 'Hydration matters',   sub: 'Best entries coincide with 8+ glasses of water.',       badge: '💧' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'sun'      },
    { id: 'journal',  label: 'Journal',  icon: 'book'     },
    { id: 'habits',   label: 'Habits',   icon: 'check'    },
    { id: 'garden',   label: 'Garden',   icon: 'heart'    },
    { id: 'insights', label: 'Insights', icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sylvan-mock', 'SYLVAN — Interactive Mock');
console.log('Mock live at:', result.url);
