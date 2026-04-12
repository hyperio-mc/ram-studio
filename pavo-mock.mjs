import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PAVO',
  tagline:   'Spend intelligence for modern teams',
  archetype: 'fintech-spend-intelligence',
  palette: {           // DARK theme (primary)
    bg:      '#0A0D14',
    surface: '#131720',
    text:    '#EBF0FA',
    accent:  '#4F8FFF',
    accent2: '#2DF5A0',
    muted:   'rgba(139,150,176,0.45)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F4F6FB',
    surface: '#FFFFFF',
    text:    '#0F1420',
    accent:  '#2B6FEF',
    accent2: '#10B97A',
    muted:   'rgba(15,20,32,0.42)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Total Spend — March 2026', value: '$48,320', sub: '80% of $60,000 budget · 12 days left' },
        { type: 'metric-row', items: [
          { label: 'Transactions', value: '284'  },
          { label: 'Active Cards', value: '12'   },
          { label: 'AI Signals',   value: '3'    },
        ] },
        { type: 'progress', items: [
          { label: 'SaaS Tools (29%)',   pct: 29 },
          { label: 'Cloud Infra (24%)',  pct: 24 },
          { label: 'Travel & Meals (19%)', pct: 19 },
          { label: 'G&A (15%)',          pct: 15 },
        ] },
        { type: 'tags', label: 'Status', items: ['On Budget', 'Live Sync', '3 Signals', 'AI Active'] },
        { type: 'text', label: 'AI Summary', value: '3 signals detected — AWS spending 2× monthly forecast. Review flagged card #Infra-1.' },
      ],
    },
    {
      id: 'spend', label: 'Spend',
      content: [
        { type: 'metric', label: 'Today\'s Spend', value: '$7,136', sub: '+31% above daily average · review flagged' },
        { type: 'list', items: [
          { icon: 'alert',  title: 'AWS EC2',        sub: 'Cloud Infra · Eng #1 card',     badge: '⚠' },
          { icon: 'code',   title: 'Vercel Pro',     sub: 'SaaS · Eng #3 card · $240',     badge: '·' },
          { icon: 'layers', title: 'Figma Team',     sub: 'Design · Design card · $180',   badge: '·' },
          { icon: 'zap',    title: 'Anthropic API',  sub: 'AI · Eng #1 card · $1,800',     badge: '·' },
          { icon: 'share',  title: 'Delta SFO-NYC',  sub: 'Travel · Travel card · $620',   badge: '·' },
          { icon: 'check',  title: 'Notion AI',      sub: 'Ops · Ops card · $96',          badge: '✓' },
        ] },
        { type: 'tags', label: 'Categories', items: ['SaaS', 'Cloud', 'Travel', 'AI/ML', 'G&A'] },
      ],
    },
    {
      id: 'cards', label: 'Cards',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Cards', value: '12'   },
          { label: 'Teams',        value: '4'    },
          { label: 'Flagged',      value: '2'    },
        ] },
        { type: 'progress', items: [
          { label: 'Engineering #1 — $18,200 / $25,000 (73%)', pct: 73 },
          { label: 'Engineering #3 — $4,100 / $5,000 (82%)',   pct: 82 },
          { label: 'Design — $3,800 / $6,000 (63%)',           pct: 63 },
          { label: 'Travel — $8,900 / $10,000 (89%)',          pct: 89 },
        ] },
        { type: 'tags', label: 'Alert', items: ['Travel 89%', 'Eng#3 82%', '2 Near Limit'] },
      ],
    },
    {
      id: 'budget', label: 'Budget',
      content: [
        { type: 'metric', label: 'Q1 Budget — Total', value: '$60,000', sub: '$48,320 spent · $11,680 remaining · 80% used' },
        { type: 'progress', items: [
          { label: 'Engineering — $18,200 / $25,000 (73%)',  pct: 73 },
          { label: 'Marketing — $9,400 / $10,000 (94%)',     pct: 94 },
          { label: 'Design — $5,800 / $8,000 (73%)',         pct: 73 },
          { label: 'Operations — $4,100 / $7,000 (59%)',     pct: 59 },
          { label: 'G&A — $6,820 / $10,000 (68%)',           pct: 68 },
        ] },
        { type: 'text', label: 'Alert', value: 'Marketing at 94% — on pace to overspend by $400 if current run-rate continues.' },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'AI Signals — Active', value: '3 new', sub: 'Pavo AI scanned 3,812 transactions · 4 min ago' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'AWS spend 2× forecast',          sub: 'Critical · $4,200 vs $2,100 expected',        badge: '⚠' },
          { icon: 'activity', title: 'Figma → annual saves $440/yr',   sub: 'Opportunity · Switch billing plan',            badge: '↗' },
          { icon: 'eye',      title: 'SaaS spend up 18% QoQ',          sub: 'Insight · 6 new tools added since Jan',        badge: '◈' },
          { icon: 'calendar', title: '4 vendor renewals in April',     sub: 'Info · Total $8,200 · First due Apr 4',        badge: '·' },
        ] },
        { type: 'tags', label: 'Signal types', items: ['Critical', 'Opportunity', 'Insight', 'Info'] },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'grid'     },
    { id: 'spend',    label: 'Spend',    icon: 'activity' },
    { id: 'cards',    label: 'Cards',    icon: 'layers'   },
    { id: 'budget',   label: 'Budget',   icon: 'chart'    },
    { id: 'signals',  label: 'Signals',  icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pavo-mock', 'PAVO — Interactive Mock');
console.log('Mock live at:', result.url);
