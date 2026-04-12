import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Cedar',
  tagline:   'A place for slow reflection',
  archetype: 'slow-living-journal',

  palette: {           // dark theme
    bg:      '#1A1C18',
    surface: '#232620',
    text:    '#E8E4DA',
    accent:  '#5C9E72',
    accent2: '#A8C8A0',
    muted:   'rgba(200,190,170,0.4)',
  },
  lightPalette: {      // light theme (primary — this is a light design)
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#2B2620',
    accent:  '#3D6B4F',
    accent2: '#7FA882',
    muted:   'rgba(122,110,98,0.45)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Sunday, April 12', value: 'Day 12', sub: 'of your journaling streak' },
        { type: 'metric-row', items: [
          { label: 'Energy', value: '7.2' },
          { label: 'Mood', value: 'Calm' },
          { label: 'Focus', value: 'Deep' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Morning pages', sub: '7:14 AM · Writing', badge: '◎' },
          { icon: 'heart', title: 'Called mum', sub: '9:30 AM · Connect', badge: '◑' },
          { icon: 'zap',  title: 'Deep work block', sub: '11:00 AM · Focus', badge: '●' },
          { icon: 'map',  title: 'Walk in the park', sub: '2:15 PM · Nature', badge: '◎' },
        ]},
        { type: 'progress', items: [
          { label: 'Habits completed', pct: 50 },
          { label: 'Daily word goal', pct: 74 },
        ]},
        { type: 'tags', label: 'Today\'s themes', items: ['slowness','nature','focus','morning'] },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: 'April 2026', value: '7 entries', sub: '1,840 words written this month' },
        { type: 'list', items: [
          { icon: 'eye',    title: 'On beginning again', sub: 'Apr 12 · 248 words · Calm', badge: '◎' },
          { icon: 'map',    title: 'Walking without destination', sub: 'Apr 11 · 312 words · Peaceful', badge: '◑' },
          { icon: 'layers', title: 'The cost of busyness', sub: 'Apr 10 · 195 words · Reflective', badge: '○' },
          { icon: 'star',   title: 'Small joys, catalogued', sub: 'Apr 8 · 140 words · Grateful', badge: '◎' },
          { icon: 'code',   title: 'On deep work', sub: 'Apr 6 · 290 words · Focused', badge: '●' },
        ]},
        { type: 'tags', label: 'Browse by tag', items: ['#gratitude','#nature','#work','#morning','#connection'] },
        { type: 'text', label: 'Writing streak', value: '12 consecutive days. Your longest yet.' },
      ],
    },
    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'metric', label: 'Log a moment', value: 'Now · 2:48 PM', sub: 'What happened in the last few hours?' },
        { type: 'tags', label: 'Category', items: ['Nature','Focus','Connect','Rest','Create','Move','Read'] },
        { type: 'metric-row', items: [
          { label: 'Mood', value: '😊' },
          { label: 'Energy', value: '7 / 10' },
        ]},
        { type: 'text', label: 'Quick note', value: 'A quiet walk — surprised how still the park felt for a Saturday afternoon.' },
        { type: 'tags', label: 'Tags', items: ['#walk','#nature','#saturday','#peace'] },
      ],
    },
    {
      id: 'reflect',
      label: 'Reflect',
      content: [
        { type: 'metric', label: 'Week of April 7–13', value: 'Streak: 12', sub: 'days of consecutive writing' },
        { type: 'metric-row', items: [
          { label: 'Words', value: '2,840' },
          { label: 'Moments', value: '28' },
          { label: 'Avg energy', value: '7.4' },
        ]},
        { type: 'progress', items: [
          { label: 'Monday mood', pct: 60 },
          { label: 'Tuesday mood', pct: 70 },
          { label: 'Wednesday mood', pct: 50 },
          { label: 'Thursday mood', pct: 80 },
          { label: 'Friday mood', pct: 90 },
          { label: 'Saturday mood', pct: 70 },
          { label: 'Sunday mood', pct: 80 },
        ]},
        { type: 'text', label: 'Weekly insight', value: 'Your best days this week started early. On mornings you wrote before 8am, energy averaged 8.5 — 18% higher than late starts.' },
        { type: 'tags', label: 'Top themes', items: ['slowness','nature','connection','focus','gratitude','reading'] },
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'home'     },
    { id: 'journal', label: 'Journal', icon: 'eye'      },
    { id: 'log',     label: 'Log',     icon: 'plus'     },
    { id: 'reflect', label: 'Reflect', icon: 'activity' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cedar-mock', 'Cedar — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/cedar-mock`);
