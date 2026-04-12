// mesa-mock.mjs — Svelte interactive mock for MESA
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MESA',
  tagline:   'Revenue clarity for solopreneur founders',
  archetype: 'finance-founders-dashboard',
  palette: {              // DARK theme (required fallback)
    bg:      '#1A1612',
    surface: '#252119',
    text:    '#F7F4EE',
    accent:  '#3D35F0',
    accent2: '#FF5F38',
    muted:   'rgba(247,244,238,0.45)',
  },
  lightPalette: {         // LIGHT theme — primary for this design
    bg:      '#F7F4EE',
    surface: '#FFFFFF',
    text:    '#1A1612',
    accent:  '#3D35F0',
    accent2: '#FF5F38',
    muted:   'rgba(26,22,18,0.45)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Total Revenue · March 2026', value: '$18,420', sub: '↑ 23% vs February · 12 invoices' },
        { type: 'metric-row', items: [
          { label: 'Outstanding', value: '$4,200' },
          { label: 'Overdue',     value: '$1,150' },
        ]},
        { type: 'tags', label: 'AI Agents', items: ['Invoice Sent', 'Payment Reconciled', 'Follow-up Queued', 'Report Exported'] },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Invoice #INV-052 sent → Bolder Co.',   sub: '2 min ago',  badge: 'Agent' },
          { icon: 'check',    title: '$3,200 reconciled — Nexo Labs',         sub: '18 min ago', badge: 'Paid'  },
          { icon: 'bell',     title: 'Follow-up queued → Aria Inc.',          sub: '1 hr ago',   badge: 'Queue' },
          { icon: 'share',    title: 'Monthly report exported to Drive',      sub: '3 hrs ago',  badge: 'Done'  },
        ]},
      ],
    },
    {
      id: 'clients',
      label: 'Clients',
      content: [
        { type: 'metric', label: 'Active Clients', value: '5', sub: '$26,600 ARR · 3 retainers' },
        { type: 'list', items: [
          { icon: 'star',   title: 'Bolder Co.',   sub: 'Retainer · $4,800/mo · Next: Apr 1',  badge: 'Active'  },
          { icon: 'star',   title: 'Nexo Labs',    sub: 'Project · $12,000 · Next: Apr 15',    badge: 'Active'  },
          { icon: 'alert',  title: 'Aria Inc.',    sub: 'Retainer · $2,400/mo · Next: Apr 1',  badge: 'Pending' },
          { icon: 'alert',  title: 'Forge Studio', sub: 'Project · $6,500 · Overdue Apr 22',   badge: 'Overdue' },
          { icon: 'check',  title: 'Mira Health',  sub: 'Advisory · $900/mo · Next: Apr 1',    badge: 'Active'  },
        ]},
      ],
    },
    {
      id: 'invoice',
      label: 'Invoice',
      content: [
        { type: 'metric', label: 'INV-047 · Bolder Co.', value: '$8,200', sub: 'Due: Apr 1, 2026 · Status: Sent' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Brand Strategy Workshop',    sub: '1× — $2,400', badge: '$2,400' },
          { icon: 'layers', title: 'UX Research & Synthesis',    sub: '2× — $1,600', badge: '$1,600' },
          { icon: 'code',   title: 'Prototype Development',      sub: '3× — $3,000', badge: '$3,000' },
          { icon: 'calendar', title: 'Project Management',       sub: '20hrs — $1,200', badge: '$1,200' },
        ]},
        { type: 'progress', items: [
          { label: 'Invoice created',  pct: 100 },
          { label: 'Sent to client',   pct: 100 },
          { label: 'Viewed',           pct: 100 },
          { label: 'Payment pending',  pct: 60  },
          { label: 'Payment received', pct: 0   },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'March Revenue — Best Month', value: '+23%', sub: '$18,420 vs $14,900 in February' },
        { type: 'progress', items: [
          { label: 'Oct  $9.2K',  pct: 50  },
          { label: 'Nov  $10.8K', pct: 59  },
          { label: 'Dec  $7.4K',  pct: 40  },
          { label: 'Jan  $12.6K', pct: 68  },
          { label: 'Feb  $14.9K', pct: 81  },
          { label: 'Mar  $18.4K', pct: 100 },
        ]},
        { type: 'progress', items: [
          { label: 'Retainer revenue', pct: 61 },
          { label: 'Project revenue',  pct: 37 },
          { label: 'Advisory revenue', pct: 2  },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'March is your best month yet', sub: '23% above February',          badge: '↑23%' },
          { icon: 'eye',   title: 'Retainer stability is high',   sub: '61% of total is recurring',   badge: '61%'  },
          { icon: 'alert', title: 'Forge Studio overdue',         sub: 'Send a reminder now',         badge: 'Act'  },
        ]},
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: 'Jamie Rivera — Pro Plan', value: 'Settings', sub: 'jamie@mesafounder.io' },
        { type: 'tags', label: 'Integrations', items: ['Stripe ✓', 'Notion ✓', 'Gmail ✓', 'QuickBooks', 'Calendly'] },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Autonomous Mode',     sub: 'Agents run invoicing & follow-ups', badge: 'ON'  },
          { icon: 'bell',     title: 'Notification Digest', sub: 'Daily summary at 8:00 AM',         badge: 'OFF' },
          { icon: 'settings', title: 'Billing & Plan',      sub: 'Pro Plan · $49/mo',                badge: '›'   },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Home',     icon: 'home'     },
    { id: 'clients',   label: 'Clients',  icon: 'user'     },
    { id: 'invoice',   label: 'Invoice',  icon: 'plus'     },
    { id: 'insights',  label: 'Insights', icon: 'chart'    },
    { id: 'settings',  label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mesa-mock', 'MESA — Interactive Mock');
console.log('Mock live at:', result.url);
