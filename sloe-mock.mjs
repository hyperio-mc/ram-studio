import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SLOE',
  tagline:   'Align with your body clock',
  archetype: 'health-circadian',
  palette: {           // dark — Warm Terminal
    bg:      '#0C0B09',
    surface: '#191410',
    text:    '#EDE0D0',
    accent:  '#D4845A',
    accent2: '#5B9BAA',
    muted:   'rgba(237,224,208,0.35)',
  },
  lightPalette: {      // light variant
    bg:      '#FAF6F0',
    surface: '#FFFFFF',
    text:    '#2A1F16',
    accent:  '#C0602A',
    accent2: '#3A7D8A',
    muted:   'rgba(42,31,22,0.4)',
  },
  screens: [
    {
      id: 'rise',
      label: 'Rise',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '87', sub: 'Great — top 18% this week' },
        { type: 'metric-row', items: [
          { label: 'Duration', value: '7h 22m' },
          { label: 'Efficiency', value: '96%' },
          { label: 'Fell asleep', value: '10:47' },
          { label: 'Woke up', value: '6:09' },
        ]},
        { type: 'text', label: 'Circadian Position', value: 'Peak energy window — you\'re in your morning cortisol surge. Best time for focus and physical activity.' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Get sunlight now', sub: 'Anchor your cortisol peak — go outside', badge: '☀' },
          { icon: 'activity', title: 'Best focus: 9:30–11:45 AM', sub: 'Ride your morning alertness peak', badge: '◎' },
        ]},
      ],
    },
    {
      id: 'tonight',
      label: 'Tonight',
      content: [
        { type: 'metric', label: 'Target Sleep Window', value: '10:30 PM', sub: '→ 6:15 AM · 7h 45m optimal' },
        { type: 'text', label: 'Wind-Down Countdown', value: '2h 47m until wind-down. Start your routine at 9:43 PM.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Blue light filter on', sub: 'Activated 2h ago', badge: '✓' },
          { icon: 'check', title: 'Last caffeine before 2 PM', sub: 'Good — on schedule', badge: '✓' },
          { icon: 'eye', title: 'Dim lights to 20%', sub: 'In 2h 47m', badge: '○' },
          { icon: 'eye', title: 'No screens 30 min before', sub: 'In 3h 17m', badge: '○' },
          { icon: 'home', title: 'Bedroom temp 65–68°F', sub: 'Set before wind-down', badge: '○' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Blue Light', value: '12%' },
          { label: 'of daily limit', value: 'Low ✓' },
        ]},
      ],
    },
    {
      id: 'bodyclock',
      label: 'Body Clock',
      content: [
        { type: 'metric', label: 'Current Phase', value: '6:09 AM', sub: 'Rising — early cortisol peak' },
        { type: 'progress', items: [
          { label: 'Sleep phase', pct: 0 },
          { label: 'Morning rise', pct: 72 },
          { label: 'Peak alertness', pct: 55 },
          { label: 'Afternoon dip', pct: 20 },
          { label: 'Wind-down', pct: 10 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Cortisol Peak', value: '8:30 AM' },
          { label: 'Melatonin Onset', value: '10:45 PM' },
        ]},
        { type: 'tags', label: 'Chronotype', items: ['◐ Intermediate', 'Evening-leaning', 'Flexible'] },
        { type: 'text', label: 'Chronotype Note', value: 'Intermediate — slightly evening-leaning. You can adapt to early or late schedules, but your natural peak arrives around 9:30 AM.' },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric-row', items: [
          { label: '7-day avg', value: '83' },
          { label: 'Best night', value: '95' },
          { label: 'Worst night', value: '68' },
          { label: 'vs last week', value: '+8 pts' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Today · Apr 10', sub: '10:47 PM → 6:09 AM · Energized', badge: '87' },
          { icon: 'star', title: 'Yesterday · Apr 9', sub: '11:02 PM → 6:30 AM · Good', badge: '88' },
          { icon: 'alert', title: 'Tue Apr 8', sub: '12:15 AM → 6:45 AM · Groggy', badge: '68' },
          { icon: 'star', title: 'Mon Apr 7', sub: '10:55 PM → 6:20 AM · Rested', badge: '91' },
        ]},
        { type: 'tags', label: 'Today\'s habits', items: ['Calm evening', 'No alcohol', 'Evening walk'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'text', label: 'Optimal Sleep Window', value: '10:45 PM – 6:30 AM — based on 30-day chronotype learning. Stay within ±30 min for best recovery.' },
        { type: 'progress', items: [
          { label: 'Sleep consistency', pct: 82 },
          { label: '7+ hour nights', pct: 71 },
          { label: 'Wind-down routine', pct: 90 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Evening walk', sub: 'Correlates with +12 sleep score points', badge: '+12' },
          { icon: 'heart', title: 'No alcohol', sub: '+14% sleep efficiency on sober nights', badge: '+9' },
          { icon: 'eye', title: 'Late screen', sub: 'Delays sleep onset by ~22 minutes', badge: '−8' },
          { icon: 'calendar', title: 'Same wake time', sub: 'Anchors circadian rhythm — +7 pts', badge: '+7' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'rise',      label: 'Rise',      icon: 'zap' },
    { id: 'tonight',   label: 'Tonight',   icon: 'eye' },
    { id: 'bodyclock', label: 'Clock',     icon: 'activity' },
    { id: 'journal',   label: 'Journal',   icon: 'list' },
    { id: 'insights',  label: 'Insights',  icon: 'chart' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sloe-mock', 'SLOE — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/sloe-mock');
