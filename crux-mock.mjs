// crux-mock.mjs — Svelte interactive mock for CRUX
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CRUX',
  tagline:   'Your agents never sleep.',
  archetype: 'agentic-ops',

  palette: {           // DARK theme
    bg:      '#0D0D11',
    surface: '#16161D',
    text:    '#EBEBEB',
    accent:  '#C6FF45',
    accent2: '#A259F7',
    muted:   'rgba(235,235,235,0.38)',
  },

  lightPalette: {      // LIGHT theme
    bg:      '#F4F4F0',
    surface: '#FFFFFF',
    text:    '#111118',
    accent:  '#5A9900',
    accent2: '#7B35D4',
    muted:   'rgba(17,17,24,0.42)',
  },

  screens: [
    {
      id: 'fleet', label: 'Fleet',
      content: [
        { type: 'metric', label: 'Tasks today', value: '2,847', sub: '4 agents · 0 errors' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Finance Agent',  sub: 'Running · 312 tasks',   badge: '82%' },
          { icon: 'user',     title: 'Outreach Agent', sub: 'Thinking · 88 tasks',   badge: '65%' },
          { icon: 'eye',      title: 'Intel Agent',    sub: 'Running · 44 tasks',    badge: '91%' },
          { icon: 'layers',   title: 'Content Agent',  sub: 'Idle · 17 tasks',       badge: '28%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Running', value: '3' },
          { label: 'Thinking', value: '1' },
          { label: 'Errors', value: '0' },
        ]},
      ],
    },
    {
      id: 'finance', label: 'Finance',
      content: [
        { type: 'metric', label: 'Net Profit · Apr', value: '$7,340', sub: '51.4% margin · +12% MoM' },
        { type: 'metric-row', items: [
          { label: 'Revenue',  value: '$14.3K' },
          { label: 'Expenses', value: '$6.9K'  },
          { label: 'Margin',   value: '51%'    },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Stripe payout',       sub: 'Income · Apr 3',   badge: '+$4.2K' },
          { icon: 'alert',    title: 'AWS Infrastructure',  sub: 'Ops · Apr 3',      badge: '-$892'  },
          { icon: 'star',     title: 'Figma subscription',  sub: 'Tools · Apr 2',    badge: '-$45'   },
          { icon: 'check',    title: 'Freelance payment',   sub: 'Income · Apr 2',   badge: '+$1.8K' },
          { icon: 'settings', title: 'OpenAI API',          sub: 'Tools · Apr 1',    badge: '-$180'  },
        ]},
      ],
    },
    {
      id: 'outreach', label: 'Outreach',
      content: [
        { type: 'metric', label: 'Pipeline active', value: '28', sub: '14 sent · 6 replies · 2 closed' },
        { type: 'list', items: [
          { icon: 'user',    title: 'Priya Mehta',    sub: 'Sidecar Labs · Replied 1h',   badge: 'Proposal' },
          { icon: 'user',    title: 'David Okafor',   sub: 'Bloom Systems · Opened',       badge: 'Follow-up' },
          { icon: 'user',    title: 'Sarah Kimura',   sub: 'Alto Design · Sent 3h',        badge: 'Intro' },
          { icon: 'user',    title: 'Tom Vries',      sub: 'Verdant AI · Thinking…',       badge: 'Discovery' },
          { icon: 'user',    title: 'Ana Colmenares', sub: 'Strata · Replied 2d',          badge: 'Warm' },
        ]},
        { type: 'tags', label: 'Stage', items: ['All', 'Proposal', 'Follow-up', 'Warm'] },
      ],
    },
    {
      id: 'intel', label: 'Intel',
      content: [
        { type: 'text', label: 'Key Signal · Apr 4', value: '"Two new competitors entered your niche this week — pricing 15% lower. Suggest reviewing Tier 2 pricing."' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'Relace launches free tier',          sub: 'Competitor · 6h ago',    badge: 'High' },
          { icon: 'activity', title: 'Agentic dashboards +240% search',   sub: 'Trend · 12h ago',        badge: 'Opp' },
          { icon: 'eye',      title: 'YC S26: 31 companies in your space',sub: 'Market · 1d ago',        badge: 'Watch' },
          { icon: 'message',  title: '"Best agent OS?" trending thread',  sub: 'Mention · 2h ago',       badge: 'Opp' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Monitored', value: '44' },
          { label: 'New', value: '8' },
          { label: 'High', value: '2' },
        ]},
      ],
    },
    {
      id: 'config', label: 'Config',
      content: [
        { type: 'metric', label: 'Fleet Uptime', value: '99.7%', sub: 'Last 30 days · 4 agents · 0 incidents' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Finance Agent',  sub: 'Read bank · Categorise · Alert', badge: 'ON'  },
          { icon: 'user',     title: 'Outreach Agent', sub: 'Draft emails · Track opens',     badge: 'OFF' },
          { icon: 'eye',      title: 'Intel Agent',    sub: 'Web scrape · Monitor RSS',       badge: 'ON'  },
          { icon: 'layers',   title: 'Content Agent',  sub: 'Draft posts · Schedule',         badge: 'AUTO'},
        ]},
        { type: 'tags', label: 'Escalation', items: ['Txn >$500', 'VIP email', 'Competitor alert'] },
      ],
    },
  ],

  nav: [
    { id: 'fleet',    label: 'Fleet',    icon: 'grid'     },
    { id: 'finance',  label: 'Finance',  icon: 'chart'    },
    { id: 'outreach', label: 'Outreach', icon: 'user'     },
    { id: 'intel',    label: 'Intel',    icon: 'eye'      },
    { id: 'config',   label: 'Config',   icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'crux-mock', 'CRUX — Interactive Mock');
console.log('Mock live at:', result.url);
