import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BALM',
  tagline:   'Know what your body knows',
  archetype: 'wellness-biometric',

  // Dark palette (required by builder)
  palette: {
    bg:      '#1A1410',
    surface: '#242018',
    text:    '#F6F1EB',
    accent:  '#C04A12',
    accent2: '#3D7A56',
    muted:   'rgba(246,241,235,0.40)',
  },

  // Light palette — BALM is a light-first app
  lightPalette: {
    bg:      '#F6F1EB',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#C04A12',
    accent2: '#3D7A56',
    muted:   'rgba(26,20,16,0.45)',
  },

  screens: [
    {
      id: 'morning', label: 'Morning',
      content: [
        { type: 'metric', label: 'Readiness', value: '84', sub: 'Well Primed — high-output day ahead' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '62ms' },
          { label: 'Resting HR', value: '54bpm' },
          { label: 'Sleep', value: '7h 42m' },
          { label: 'Body Temp', value: '+0.1°' },
        ]},
        { type: 'text', label: 'BALM Insight', value: 'HRV trending up 3 days in a row — your nervous system is building resilience. Light to moderate intensity today will compound these gains.' },
        { type: 'progress', items: [
          { label: 'Deep sleep (23%)', pct: 23 },
          { label: 'REM sleep (25%)', pct: 25 },
          { label: 'Light sleep (47%)', pct: 47 },
        ]},
        { type: 'tags', label: 'Morning Actions', items: ['Log mood', 'Breathe', 'Day plan'] },
      ],
    },
    {
      id: 'move', label: 'Move',
      content: [
        { type: 'metric-row', items: [
          { label: 'Move', value: '680 kcal' },
          { label: 'Exercise', value: '34 min' },
          { label: 'Stand', value: '9 hrs' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Steps', value: '8,241' },
          { label: 'Distance', value: '5.8km' },
          { label: 'Active', value: '34m' },
          { label: 'Floors', value: '12' },
        ]},
        { type: 'progress', items: [
          { label: 'Zone 1 Recovery (53%)', pct: 53 },
          { label: 'Zone 2 Aerobic (29%)', pct: 29 },
          { label: 'Zone 3 Tempo (15%)', pct: 15 },
          { label: 'Zone 4 Threshold (3%)', pct: 3 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning Run', sub: '34 min · 4.9 km · 148bpm avg', badge: 'Today' },
          { icon: 'activity', title: 'Mobility Flow', sub: '20 min · 89bpm avg', badge: 'Yesterday' },
          { icon: 'activity', title: 'Cycling', sub: '52 min · 18.4 km · 136bpm avg', badge: 'Apr 1' },
        ]},
      ],
    },
    {
      id: 'nourish', label: 'Nourish',
      content: [
        { type: 'metric-row', items: [
          { label: 'Consumed', value: '1,420 kcal' },
          { label: 'Remaining', value: '680 kcal' },
          { label: 'Goal', value: '2,100' },
        ]},
        { type: 'progress', items: [
          { label: 'Protein 78 / 120g', pct: 65 },
          { label: 'Carbs 165 / 220g', pct: 75 },
          { label: 'Fat 52 / 70g', pct: 74 },
          { label: 'Water 1.4 / 2.5L', pct: 56 },
        ]},
        { type: 'list', items: [
          { icon: 'leaf', title: 'Breakfast', sub: 'Oat porridge, berries, almond milk', badge: '420 kcal' },
          { icon: 'leaf', title: 'Snack', sub: 'Greek yogurt, walnuts, honey', badge: '280 kcal' },
          { icon: 'leaf', title: 'Lunch', sub: 'Lentil soup, sourdough, olive oil', badge: '720 kcal' },
        ]},
        { type: 'text', label: 'Nutritional Note', value: 'You\'re ahead on protein by lunch — unusual for you. A lighter dinner tonight would align with your early sleep goal.' },
      ],
    },
    {
      id: 'reflect', label: 'Reflect',
      content: [
        { type: 'tags', label: 'How are you feeling?', items: ['🌱 Growing', '⚡ Energised ✓', '😌 Calm', '🌊 Flowing', '😴 Tired'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Head & neck', sub: 'No tension noted', badge: 'Low' },
          { icon: 'alert', title: 'Shoulders', sub: 'Mild tightness post-run', badge: 'Med' },
          { icon: 'check', title: 'Lower back', sub: 'Looser than yesterday', badge: 'Low' },
          { icon: 'alert', title: 'Legs', sub: 'Mild DOMS from tempo run', badge: 'Med' },
        ]},
        { type: 'text', label: 'BALM Prompt', value: 'What did your body ask for today that you actually listened to?\n\n"I took a longer walk at lunch instead of eating at my desk. My energy after was noticeably different…"' },
        { type: 'list', items: [
          { icon: 'star', title: '1', sub: 'The morning run before the city woke up', badge: '' },
          { icon: 'star', title: '2', sub: 'That my shoulders feel less locked than last week', badge: '' },
          { icon: 'star', title: '3', sub: 'Eating a real lunch instead of snacking through meetings', badge: '' },
        ]},
      ],
    },
    {
      id: 'trends', label: 'Trends',
      content: [
        { type: 'text', label: 'Weekly Story', value: 'Your best recovery week in 3 months.\n\nHRV up 8%, sleep consistency 94%, and 4 of 7 readiness scores above 80.' },
        { type: 'progress', items: [
          { label: 'Mon Readiness 72', pct: 72 },
          { label: 'Tue Readiness 68', pct: 68 },
          { label: 'Wed Readiness 74', pct: 74 },
          { label: 'Thu Readiness 78', pct: 78 },
          { label: 'Fri Readiness 82', pct: 82 },
          { label: 'Sat Readiness 80', pct: 80 },
          { label: 'Sun Readiness 84', pct: 84 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'High confidence', sub: 'Days you ran before 7am had 12% higher HRV the next morning', badge: '↑' },
          { icon: 'eye', title: 'High confidence', sub: 'Screens after 10pm reduced sleep score by avg 9 points', badge: '↓' },
          { icon: 'alert', title: 'Medium confidence', sub: 'Thursday meals skew highest in processed carbs — and so do Thursday headaches', badge: '⚠' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg Readiness', value: '77' },
          { label: 'HRV Trend', value: '+8%' },
          { label: 'Sleep Consistency', value: '94%' },
          { label: 'Workouts', value: '5/7' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'morning', label: 'Morning', icon: 'sunrise' },
    { id: 'move',    label: 'Move',    icon: 'activity' },
    { id: 'nourish', label: 'Nourish', icon: 'leaf' },
    { id: 'reflect', label: 'Reflect', icon: 'heart' },
    { id: 'trends',  label: 'Trends',  icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'balm-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
