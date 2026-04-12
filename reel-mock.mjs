// reel-mock.mjs — REEL interactive Svelte mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'REEL',
  tagline:   'Shot list & film production planner',
  archetype: 'film-production',
  palette: {           // DARK — MICRODOT cinematic near-black
    bg:      '#0D0D0D',
    surface: '#181818',
    text:    '#F0EDE5',
    accent:  '#D4A24F',
    accent2: '#E84545',
    muted:   'rgba(240,237,229,0.4)',
  },
  lightPalette: {
    bg:      '#F5F2EC',
    surface: '#FFFFFF',
    text:    '#1A1710',
    accent:  '#B8872A',
    accent2: '#C43030',
    muted:   'rgba(26,23,16,0.45)',
  },
  screens: [
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'metric', label: 'Desert Run', value: '24%', sub: 'Feature Film · Day 3 of 12' },
        { type: 'metric-row', items: [
          { label: 'Scenes Shot', value: '8' },
          { label: 'Days Left',   value: '9' },
          { label: 'Shots Done',  value: '34' },
        ]},
        { type: 'tags', label: 'Status', items: ['● LIVE', 'EXT/INT', 'Day 3', 'Mojave'] },
        { type: 'list', items: [
          { icon: '◧', title: 'DESERT RUN',    sub: 'Feature · 34 scenes · 24% done',   badge: 'ACTIVE' },
          { icon: '◧', title: 'STILL WATER',   sub: 'Short Film · 12 scenes · Pre-prod', badge: 'PREP'   },
        ]},
        { type: 'text', label: 'Last Activity', value: 'Shot 12C approved · Canyon Floor · 2h ago' },
      ],
    },
    {
      id: 'breakdown', label: 'Breakdown',
      content: [
        { type: 'metric', label: 'Day 3 · Desert Run', value: '6', sub: 'Scenes planned today · Canyon Floor' },
        { type: 'list', items: [
          { icon: '✓',  title: 'SC.11 — Canyon Ridge',   sub: 'EXT · DAY · 6/6 shots · DONE',     badge: 'DONE'   },
          { icon: '●',  title: 'SC.12 — Canyon Floor',   sub: 'EXT · DAY · 3/9 shots · Filming',  badge: 'LIVE'   },
          { icon: '—',  title: 'SC.13 — Canyon Floor',   sub: 'EXT · DUSK · 0/7 shots · Pending', badge: '—'      },
          { icon: '—',  title: 'SC.14 — Cliff Overlook', sub: 'EXT · DUSK · 0/4 shots · Pending', badge: '—'      },
          { icon: '—',  title: 'SC.15 — Hero Vehicle',   sub: 'INT · NIGHT · 0/5 · Pending',      badge: '—'      },
        ]},
        { type: 'progress', items: [
          { label: 'Day 3 Progress', pct: 24 },
          { label: 'Overall Shoot',  pct: 24 },
        ]},
      ],
    },
    {
      id: 'shots', label: 'Shot List',
      content: [
        { type: 'metric', label: 'Scene 12 — Canyon Floor', value: '9', sub: 'Shots planned · EXT · DAY · 3 approved' },
        { type: 'list', items: [
          { icon: '✓', title: 'A  MASTER',    sub: '24mm · STATIC · Wide car entry',          badge: 'PRINT' },
          { icon: '✓', title: 'B  OTS HERO',  sub: '50mm · DOLLY IN · Pursuers behind',       badge: 'PRINT' },
          { icon: '✓', title: 'C  CLOSE UP',  sub: '85mm · STATIC · Hero face reaction',      badge: 'PRINT' },
          { icon: '○', title: 'D  AERIAL',    sub: 'DRONE · FLY DOWN · Canyon scale reveal',  badge: '—'     },
          { icon: '○', title: 'E  POV',       sub: '35mm · HANDHELD · Windshield blur',        badge: '—'     },
          { icon: '○', title: 'F  INSERT',    sub: '100mm · STATIC · GPS screen lost',        badge: '—'     },
        ]},
        { type: 'tags', label: 'Filters', items: ['ALL SHOTS', 'PENDING', 'APPROVED'] },
      ],
    },
    {
      id: 'schedule', label: 'Schedule',
      content: [
        { type: 'metric', label: 'Day 3 · Tuesday', value: '6:30', sub: 'General call · Canyon Floor, Mojave · 84°F' },
        { type: 'metric-row', items: [
          { label: 'Sunrise',  value: '6:21' },
          { label: 'High',     value: '84°F' },
          { label: 'Wind',     value: '8mph' },
        ]},
        { type: 'list', items: [
          { icon: '○',  title: '6:30  Crew Call',       sub: 'All departments',          badge: 'done' },
          { icon: '○',  title: '8:00  Shoot Sc.11',     sub: 'Canyon Ridge · ✓ Wrapped', badge: 'done' },
          { icon: '●',  title: '10:00 Shoot Sc.12A–C',  sub: 'Hero coverage · Active',   badge: 'NOW'  },
          { icon: '—',  title: '12:00 Meal Break',      sub: 'Catering on site',         badge: '—'    },
          { icon: '—',  title: '12:30 Sc.12D–F + 13',  sub: 'Drone + remaining shots',  badge: '—'    },
        ]},
      ],
    },
    {
      id: 'wrap', label: 'Wrap',
      content: [
        { type: 'metric', label: "IT'S A WRAP · Day 3", value: '8/9', sub: 'Shots approved · 12:47 PM · 2 scenes wrapped' },
        { type: 'metric-row', items: [
          { label: 'Scenes',    value: '2' },
          { label: 'Cam Roll',  value: '38m' },
          { label: 'Days Left', value: '9'  },
        ]},
        { type: 'list', items: [
          { icon: '✓', title: 'SC.11 Canyon Ridge',    sub: '6/6 shots · PRINT',     badge: 'PRINT' },
          { icon: '✓', title: 'SC.12 Canyon Floor',    sub: '8/9 shots · PRINT',     badge: 'PRINT' },
          { icon: '→', title: 'SC.13 Hero Vehicle',    sub: '0/5 shots · Moved D4',  badge: 'MOVED' },
        ]},
        { type: 'text', label: 'Notes for Day 4', value: 'Sc.13 moved — golden hour better. Drone op confirmed for Sc.14. Check hero car fuel line.' },
      ],
    },
  ],
  nav: [
    { id: 'projects',  label: 'Projects',  icon: 'grid'     },
    { id: 'breakdown', label: 'Scenes',    icon: 'list'     },
    { id: 'shots',     label: 'Shots',     icon: 'layers'   },
    { id: 'schedule',  label: 'Schedule',  icon: 'calendar' },
    { id: 'wrap',      label: 'Wrap',      icon: 'check'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'reel-mock', 'REEL — Interactive Mock');
console.log('Mock live at:', result.url);
