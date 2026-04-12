import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'LUMIO',
  tagline: 'See your work, clearly.',
  archetype: 'freelance-finance-light',

  palette: {
    bg:      '#0F1208',
    surface: '#1A1A0F',
    text:    '#F0EBE3',
    accent:  '#B8621A',
    accent2: '#E8A267',
    muted:   'rgba(240,235,227,0.4)',
  },
  lightPalette: {
    bg:      '#F8F4EE',
    surface: '#FFFFFF',
    text:    '#1E1C18',
    accent:  '#B8621A',
    accent2: '#E8A267',
    muted:   'rgba(30,28,24,0.40)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Earned This Month', value: '$14,280', sub: '↑ 18% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Active Projects', value: '6' },
          { label: 'Hours This Week', value: '28.5h' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Lighthouse Media', sub: 'Web redesign — Phase 2',  badge: '$4,800' },
          { icon: 'check',    title: 'Kern & Co.',        sub: 'Brand identity sprint',   badge: '$2,200' },
          { icon: 'calendar', title: 'Solaris App',        sub: 'Monthly retainer',        badge: '$1,500' },
        ]},
        { type: 'text', label: 'Lumio suggests', value: 'Invoice Lighthouse Media now to hit your April target of $18K.' },
      ],
    },
    {
      id: 'work', label: 'My Work',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total contracted', value: '$20.4K' },
          { label: 'Avg rate', value: '$122/hr' },
        ]},
        { type: 'progress', items: [
          { label: 'Lighthouse Media — Web Design', pct: 68 },
          { label: 'Kern & Co. — Brand Identity',   pct: 100 },
          { label: 'Solaris App — Product Design',  pct: 35 },
          { label: 'Voxel Studio — UX Audit',        pct: 12 },
        ]},
        { type: 'tags', label: 'Status', items: ['Active (4)', 'Complete (1)', 'New (1)'] },
      ],
    },
    {
      id: 'time', label: 'Time Tracking',
      content: [
        { type: 'metric', label: 'Now Tracking', value: '2:34:18', sub: 'Lighthouse Media — wireframes' },
        { type: 'metric-row', items: [
          { label: 'This week', value: '28.5h' },
          { label: 'Target', value: '40h' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Lighthouse Media', sub: 'Wireframe review',  badge: '1h 20m' },
          { icon: 'activity', title: 'Kern & Co.',        sub: 'Final file export', badge: '45m' },
          { icon: 'activity', title: 'Solaris App',        sub: 'User flow mapping', badge: '28m' },
        ]},
        { type: 'text', label: 'AI estimate', value: 'At this pace you will hit 38h by Friday. Log 1.5h more tomorrow to meet your 40h goal.' },
      ],
    },
    {
      id: 'invoice', label: 'Invoice Builder',
      content: [
        { type: 'list', items: [
          { icon: 'list', title: 'Wireframe design — 12hrs @ $95', sub: 'Lighthouse Media', badge: '$1,140' },
          { icon: 'list', title: 'UI design — 20hrs @ $120',       sub: 'Lighthouse Media', badge: '$2,400' },
          { icon: 'list', title: 'Prototype & handoff',             sub: 'Fixed fee',         badge: '$800' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Subtotal', value: '$4,340' },
          { label: 'Tax 15%', value: '$651' },
        ]},
        { type: 'metric', label: 'Invoice Total', value: '$4,991', sub: 'Due Friday 4 April 2025' },
      ],
    },
    {
      id: 'insights', label: 'AI Insights',
      content: [
        { type: 'metric', label: 'Monthly Revenue', value: '$14,280', sub: '↑ 18% vs March ($12,100)' },
        { type: 'progress', items: [
          { label: 'Lighthouse Media', pct: 42 },
          { label: 'Kern & Co.',       pct: 31 },
          { label: 'Solaris App',      pct: 16 },
          { label: 'Other',             pct: 11 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Best Day', value: 'Thu' },
          { label: 'Client Retention', value: '94%' },
        ]},
        { type: 'text', label: 'Lumio forecast', value: 'On track for $18.2K this month. Close Voxel Studio to exceed your $20K goal.' },
      ],
    },
    {
      id: 'onboard', label: 'Get Started',
      content: [
        { type: 'metric', label: 'LUMIO', value: 'See your work, clearly.', sub: 'Freelance financial OS' },
        { type: 'tags', label: 'Included free', items: ['Revenue intelligence', 'Time tracking', 'One-tap invoicing', 'AI insights'] },
        { type: 'text', label: 'Get started', value: 'No credit card required. Cancel anytime. Works with Stripe, PayPal, and bank transfers.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home' },
    { id: 'work',      label: 'Work',     icon: 'layers' },
    { id: 'time',      label: 'Time',     icon: 'activity' },
    { id: 'invoice',   label: 'Invoice',  icon: 'zap' },
    { id: 'insights',  label: 'Insights', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lumio-mock', 'LUMIO — Interactive Mock');
console.log('Mock live at:', result.url);
