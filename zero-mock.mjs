import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ZERO',
  tagline:   'Autonomous drone fleet intelligence',
  archetype: 'productivity',
  palette: {
    bg:      '#080810',
    surface: '#0F0F1C',
    text:    '#C2C4D8',
    accent:  '#00FFAA',
    accent2: '#FF3158',
    muted:   'rgba(194,196,216,0.38)',
  },
  screens: [
    {
      id: 'ops', label: 'Mission Control',
      content: [
        { type: 'metric', label: 'Active Drones', value: '12', sub: 'Airborne fleet · 21:47 UTC' },
        { type: 'metric-row', items: [
          { label: 'Airborne', value: '8' },
          { label: 'Standby',  value: '3' },
          { label: 'RTB',      value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'MSN-0447 — Perimeter Scan',  sub: 'Zone 7 · ZR-001 · Airborne',  badge: '● Active'   },
          { icon: 'activity', title: 'MSN-0448 — Cargo Delivery',  sub: 'Zone 3 · ZR-002 · Airborne',  badge: '● Active'   },
          { icon: 'alert',    title: 'MSN-0441 — Intercept Ops',   sub: 'Zone 11 · ZR-003 · Critical', badge: '🔴 Critical' },
          { icon: 'alert',    title: 'MSN-0439 — Recon Sweep',     sub: 'Zone 5 · ZR-004 · Warning',   badge: '⚠ Warning'  },
        ]},
        { type: 'metric-row', items: [
          { label: 'Flight Hrs',  value: '2,847' },
          { label: 'Today',       value: '7/12'  },
        ]},
      ],
    },
    {
      id: 'fleet', label: 'Fleet Status',
      content: [
        { type: 'metric', label: 'Fleet Health', value: '91%', sub: '11 of 12 units nominal' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'ZR-001 ZERO-ONE',   sub: '50.4501°N 30.5234°E · Alt 154m', badge: '78% ●' },
          { icon: 'zap',    title: 'ZR-002 ZERO-TWO',   sub: '50.4523°N 30.5267°E · Alt 171m', badge: '62% ●' },
          { icon: 'alert',  title: 'ZR-003 ZERO-THREE', sub: '50.4488°N 30.5198°E · Alt 137m', badge: '🔴 18%' },
          { icon: 'check',  title: 'ZR-004 ZERO-FOUR',  sub: 'Base · Standby · Charged',        badge: '94% ○' },
          { icon: 'activity',title:'ZR-005 ZERO-FIVE',  sub: 'Returning · ETA 8:22',            badge: '⚠ 24%' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All Units', 'Airborne', 'Critical', 'Standby'] },
      ],
    },
    {
      id: 'mission', label: 'Active Mission',
      content: [
        { type: 'metric', label: 'MSN-0441 Intercept Ops', value: '40%', sub: 'Zone 11 · T+00:12:34 elapsed' },
        { type: 'metric-row', items: [
          { label: 'Altitude',  value: '137m'   },
          { label: 'Velocity',  value: '42 m/s' },
          { label: 'ETA',       value: '08:26'  },
        ]},
        { type: 'progress', items: [
          { label: 'WP-01 Launch Pad Alpha',  pct: 100 },
          { label: 'WP-02 Waypoint North',    pct: 100 },
          { label: 'WP-03 Target Zone 11',    pct: 40  },
          { label: 'WP-04 Holding Pattern',   pct: 0   },
          { label: 'WP-05 Return to Base',    pct: 0   },
        ]},
        { type: 'text', label: 'Status', value: 'ZR-003 approaching target zone. Hostile UAV lock in progress. Intercept authorized by operator K. Zhukova.' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '2', sub: 'Critical threats require attention' },
        { type: 'list', items: [
          { icon: 'alert', title: 'INTERCEPT — Zone 11',   sub: 'ALT-009 · 21:35 · Hostile UAV detected',        badge: '🔴 CRITICAL' },
          { icon: 'alert', title: 'LOW BATTERY — ZR-003',  sub: 'ALT-008 · 21:41 · 18% power, RTB recommended',  badge: '🔴 HIGH'     },
          { icon: 'bell',  title: 'RTB ALERT — ZR-005',    sub: 'ALT-007 · 21:42 · 24% battery, ETA 8:22',       badge: '⚠ MEDIUM'    },
          { icon: 'bell',  title: 'SIGNAL LOSS — ZR-002',  sub: 'ALT-006 · 21:44 · 75% signal in Zone 7',        badge: '⚠ MEDIUM'    },
          { icon: 'check', title: 'MISSION END — MSN-0440',sub: 'ALT-005 · 21:22 · Completed, ZR-006 landed',    badge: '✓ INFO'      },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Critical', 'High', 'Medium', 'Info'] },
      ],
    },
    {
      id: 'operator', label: 'Operator',
      content: [
        { type: 'metric', label: 'K. Zhukova — Lead Operator', value: 'α', sub: 'Clearance: ALPHA · Squadron 7 · Online' },
        { type: 'metric-row', items: [
          { label: 'Missions',   value: '312'   },
          { label: 'Flt Hours',  value: '847'   },
          { label: 'Success',    value: '99.4%' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'MSN-0441 Intercept · Zone 11', sub: 'Active now',         badge: '🔴 Active'   },
          { icon: 'activity', title: 'MSN-0439 Recon · Zone 5',      sub: '3 hours ago',        badge: '⚠ Warning'  },
          { icon: 'check',    title: 'MSN-0434 Perimeter · Zone 2',  sub: 'Yesterday · 47min',  badge: '✓ Complete' },
          { icon: 'check',    title: 'MSN-0428 Delivery · Zone 3',   sub: '2 days ago · 31min', badge: '✓ Complete' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Intercepts', value: '28' },
          { label: 'This Month', value: '14' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'ops',      label: 'OPS',      icon: 'grid'     },
    { id: 'fleet',    label: 'Fleet',    icon: 'layers'   },
    { id: 'mission',  label: 'Mission',  icon: 'map'      },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell'     },
    { id: 'operator', label: 'Operator', icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock for ZERO...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'zero-mock', 'ZERO — Drone Fleet Intelligence · Interactive Mock');
console.log('Mock live at:', result.url);
