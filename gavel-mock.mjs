import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GAVEL',
  tagline:   'AI Legal Co-Pilot',
  archetype: 'legal-ai',

  palette: {           // dark theme (required)
    bg:      '#08080F',
    surface: '#141428',
    text:    '#E2E0F0',
    accent:  '#8B5CF6',
    accent2: '#06B6D4',
    muted:   'rgba(155,150,184,0.45)',
  },

  lightPalette: {      // light theme (enables toggle)
    bg:      '#F5F4FB',
    surface: '#FFFFFF',
    text:    '#1A1733',
    accent:  '#7C3AED',
    accent2: '#0891B2',
    muted:   'rgba(26,23,51,0.4)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric',     label: 'Active Cases',   value: '24',   sub: '68% on track' },
        { type: 'metric-row', items: [
          { label: 'Deadlines',  value: '7' },
          { label: 'Win Rate',   value: '78%' },
          { label: 'Pending',    value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'Meridian Corp — NDA',         sub: 'Risk analysis complete',    badge: 'HIGH' },
          { icon: 'check',    title: 'State v. Torres',             sub: 'Motion filed successfully', badge: 'OK' },
          { icon: 'calendar', title: 'Henderson Estate Trust',      sub: 'Deposition scheduled',      badge: 'SOON' },
        ]},
        { type: 'text', label: 'AI Alert', value: 'Meridian Corp contract flagged — 3 risk clauses detected. Review before signing.' },
      ],
    },
    {
      id: 'research', label: 'Research',
      content: [
        { type: 'text',       label: 'AI Summary', value: 'Courts have consistently upheld non-compete clauses limited to 12 months and specific geography. The Meridian clause (24 months, global) is likely unenforceable under CA Business Code § 16600.' },
        { type: 'progress',   items: [{ label: 'Confidence', pct: 87 }] },
        { type: 'list', items: [
          { icon: 'star',   title: 'Edwards v. Arthur Andersen',  sub: 'CA Supreme · 2008',   badge: '94%' },
          { icon: 'star',   title: 'Dowell v. Biosense Webster',  sub: '9th Circuit · 2009',  badge: '88%' },
          { icon: 'search', title: 'Golden v. CalTrans',          sub: 'CA App Ct · 2015',    badge: '72%' },
          { icon: 'search', title: 'Whyte v. Schlage Lock',       sub: 'CA App Ct · 1999',    badge: '65%' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Contract Law', 'IP', 'Employment', 'Torts'] },
      ],
    },
    {
      id: 'documents', label: 'Documents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Files',  value: '34' },
          { label: 'Analyzed',     value: '28' },
          { label: 'High Risk',    value: '3'  },
        ]},
        { type: 'list', items: [
          { icon: 'alert',  title: 'Meridian — Master Services',   sub: 'Contract · 48pp · HIGH RISK',   badge: '⚠' },
          { icon: 'check',  title: 'Henderson — Trust Amendment',  sub: 'Trust · 12pp · LOW RISK',       badge: '✓' },
          { icon: 'check',  title: 'Torres — Defense Motion',      sub: 'Motion · 8pp · CLEAR',          badge: '✓' },
          { icon: 'eye',    title: 'Axis — IP Assignment',         sub: 'Contract · 22pp · MEDIUM',      badge: '~' },
          { icon: 'eye',    title: 'Chen — Deposition',            sub: 'Evidence · 35pp · MEDIUM',      badge: '~' },
        ]},
        { type: 'progress', items: [
          { label: 'Analysis Complete', pct: 82 },
        ]},
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'text', label: 'Current Case', value: 'State v. Torres — Assault Defense · Trial: Jun 14, 2026' },
        { type: 'metric', label: 'Days to Trial', value: '63', sub: 'Urgent: Motion to Suppress due' },
        { type: 'list', items: [
          { icon: 'check',    title: 'Arraignment',           sub: 'Mar 3 · Not guilty plea',       badge: '✓' },
          { icon: 'check',    title: 'Preliminary Hearing',   sub: 'Mar 18 · Charges reduced',      badge: '✓' },
          { icon: 'check',    title: 'Discovery Deadline',    sub: 'Apr 2 · All evidence disclosed', badge: '✓' },
          { icon: 'alert',    title: 'Motion to Suppress',    sub: 'Apr 19 · URGENT FILING',        badge: '!' },
          { icon: 'calendar', title: 'Expert Deposition',     sub: 'May 7 · Dr. Patricia Reeves',   badge: '→' },
          { icon: 'zap',      title: 'Trial Begins',          sub: 'Jun 14 · Dept 47 Judge Nakamura', badge: '⚖' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'AI Insights',
      content: [
        { type: 'metric', label: 'New Insights', value: '12', sub: 'Personalized to your cases' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'Unenforceable Non-Compete',     sub: 'Meridian Corp — CA § 16600 violation', badge: '94%' },
          { icon: 'star',     title: 'Strong Suppression Precedent',  sub: 'Torres — 91% success in jurisdiction', badge: '91%' },
          { icon: 'calendar', title: 'Henderson Filing Window',       sub: 'Closes Apr 25 — 2 sigs outstanding',   badge: '40%' },
        ]},
        { type: 'progress', items: [
          { label: 'Contract Risk Score', pct: 94 },
          { label: 'Suppression Confidence', pct: 91 },
          { label: 'Filing Urgency', pct: 40 },
        ]},
        { type: 'tags', label: 'Focus Areas', items: ['Contract Risk', 'Precedents', 'Deadlines', 'Filings'] },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Cases', value: '147' },
          { label: 'Win Rate', value: '78%' },
          { label: 'AI Queries', value: '2.4K' },
          { label: 'Hrs Saved', value: '312' },
        ]},
        { type: 'text', label: 'Attorney', value: 'Sarah Chen · Partner — Chen & Associates LLP · CA Bar #234891 · Pro Plan' },
        { type: 'list', items: [
          { icon: 'bell',     title: 'Notifications',       sub: '7 active alerts',    badge: '7' },
          { icon: 'lock',     title: 'Security',            sub: '2FA enabled',        badge: '✓' },
          { icon: 'star',     title: 'Billing',             sub: 'Pro · $49/mo',       badge: '→' },
          { icon: 'layers',   title: 'Bar Association',     sub: 'CA Bar connected',   badge: '✓' },
          { icon: 'share',    title: 'Data & Export',       sub: 'Last: Mar 15',       badge: '→' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home' },
    { id: 'research',  label: 'Search',   icon: 'search' },
    { id: 'documents', label: 'Docs',     icon: 'layers' },
    { id: 'timeline',  label: 'Cases',    icon: 'calendar' },
    { id: 'profile',   label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'gavel-mock', 'GAVEL — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/gavel-mock`);
