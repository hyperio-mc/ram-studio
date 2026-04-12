import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Cashline',
  tagline:   'Cash flow intelligence for consultants',
  archetype: 'finance-intelligence',

  // DARK palette (required)
  palette: {
    bg:      '#0F1117',
    surface: '#181B23',
    text:    '#E8E6E0',
    accent:  '#2563EB',
    accent2: '#059669',
    muted:   'rgba(232,230,224,0.4)',
  },

  // LIGHT palette (primary — warm editorial)
  lightPalette: {
    bg:      '#F5F3EE',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#2563EB',
    accent2: '#059669',
    muted:   'rgba(26,23,20,0.45)',
  },

  screens: [
    {
      id: 'pulse',
      label: 'Pulse',
      content: [
        { type: 'metric', label: 'Net Position · March 2026', value: '$48,320', sub: '+$6,140 vs last month ↑' },
        {
          type: 'metric-row',
          items: [
            { label: 'Runway',      value: '94d' },
            { label: 'Outstanding', value: '$12.5K' },
            { label: 'Month In',    value: '$19.2K' },
          ]
        },
        { type: 'text', label: '⚡ AI Signal', value: '3 invoices past 14 days — nudge now to avoid 30-day mark' },
        {
          type: 'list',
          items: [
            { icon: 'check', title: 'Stripe payout · Acme Corp Q1',    sub: 'Today',     badge: '+$8,400' },
            { icon: 'alert', title: 'AWS · Cloud infrastructure',       sub: 'Today',     badge: '-$312' },
            { icon: 'star',  title: 'Invoice #INV-047 sent · Palta',    sub: 'Yesterday', badge: '$4,500' },
            { icon: 'check', title: 'Stripe payout · Reflex Studio',    sub: 'Mar 22',    badge: '+$6,300' },
          ]
        },
      ],
    },
    {
      id: 'cashflow',
      label: 'Cashflow',
      content: [
        { type: 'metric', label: 'End of Month Forecast', value: '$8,916', sub: 'Based on current projects & recurring costs' },
        {
          type: 'progress',
          items: [
            { label: 'Client Revenue',    pct: 100 },
            { label: 'Recurring Costs',   pct: 25 },
            { label: 'Tools & Software',  pct: 6 },
            { label: 'Tax Reserve (22%)', pct: 22 },
          ]
        },
        {
          type: 'metric-row',
          items: [
            { label: 'Actual',    value: '$48.3K' },
            { label: 'Projected', value: '$49.8K' },
            { label: 'Delta',     value: '-$1.5K' },
          ]
        },
        { type: 'text', label: 'Period', value: '30D view · Mar 1 – Mar 26, 2026' },
      ],
    },
    {
      id: 'signals',
      label: 'Signals',
      content: [
        { type: 'text', label: 'AI Signals', value: 'Patterns detected by your financial agent · Updated 2m ago' },
        {
          type: 'list',
          items: [
            { icon: 'alert', title: 'Invoice cluster aging',      sub: '$12,500 outstanding · 3 invoices at 14+ days', badge: 'High' },
            { icon: 'chart', title: 'Q1 revenue ahead of target', sub: '94% of Q1 goal with 6 days remaining',         badge: 'Med' },
            { icon: 'eye',   title: 'Tool spend +34% MoM',        sub: 'Rose from $924 → $1,240 · Cursor, Raycast',   badge: 'Med' },
            { icon: 'check', title: 'Tax estimate covered',       sub: 'Q1 est. $4,224 due Apr 15 · Reserve: $4,800', badge: 'Low' },
          ]
        },
        { type: 'text', label: 'How Signals Work', value: 'Your financial agent monitors transactions, invoice status, and project data continuously. Signals are ranked by urgency and financial impact.' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        {
          type: 'metric-row',
          items: [
            { label: 'Active', value: '4' },
            { label: 'Billed', value: '$19.2K' },
            { label: 'Rate',   value: '$180/hr' },
          ]
        },
        {
          type: 'list',
          items: [
            { icon: 'check',    title: 'Acme Corp · Design system',       sub: '48h · $8,640',  badge: 'Active' },
            { icon: 'star',     title: 'Palta · iOS onboarding',          sub: '25h · $4,500',  badge: 'Inv' },
            { icon: 'check',    title: 'Reflex Studio · Brand & web',      sub: '35h · $6,300',  badge: 'Active' },
            { icon: 'calendar', title: 'Merkle · Data viz consultation',   sub: 'Scoping',       badge: '—' },
          ]
        },
        {
          type: 'progress',
          items: [
            { label: 'Mon', pct: 75 },
            { label: 'Tue', pct: 94 },
            { label: 'Wed', pct: 63 },
            { label: 'Thu', pct: 100 },
            { label: 'Fri', pct: 50 },
          ]
        },
      ],
    },
    {
      id: 'invoice',
      label: 'Invoice',
      content: [
        { type: 'metric', label: 'New Invoice · INV-048', value: '$2,880', sub: 'Draft · Merkle Inc.' },
        {
          type: 'list',
          items: [
            { icon: 'list', title: 'UX Research & Analysis', sub: '12h × $180/hr', badge: '$2,160' },
            { icon: 'list', title: 'Workshop facilitation',  sub: '4h × $180/hr',  badge: '$720' },
          ]
        },
        { type: 'tags', label: 'Payment Terms', items: ['Immediate', 'Net 7', 'Net 14 ✓', 'Net 30'] },
        { type: 'text', label: '⚡ Agent Suggestion', value: 'Based on Merkle\'s history, Net 14 converts — they\'ve paid on time 3 of 3 past invoices.' },
      ],
    },
  ],

  nav: [
    { id: 'pulse',    label: 'Pulse',    icon: 'activity' },
    { id: 'cashflow', label: 'Cashflow', icon: 'chart' },
    { id: 'signals',  label: 'Signals',  icon: 'zap' },
    { id: 'projects', label: 'Projects', icon: 'layers' },
    { id: 'invoice',  label: 'Invoice',  icon: 'share' },
  ],
};

console.log('🔨 Building Svelte mock...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline
});

console.log('📤 Publishing mock...');
const result = await publishMock(html, `${design.archetype.toLowerCase().replace(/[^a-z0-9]/g,'-')}-mock`, `${design.appName} — Interactive Mock`);
console.log('✓ Mock live at:', result.url);

// Also publish under the cashline-mock slug
const result2 = await publishMock(html, 'cashline-mock', `${design.appName} — Interactive Mock`);
console.log('✓ Also at:', result2.url);

fs.writeFileSync('/workspace/group/design-studio/cashline-mock.html', html);
console.log('✓ cashline-mock.html saved locally');
