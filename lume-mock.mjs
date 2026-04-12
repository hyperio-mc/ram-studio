import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LUME',
  tagline:   'Ambient focus, beautifully lit.',
  archetype: 'focus-productivity',
  palette: {
    bg:      '#1C1917',
    surface: '#292524',
    text:    '#F8F4EE',
    accent:  '#7BAF87',
    accent2: '#D4956A',
    muted:   'rgba(248,244,238,0.4)',
  },
  lightPalette: {
    bg:      '#F8F4EE',
    surface: '#FFFFFF',
    text:    '#1A1815',
    accent:  '#5F8B6A',
    accent2: '#B87C4C',
    muted:   'rgba(26,24,21,0.4)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'text',      label: 'Good afternoon', value: 'James.' },
        { type: 'metric',    label: 'Day Streak',      value: '🔥 12', sub: 'days in a row' },
        { type: 'metric-row', items: [
          { label: 'Today',    value: '1h 24m' },
          { label: 'Sessions', value: '47' },
          { label: 'Goal',     value: '87%' },
        ]},
        { type: 'tags',  label: 'Pick Your Scene', items: ['🌲 Forest Rain','☀ Golden Hour','☕ Coffee Shop','🌊 Ocean Drift','♫ Night Studio'] },
        { type: 'text',  label: 'Now Playing', value: 'Forest Rain · 14:32 remaining · Deep Focus phase' },
        { type: 'progress', items: [{ label: 'Session progress', pct: 42 }] },
      ],
    },
    {
      id: 'scenes', label: 'Scenes',
      content: [
        { type: 'text', label: 'Collection', value: 'Choose your atmosphere.' },
        { type: 'list', items: [
          { icon: 'leaf',  title: 'Forest Rain',  sub: '25 min · Focus',  badge: 'Popular' },
          { icon: 'sun',   title: 'Golden Hour',  sub: '45 min · Deep',   badge: 'New'     },
          { icon: 'star',  title: 'Coffee Shop',  sub: '30 min · Flow',   badge: ''        },
          { icon: 'map',   title: 'Ocean Drift',  sub: '60 min · Rest',   badge: ''        },
          { icon: 'zap',   title: 'Night Studio', sub: '25 min · Create', badge: 'Pro'     },
          { icon: 'eye',   title: 'White Noise',  sub: 'Loop · Flow',     badge: ''        },
        ]},
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'metric', label: 'Scene', value: '🌲 Forest Rain', sub: 'Deep Focus phase' },
        { type: 'metric', label: 'Timer', value: '14:32', sub: 'remaining' },
        { type: 'progress', items: [
          { label: 'Session complete', pct: 58 },
        ]},
        { type: 'tags', label: 'Controls', items: ['⏸ Pause', '⟨⟨ Skip', '✕ End'] },
        { type: 'metric-row', items: [
          { label: 'Duration',   value: '25 min' },
          { label: 'Mode',       value: 'Focus'  },
          { label: 'Binaural',   value: 'On'     },
        ]},
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'text', label: 'Period', value: 'Focus Journal · This Week' },
        { type: 'metric-row', items: [
          { label: 'Total Focus', value: '6h 42m' },
          { label: 'Streak',      value: '12 days' },
          { label: 'Goal Hit',    value: '87%'     },
        ]},
        { type: 'progress', items: [
          { label: 'Mon · 1.2h', pct: 34 },
          { label: 'Tue · 2.5h', pct: 71 },
          { label: 'Wed · 1.8h', pct: 51 },
          { label: 'Thu · 2.0h', pct: 57 },
          { label: 'Fri · 3.1h', pct: 89 },
        ]},
        { type: 'list', items: [
          { icon: 'leaf',   title: 'Forest Rain',  sub: '42% of sessions', badge: '●' },
          { icon: 'sun',    title: 'Golden Hour',  sub: '28% of sessions', badge: '●' },
          { icon: 'star',   title: 'Coffee Shop',  sub: '18% of sessions', badge: '●' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Account', value: 'James Alcott', sub: '12-day streak · 47 sessions' },
        { type: 'text', label: 'Upgrade', value: '✦ Unlock all 24 scenes — Forest archives, binaural labs & custom durations.' },
        { type: 'list', items: [
          { icon: 'bell',     title: 'Focus Reminders',   sub: 'Daily at 9:00 AM',          badge: 'On'  },
          { icon: 'play',     title: 'Ambient Sounds',    sub: 'Auto-play on session start', badge: 'On'  },
          { icon: 'eye',      title: 'Appearance',        sub: 'Light theme',                badge: '›'   },
          { icon: 'share',    title: 'iCloud Sync',       sub: 'Last synced 2 min ago',      badge: 'Off' },
          { icon: 'settings', title: 'Account & Privacy', sub: '',                           badge: '›'   },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',    label: 'Home',    icon: 'home'     },
    { id: 'scenes',  label: 'Scenes',  icon: 'layers'   },
    { id: 'session', label: 'Session', icon: 'activity' },
    { id: 'stats',   label: 'Stats',   icon: 'chart'    },
    { id: 'profile', label: 'Profile', icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lume-mock', 'LUME — Interactive Mock');
console.log('Mock live at:', result.url);
