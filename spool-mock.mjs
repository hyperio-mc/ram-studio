import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPOOL',
  tagline:   'Project thread manager for creative studios',
  archetype: 'productivity',
  palette: {           // Dark theme fallback
    bg:      '#1A1614',
    surface: '#242018',
    text:    '#F4F1EC',
    accent:  '#C84A00',
    accent2: '#2952E3',
    muted:   'rgba(244,241,236,0.42)',
  },
  lightPalette: {      // LIGHT theme (primary — this design is light)
    bg:      '#F4F1EC',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#C84A00',
    accent2: '#2952E3',
    muted:   'rgba(26,22,20,0.45)',
  },
  screens: [
    {
      id: 'threads', label: 'Threads',
      content: [
        { type: 'metric', label: 'Active Projects', value: '9', sub: 'Studio workload -- March 2026' },
        { type: 'metric-row', items: [
          { label: 'Active',    value: '9'  },
          { label: 'Due Soon',  value: '3'  },
          { label: 'All Time',  value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'eye',    title: 'Meridian Rebrand',   sub: 'Meridian Finance -- In Review',  badge: '85%' },
          { icon: 'activity', title: 'Harvest Campaign', sub: 'Harvest Foods -- In Progress',   badge: '62%' },
          { icon: 'alert',  title: 'Verso App UI',       sub: 'Verso Tech -- Blocked',          badge: '40%' },
          { icon: 'check',  title: 'Arcanum Identity',   sub: 'Arcanum Studio -- On Track',     badge: '28%' },
        ]},
        { type: 'tags', label: 'Filter', items: ['Active', 'Drafts', 'Delivered', 'Archived'] },
      ],
    },
    {
      id: 'brief', label: 'Brief',
      content: [
        { type: 'metric', label: 'Harvest Campaign -- Progress', value: '62%', sub: 'Brand Campaign 2025 -- Due Apr 15' },
        { type: 'progress', items: [
          { label: 'Strategy & Research',   pct: 100 },
          { label: 'Creative Direction',    pct: 100 },
          { label: 'Campaign Concepting',   pct: 40  },
          { label: 'Production',            pct: 0   },
          { label: 'Final Delivery',        pct: 0   },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'Hero visuals x12',    sub: 'Digital -- Delivered',  badge: 'Done' },
          { icon: 'check',  title: 'OOH artwork x4',      sub: 'Print -- Delivered',    badge: 'Done' },
          { icon: 'activity',title: 'Social templates x24',sub: 'Social -- In progress', badge: 'Active' },
          { icon: 'layers', title: 'Motion kit',           sub: 'Video -- Pending',      badge: 'Pending' },
        ]},
      ],
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'metric', label: 'This Week', value: '28h 40m', sub: 'Tracked across 6 projects -- Up 14% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Mon', value: '6.5h' },
          { label: 'Tue', value: '5.0h' },
          { label: 'Wed', value: '8.0h' },
          { label: 'Thu', value: '4.5h' },
          { label: 'Fri', value: '4.7h' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Maya Chen',      sub: 'Creative Dir -- 12h 20m',  badge: '100%' },
          { icon: 'user', title: 'Tom Vasquez',    sub: 'Designer -- 9h 40m',       badge: '78%'  },
          { icon: 'user', title: 'Yuki Nakamura',  sub: 'Copywriter -- 4h 30m',     badge: '37%'  },
          { icon: 'user', title: 'Lee Santos',     sub: 'Producer -- 2h 10m',       badge: '18%'  },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'On-Time Delivery', value: '94%', sub: 'This quarter -- AI-generated insight' },
        { type: 'metric-row', items: [
          { label: 'On Time',     value: '94%' },
          { label: 'Bottleneck',  value: '31%' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'Review is your bottleneck',      sub: '4.2 days avg in review -- 2x longer than concepting', badge: 'Insight' },
          { icon: 'calendar', title: 'Tuesday AMs are slowest',        sub: 'Team velocity drops 38% -- consider shifting syncs',  badge: 'Pattern' },
          { icon: 'star',     title: 'Big clients, fastest delivery',  sub: 'Meridian and Harvest close 22% faster -- clear briefs', badge: 'Win'    },
        ]},
        { type: 'text', label: 'AI Note', value: 'Insights updated 2 hours ago. Based on 47 completed projects and 6 active threads.' },
      ],
    },
    {
      id: 'studio', label: 'Studio',
      content: [
        { type: 'metric', label: 'Studio -- Maya Chen', value: 'Admin', sub: 'Creative Director -- Spool Studio' },
        { type: 'metric-row', items: [
          { label: 'Projects',  value: '9'  },
          { label: 'Members',   value: '4'  },
          { label: 'Delivered', value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'grid',     title: 'Figma',    sub: 'Design handoff and asset sync',  badge: 'Connected' },
          { icon: 'message',  title: 'Slack',    sub: 'Notifications and updates',       badge: 'Connected' },
          { icon: 'calendar', title: 'Harvest',  sub: 'Time tracking import',            badge: 'Connected' },
          { icon: 'code',     title: 'Linear',   sub: 'Dev task linking',                badge: 'Connect'   },
          { icon: 'layers',   title: 'Notion',   sub: 'Brief templates and docs',        badge: 'Connect'   },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'threads',  label: 'Threads',  icon: 'list'     },
    { id: 'brief',    label: 'Brief',    icon: 'layers'   },
    { id: 'activity', label: 'Activity', icon: 'calendar' },
    { id: 'insights', label: 'Insights', icon: 'zap'      },
    { id: 'studio',   label: 'Studio',   icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'spool-mock', 'SPOOL -- Interactive Mock');
console.log('Mock live at:', result.url);
