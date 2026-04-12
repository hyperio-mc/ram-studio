import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CREST',
  tagline:   'Freelance cashflow, well-edited',
  archetype: 'finance-cashflow-freelancer',

  palette: {
    bg:      '#1A1A1A',
    surface: '#242424',
    text:    '#F5F2EC',
    accent:  '#BAFF4F',
    accent2: '#1CA750',
    muted:   'rgba(245,242,236,0.4)',
  },
  lightPalette: {
    bg:      '#F5F2EC',
    surface: '#FFFFFF',
    text:    '#111111',
    accent:  '#BAFF4F',
    accent2: '#1CA750',
    muted:   'rgba(17,17,17,0.42)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'NET FLOW — MARCH 2026', value: '+$12,847', sub: 'income after all expenses this month' },
        { type: 'metric-row', items: [
          { label: 'Inflow', value: '$24,130' },
          { label: 'Outflow', value: '$11,283' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Meridian Studio', sub: 'Mar 28 · Design', badge: '+$4,200' },
          { icon: 'alert', title: 'Figma Pro',       sub: 'Mar 27 · Tools',  badge: '−$45'    },
          { icon: 'chart', title: 'Arc Agency',      sub: 'Mar 25 · UI/UX',  badge: '+$3,800' },
          { icon: 'alert', title: 'AWS',             sub: 'Mar 24 · Infra',  badge: '−$112'   },
        ]},
        { type: 'progress', items: [{ label: 'Tax Reserve · $6,200 of $8,000', pct: 77 }] },
      ],
    },
    {
      id: 'inflow', label: 'In',
      content: [
        { type: 'metric', label: 'INFLOW — MARCH 2026', value: '$24,130', sub: '4 active clients · $2,870 more expected' },
        { type: 'progress', items: [
          { label: 'Meridian Studio · $8,000',  pct: 83 },
          { label: 'Arc Agency · $7,600',        pct: 79 },
          { label: 'Ghost Protocol · $5,200',    pct: 54 },
          { label: 'Solace Group · $3,330',      pct: 35 },
        ]},
        { type: 'tags', label: 'CATEGORIES', items: ['Branding', 'UI/UX', 'Motion', 'Strategy'] },
      ],
    },
    {
      id: 'outflow', label: 'Out',
      content: [
        { type: 'metric', label: 'OUTFLOW — MARCH 2026', value: '$11,283', sub: '5 categories · $890 due in 7 days' },
        { type: 'progress', items: [
          { label: 'Software · $4,210',   pct: 73 },
          { label: 'Marketing · $2,800',  pct: 49 },
          { label: 'Freelance · $2,100',  pct: 37 },
          { label: 'Finance · $1,630',    pct: 28 },
          { label: 'Other · $543',        pct:  9 },
        ]},
      ],
    },
    {
      id: 'invoices', label: 'Invoice',
      content: [
        { type: 'metric', label: 'OUTSTANDING', value: '$10,200', sub: '2 open invoices' },
        { type: 'list', items: [
          { icon: 'share',  title: 'Meridian Studio', sub: 'Due Apr 15 · #INV-041', badge: 'SENT'    },
          { icon: 'eye',    title: 'Arc Agency',      sub: 'Due Apr 10 · #INV-040', badge: 'VIEWED'  },
          { icon: 'check',  title: 'Ghost Protocol',  sub: 'Mar 30 · #INV-039',     badge: 'PAID'    },
          { icon: 'alert',  title: 'Solace Group',    sub: 'Mar 20 · #INV-038',     badge: 'OVERDUE' },
        ]},
        { type: 'tags', label: 'QUICK ACTIONS', items: ['+ New Invoice', 'Send Reminder', 'Export PDF'] },
      ],
    },
    {
      id: 'plan', label: 'Plan',
      content: [
        { type: 'metric', label: '90-DAY VIEW', value: '$39,500', sub: 'projected Q2 · ↑ 38% vs last quarter' },
        { type: 'metric-row', items: [
          { label: 'Apr', value: '$11.2k' },
          { label: 'May', value: '$13.5k' },
          { label: 'Jun', value: '$14.8k' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Arc Agency payment',     sub: 'Apr 10 · $3,800 expected',  badge: '↑' },
          { icon: 'calendar', title: 'Meridian invoice due',   sub: 'Apr 15 · $6,400 outstanding',badge: '!' },
          { icon: 'calendar', title: 'Tax reserve deadline',   sub: 'Apr 30 · $8,000 goal',       badge: '⚠' },
          { icon: 'calendar', title: 'Solace retainer starts', sub: 'May 01 · $2,500/mo',         badge: '↑' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'home',     label: 'Home',    icon: 'home'     },
    { id: 'inflow',   label: 'In',      icon: 'chart'    },
    { id: 'outflow',  label: 'Out',     icon: 'activity' },
    { id: 'invoices', label: 'Invoice', icon: 'list'     },
    { id: 'plan',     label: 'Plan',    icon: 'calendar' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'crest-mock', 'CREST — Interactive Mock');
console.log('Mock live at:', result.url);
