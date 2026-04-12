// still-mock.mjs — STILL Svelte Interactive Mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'STILL',
  tagline:   'your brain is not a server',
  archetype: 'wellness-mindfulness',

  palette: {           // LIGHT (main) — shown as dark in toggle
    bg:      '#1C1917',
    surface: '#2A2520',
    text:    '#F5F3EF',
    accent:  '#3A8762',
    accent2: '#D4A050',
    muted:   'rgba(245,243,239,0.42)',
  },

  lightPalette: {      // LIGHT — this is the primary palette
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#2D6A4F',
    accent2: '#C4903A',
    muted:   'rgba(28,25,23,0.45)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'text',       label: 'Tuesday · Mar 31', value: 'You are in: STILL' },
        { type: 'metric-row', items: [
          { label: 'Stillness', value: '74 / 100' },
          { label: 'Motion',   value: '4 of 6' },
          { label: 'Streak',   value: '9 days' },
        ]},
        { type: 'progress',   items: [
          { label: 'still blocks today', pct: 38 },
          { label: 'motion blocks',      pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Morning walk without phone', sub: '7:12 AM', badge: '✓' },
          { icon: 'star',  title: 'Eye rest — distance gaze',  sub: 'Now',     badge: '◑' },
          { icon: 'circle',title: 'Afternoon walk',            sub: '2:00 PM', badge: '○' },
        ]},
        { type: 'tags', label: "today's states", items: ['MOTION 62min', 'STILL 28min', 'MOTION 74min', 'STILL 38min'] },
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'metric',   label: 'Session Timer', value: '25:00', sub: 'MOTION — deep work' },
        { type: 'text',     label: 'Session intention', value: 'Finish Q2 strategy deck — section 3 only' },
        { type: 'progress', items: [{ label: 'session progress', pct: 0 }] },
        { type: 'list', items: [
          { icon: 'check', title: 'Motion · 47 min', sub: 'Report writing · 8:14am', badge: '◐' },
          { icon: 'check', title: 'Still · 18 min',  sub: 'Walk + tea · 7:52am',     badge: '◑' },
        ]},
        { type: 'tags', label: 'switch state', items: ['◐ MOTION', '◑ STILL'] },
      ],
    },
    {
      id: 'ritual', label: 'Break Ritual',
      content: [
        { type: 'metric',   label: 'Ritual — Eye Rest', value: '0:20', sub: 'look into the distance · panoramic gaze' },
        { type: 'text',     label: 'instruction', value: 'Find a fixed point in the distance and hold it for 20 seconds. Activates parasympathetic state.' },
        { type: 'progress', items: [{ label: 'ritual progress', pct: 0 }] },
        { type: 'list', items: [
          { icon: 'check', title: 'Morning walk without phone', sub: 'Completed · 7:12am', badge: '✓' },
          { icon: 'star',  title: 'Eye rest — distance gaze',  sub: 'In progress',         badge: '◑' },
          { icon: 'circle',title: 'Afternoon walk — no agenda',sub: 'Scheduled · 2pm',     badge: '○' },
        ]},
        { type: 'tags', label: 'philosophy', items: ['stillness.', 'motion.', 'contrast.'] },
      ],
    },
    {
      id: 'patterns', label: 'Patterns',
      content: [
        { type: 'metric',   label: 'This week', value: '74', sub: 'stillness score — up from 66' },
        { type: 'progress', items: [
          { label: 'Monday    — still 34%',  pct: 34 },
          { label: 'Tuesday   — still 24%',  pct: 24 },
          { label: 'Wednesday — still 28%',  pct: 28 },
          { label: 'Thursday  — still 38% ★',pct: 38 },
          { label: 'Friday    — still 18%',  pct: 18 },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Thursday is your stillness sweet spot', sub: '38% avg — protect it',          badge: '◑' },
          { icon: 'zap',   title: 'Tuesday motion spikes after 2pm',       sub: 'try a scheduled still break',    badge: '⚡' },
          { icon: 'check', title: 'Weekly score: 74 / 100',                sub: 'up from 66 last week',          badge: '✦' },
        ]},
      ],
    },
    {
      id: 'rituals', label: 'Rituals',
      content: [
        { type: 'text',  label: 'recovery templates', value: 'Science-backed micro-rituals that actually switch your nervous system state.' },
        { type: 'list', items: [
          { icon: 'eye',    title: 'Panoramic gaze',          sub: '2 min · vision & eyes',    badge: '◑' },
          { icon: 'eye',    title: '20-20-20 rule',           sub: '20 sec · vision & eyes',   badge: '◑' },
          { icon: 'wind',   title: 'Box breathing',           sub: '4 min · body & breath',    badge: '◑' },
          { icon: 'map',    title: 'Walk without destination',sub: '10 min · body & breath',   badge: '◑' },
          { icon: 'edit',   title: 'Session close ritual',    sub: '3 min · mind & reflection',badge: '◑' },
        ]},
        { type: 'tags', label: 'categories', items: ['vision & eyes', 'body & breath', 'mind & reflection'] },
      ],
    },
  ],

  nav: [
    { id: 'home',     label: 'Home',     icon: 'home' },
    { id: 'session',  label: 'Session',  icon: 'clock' },
    { id: 'ritual',   label: 'Ritual',   icon: 'star' },
    { id: 'patterns', label: 'Patterns', icon: 'chart' },
    { id: 'rituals',  label: 'Rituals',  icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'still-mock', 'STILL — Interactive Mock');
console.log('Mock live at:', result.url);
