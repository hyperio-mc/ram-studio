import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TRAIL',
  tagline:   'Movement is memory. Log every route.',
  archetype: 'movement-journal-light',

  palette: {
    bg:      '#F0ECE5',
    surface: '#FAF9F5',
    text:    '#1A1914',
    accent:  '#C6FF52',
    accent2: '#FF5527',
    muted:   'rgba(26,25,20,0.50)',
  },
  lightPalette: {
    bg:      '#F0ECE5',
    surface: '#FAF9F5',
    text:    '#1A1914',
    accent:  '#C6FF52',
    accent2: '#FF5527',
    muted:   'rgba(26,25,20,0.50)',
  },

  nav: [
    { label: 'Now',    icon: '◉' },
    { label: 'Map',    icon: '◎' },
    { label: 'Log',    icon: '≡' },
    { label: 'Places', icon: '◈' },
    { label: 'Week',   icon: '◑' },
  ],

  screens: [
    {
      id: 'now',
      name: 'Now',
      description: 'Active route — live stats, trail map, heart rate zone',
      components: [
        { type: 'badge', text: '● LIVE', color: 'accent', style: 'mono-caps' },
        { type: 'hero-text', text: 'Morning Circuit', subtext: 'Riverside Loop · San Rafael Park', size: 'lg' },
        { type: 'stat-grid', cols: 3, items: [
          { value: '4.7',   label: 'km',      color: 'default' },
          { value: '5:12',  label: '/ km',    color: 'default' },
          { value: '28:44', label: 'elapsed', color: 'accent'  },
        ]},
        { type: 'map-preview', label: 'Route', trailColor: 'accent', dotColor: 'accent2' },
        { type: 'progress-bar', value: 59, label: '4.7 / 8.0 km', color: 'accent' },
        { type: 'info-row', icon: '♥', text: '148 bpm · Cardio Zone 3', tagColor: 'accent2' },
        { type: 'action-row', actions: [
          { label: '⏸  Pause',    style: 'ghost'   },
          { label: 'Finish ✓',    style: 'primary' },
        ]},
      ],
    },
    {
      id: 'map',
      name: 'Map',
      description: 'Spatial trail view — topographic grid, lime trail, GPS coordinates',
      components: [
        { type: 'header', title: 'Map', subtitle: 'Riverside Loop', meta: '8.0 km', metaColor: 'default' },
        { type: 'map-full', label: 'Topo Grid', trailColor: 'accent', h: 320 },
        { type: 'stat-row', items: [
          { value: '8.0 km', label: 'Total'     },
          { value: '+142 m', label: 'Elevation' },
          { value: '52 min', label: 'Est. Time' },
          { value: '3.2',    label: 'Difficulty'},
        ]},
      ],
    },
    {
      id: 'log',
      name: 'Log',
      description: 'Movement journal — routes as chapters with mono stats',
      components: [
        { type: 'header', title: 'Log', subtitle: 'Your movement journal' },
        { type: 'filter-pills', items: ['All', 'Run', 'Walk', 'Ride'], active: 0 },
        { type: 'log-list', items: [
          { date: 'Today',     label: 'Morning Circuit',   type: 'RUN',  color: 'accent',  dur: '4.7 km · 28:44', sub: 'Riverside Loop'      },
          { date: 'Yesterday', label: 'Evening Walk',      type: 'WALK', color: 'default', dur: '3.2 km · 29:31', sub: 'Marina Promenade'    },
          { date: 'Mon',       label: 'Long Run',          type: 'RUN',  color: 'accent2', dur: '12.4 km · 1:10', sub: 'Headlands Trail'     },
          { date: 'Mon',       label: 'Recovery Walk',     type: 'WALK', color: 'default', dur: '2.1 km · 21:04', sub: 'Neighborhood Circuit'},
          { date: 'Sun',       label: 'Weekend Ride',      type: 'RIDE', color: 'muted',   dur: '22.8 km · 1:15', sub: 'Bay Trail North'     },
        ]},
      ],
    },
    {
      id: 'places',
      name: 'Places',
      description: 'Saved waypoints — GPS coordinates, visit counts, type badges',
      components: [
        { type: 'header', title: 'Places', subtitle: 'Favourite waypoints' },
        { type: 'place-list', items: [
          { name: 'Riverside Start',     coord: '37.9749° N · 122.5186° W', visits: 24, badge: 'FAV',  color: 'accent'  },
          { name: 'Headlands Overlook',  coord: '37.8330° N · 122.4832° W', visits: 11, badge: 'VIEW', color: 'accent2' },
          { name: 'Bike Trail Junction', coord: '37.8018° N · 122.4472° W', visits: 8,  badge: 'LINK', color: 'muted'   },
          { name: 'Marina Bench',        coord: '37.8064° N · 122.4394° W', visits: 6,  badge: null,   color: 'default' },
          { name: 'Summit Rest Point',   coord: '37.9221° N · 122.5517° W', visits: 3,  badge: null,   color: 'default' },
        ]},
      ],
    },
    {
      id: 'week',
      name: 'Week',
      description: 'Weekly summary — 47.2 km editorial hero, day bars, type breakdown',
      components: [
        { type: 'header', title: 'This Week', subtitle: 'Mar 25 – Mar 31' },
        { type: 'stat-hero', value: '47.2', label: 'km this week', color: 'accent', font: 'mono', size: 'jumbo' },
        { type: 'bar-chart', days: [
          { label: 'M', value: 4.2  },
          { label: 'T', value: 7.8  },
          { label: 'W', value: 0    },
          { label: 'T', value: 12.4 },
          { label: 'F', value: 5.5  },
          { label: 'S', value: 14.8, active: true },
          { label: 'S', value: 2.5  },
        ]},
        { type: 'breakdown-list', items: [
          { label: 'Running', color: 'accent',  pct: 67, hours: '31.5 km' },
          { label: 'Walking', color: 'default', pct: 17, hours: '8.2 km'  },
          { label: 'Cycling', color: 'accent2', pct: 16, hours: '7.5 km'  },
        ]},
        { type: 'streak-banner', value: '🔥 8-day streak', sub: 'Keep moving tomorrow!', badge: 'PB: 52.1 km', color: 'ink' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'trail-mock', 'TRAIL — Interactive Mock');
console.log('Mock live at:', result.url);
