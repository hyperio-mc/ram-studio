import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'PROOF',
  tagline: 'Customer Impact Stories for B2B Buyers',
  archetype: 'editorial-impact',
  palette: {
    bg:      '#0E1523',
    surface: '#1B2438',
    text:    '#F0F2F8',
    accent:  '#1A4FDB',
    accent2: '#059669',
    muted:   'rgba(126,139,163,0.4)',
  },
  lightPalette: {
    bg:      '#FAFAF7',
    surface: '#FFFFFF',
    text:    '#0E1523',
    accent:  '#1A4FDB',
    accent2: '#059669',
    muted:   'rgba(14,21,35,0.35)',
  },
  screens: [
    {
      id: 'home', label: 'Browse Stories',
      content: [
        { type: 'metric', label: 'Customer Stories', value: '2,400+', sub: 'Verified outcomes from real companies' },
        { type: 'metric-row', items: [
          { label: 'Revenue ↑', value: '412' },
          { label: 'Security', value: '184' },
          { label: 'Cost ↓', value: '287' },
        ]},
        { type: 'tags', label: 'Outcome Filter', items: ['Revenue ↑', 'Fraud ↓', 'Cost ↓', 'Scale ↑', 'Speed ↑'] },
        { type: 'list', items: [
          { icon: 'chart', title: 'Ramp: 94% fraud reduction', sub: 'Security · 8 min read', badge: '94%↓' },
          { icon: 'zap', title: 'Notion: +340% self-serve ARR', sub: 'Revenue · 6 min read', badge: '+340%' },
          { icon: 'activity', title: 'Linear: 50K teams scaled', sub: 'Scale · 4 min read', badge: '50K' },
          { icon: 'lock', title: 'FlightHub: −78% chargebacks', sub: 'Security · 5 min read', badge: '−78%' },
        ]},
      ],
    },
    {
      id: 'story', label: 'Story Detail',
      content: [
        { type: 'metric', label: 'Ramp — Fraud Prevention', value: '94%', sub: 'Reduction in payment fraud events (Q3→Q4 2025)' },
        { type: 'metric-row', items: [
          { label: 'Fraud ↓', value: '94%' },
          { label: 'Saved', value: '$2.1M' },
          { label: 'Deploy', value: '3 wks' },
        ]},
        { type: 'text', label: 'The Challenge', value: 'When Ramp onboarded 40,000 new cards in Q3, their legacy fraud scoring could not keep pace with novel attack vectors targeting corporate spend management.' },
        { type: 'text', label: 'Key Quote', value: '"We went from 2-day fraud review cycles to real-time decisions. The vault model changed everything." — Sarah Chen, CRO' },
        { type: 'progress', items: [
          { label: 'Fraud rate reduction', pct: 94 },
          { label: 'False positive improvement', pct: 74 },
        ]},
      ],
    },
    {
      id: 'metrics', label: 'Metrics Explorer',
      content: [
        { type: 'metric', label: 'Before vs. After', value: '4 companies', sub: 'Fraud prevention outcomes compared' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Ramp: 2.4% → 0.14% fraud rate', sub: 'Before → After', badge: '−94%' },
          { icon: 'activity', title: 'FlightHub: 1.8% → 0.39%', sub: 'Chargeback rate', badge: '−78%' },
          { icon: 'activity', title: 'Tebex: 34h → 2.1h review time', sub: 'Fraud review cycle', badge: '−94%' },
          { icon: 'activity', title: 'Meili: 12 → 3 checkout steps', sub: 'Conversion flow', badge: '−75%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg. Reduction', value: '−85%' },
          { label: 'Avg. ROI', value: '8.4×' },
        ]},
      ],
    },
    {
      id: 'compare', label: 'Compare Vendors',
      content: [
        { type: 'metric', label: 'Evervault vs. Stripe Radar', value: '6 metrics', sub: 'Head-to-head outcome comparison' },
        { type: 'progress', items: [
          { label: 'Avg. Fraud Reduction (Evervault 94% vs 61%)', pct: 94 },
          { label: 'Avg. Fraud Reduction (Stripe Radar)', pct: 61 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Fraud Reduction: 94% vs 61%', sub: 'Evervault wins', badge: 'EV' },
          { icon: 'check', title: 'Deploy Time: 3 wks vs 6 wks', sub: 'Evervault wins', badge: 'EV' },
          { icon: 'check', title: 'False Positive: 1.2% vs 4.7%', sub: 'Evervault wins', badge: 'EV' },
          { icon: 'check', title: 'ROI Year 1: 8.4× vs 3.1×', sub: 'Evervault wins', badge: 'EV' },
        ]},
      ],
    },
    {
      id: 'saved', label: 'Your Library',
      content: [
        { type: 'metric', label: 'Saved Stories', value: '14', sub: '3 collections · Q2 vendor research' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Ramp: 94% fraud reduction', sub: 'Security · Saved 2d ago', badge: '★' },
          { icon: 'heart', title: 'Notion: 340% ARR growth', sub: 'Revenue · Saved 3d ago', badge: '★' },
          { icon: 'heart', title: 'Linear: 50K teams scaled', sub: 'Scale · Saved 5d ago', badge: '★' },
          { icon: 'heart', title: 'Vercel: 500M functions/day', sub: 'Efficiency · Saved 1w', badge: '★' },
        ]},
        { type: 'tags', label: 'Collections', items: ['Q2 Research', 'Security', 'Cost Reduction'] },
      ],
    },
    {
      id: 'filter', label: 'Explore & Filter',
      content: [
        { type: 'metric', label: 'Filtered Results', value: '184', sub: 'SaaS · 50–500 employees · Security' },
        { type: 'tags', label: 'Outcome', items: ['Fraud ↓ ✓', 'Revenue ↑', 'Cost ↓', 'Scale ↑'] },
        { type: 'tags', label: 'Industry', items: ['SaaS ✓', 'Fintech', 'E-comm', 'Media', 'Health'] },
        { type: 'progress', items: [
          { label: 'SaaS stories match', pct: 78 },
          { label: 'Size match (50–500 emp)', pct: 62 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Results', value: '184' },
          { label: 'Avg ROI', value: '6.2×' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',    label: 'Stories', icon: 'list' },
    { id: 'metrics', label: 'Metrics', icon: 'chart' },
    { id: 'compare', label: 'Compare', icon: 'layers' },
    { id: 'saved',   label: 'Saved',   icon: 'heart' },
    { id: 'filter',  label: 'Explore', icon: 'search' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'proof-mock', 'PROOF — Interactive Mock');
console.log('Mock live at:', result.url);
