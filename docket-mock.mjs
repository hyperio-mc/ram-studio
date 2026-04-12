// DOCKET — Svelte interactive mock

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DOCKET',
  tagline:   'Documents that think with you.',
  archetype: 'ai-document-intelligence',

  palette: {
    bg:      '#1C1A16',
    surface: '#252219',
    text:    '#F0EDE6',
    accent:  '#C95A2C',
    accent2: '#4A7B5E',
    muted:   'rgba(240,237,230,0.42)',
  },

  lightPalette: {
    bg:      '#FAF7F1',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#C95A2C',
    accent2: '#3B5E45',
    muted:   'rgba(26,23,20,0.42)',
  },

  screens: [
    {
      id: 'desk', label: 'Desk',
      content: [
        { type: 'metric', label: 'Active Matters', value: '12', sub: '+2 this week' },
        { type: 'metric-row', items: [
            { label: 'Drafts Open', value: '7' },
            { label: 'AI Reviews',  value: '28' },
            { label: 'Clauses',     value: '341' }
          ]
        },
        { type: 'list', items: [
            { icon: 'alert', title: 'Harmon & Reeves — Lease Review',    sub: 'Needs Review · Due Today',   badge: '72 risk' },
            { icon: 'star',  title: 'Bellfield Capital — Series B',       sub: 'In Draft · Due Apr 7',       badge: '44 risk' },
            { icon: 'check', title: 'Voss Pharma — NDA Partnership',      sub: 'Client Review · Due Apr 10', badge: '21 risk' },
            { icon: 'zap',   title: 'Thorne Industries — SFA',            sub: 'Flagged Clauses · Overdue',  badge: '88 risk' }
          ]
        },
        { type: 'tags', label: 'Categories', items: ['Real Estate', 'Corporate', 'IP', 'Commercial'] }
      ]
    },
    {
      id: 'brief', label: 'Brief',
      content: [
        { type: 'metric', label: 'Risk Score', value: '88', sub: 'HIGH — 3 clauses flagged' },
        { type: 'metric-row', items: [
            { label: 'Pages',       value: '24' },
            { label: 'Clauses',     value: '41' },
            { label: 'Flagged',     value: '3'  },
            { label: 'Favourable',  value: '18' }
          ]
        },
        { type: 'text', label: 'AI Brief', value: 'The indemnification clause in §7.2 creates disproportionate liability exposure — recommend negotiation or carve-out.' },
        { type: 'list', items: [
            { icon: 'alert', title: '§7.2 — Indemnification',              sub: 'High Risk · Liability',     badge: 'HIGH' },
            { icon: 'eye',   title: '§12.1 — Termination for Convenience', sub: 'Review · 7-day notice',     badge: 'REVIEW' },
            { icon: 'eye',   title: '§4.4 — Exclusivity Window',           sub: 'Review · Undefined scope',  badge: 'REVIEW' }
          ]
        }
      ]
    },
    {
      id: 'clauses', label: 'Clauses',
      content: [
        { type: 'metric', label: 'Saved Clauses', value: '341', sub: 'Personal library' },
        { type: 'tags', label: 'Categories', items: ['All', 'Liability', 'IP', 'Termination', 'Payment', 'Confidential'] },
        { type: 'list', items: [
            { icon: 'star', title: 'Limitation of Liability — Standard',  sub: 'Used in 14 matters · Mar 28', badge: '★' },
            { icon: 'star', title: 'Mutual NDA — Standard Form',          sub: 'Used in 27 matters · Apr 1',  badge: '★' },
            { icon: 'list', title: 'IP Ownership — Work for Hire',        sub: 'Used in 9 matters · Mar 15',  badge: ''  },
            { icon: 'list', title: '30-Day Termination Notice',           sub: 'Used in 19 matters · Apr 2',  badge: ''  }
          ]
        },
        { type: 'text', label: 'AI Suggested', value: 'Force Majeure — Broad Form relevant to Thorne Industries SFA' }
      ]
    },
    {
      id: 'draft', label: 'Draft',
      content: [
        { type: 'metric', label: 'Draft Completeness', value: '68%', sub: 'Bellfield Capital · Series B v3' },
        { type: 'progress', items: [
            { label: 'Cover & Parties',     pct: 100 },
            { label: 'Investment Terms',    pct: 100 },
            { label: 'Governance & Board',  pct: 65  },
            { label: 'Economics & Dilution', pct: 0  },
            { label: 'Closing Conditions',  pct: 0   }
          ]
        },
        { type: 'list', items: [
            { icon: 'check', title: 'I — Cover & Parties',      sub: '180 words · Complete',      badge: '✓' },
            { icon: 'check', title: 'II — Investment Terms',    sub: '340 words · Complete',      badge: '✓' },
            { icon: 'zap',   title: 'III — Governance & Board', sub: '210 words · AI Reviewing',  badge: '…' },
            { icon: 'eye',   title: 'IV — Economics & Dilution', sub: 'Not Started',              badge: '' },
            { icon: 'eye',   title: 'V — Closing Conditions',   sub: 'Not Started',              badge: '' }
          ]
        }
      ]
    },
    {
      id: 'matters', label: 'Matters',
      content: [
        { type: 'metric-row', items: [
            { label: 'On Track',   value: '7' },
            { label: 'Needs Attn', value: '3' },
            { label: 'Overdue',    value: '2' }
          ]
        },
        { type: 'progress', items: [
            { label: 'Corporate',   pct: 90 },
            { label: 'Real Estate', pct: 58 },
            { label: 'IP',          pct: 43 },
            { label: 'Commercial',  pct: 36 },
            { label: 'Employment',  pct: 22 }
          ]
        },
        { type: 'list', items: [
            { icon: 'alert', title: 'Harmon & Reeves',   sub: 'Real Estate · Needs Attn',    badge: '!' },
            { icon: 'check', title: 'Bellfield Capital', sub: 'Corporate · On Track',         badge: '✓' },
            { icon: 'check', title: 'Voss Pharma',       sub: 'IP · On Track',               badge: '✓' },
            { icon: 'alert', title: 'Thorne Industries', sub: 'Commercial · Overdue',         badge: '!' },
            { icon: 'check', title: 'Calder Group',      sub: 'Employment · On Track',        badge: '✓' },
            { icon: 'alert', title: 'Meridian Labs',     sub: 'IP · Needs Attention',         badge: '!' }
          ]
        }
      ]
    }
  ],

  nav: [
    { id: 'desk',    label: 'Desk',    icon: 'home'   },
    { id: 'brief',   label: 'Brief',   icon: 'eye'    },
    { id: 'clauses', label: 'Clauses', icon: 'layers' },
    { id: 'draft',   label: 'Draft',   icon: 'edit'   },
    { id: 'matters', label: 'Matters', icon: 'list'   }
  ]
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'docket-mock', 'DOCKET — Interactive Mock');
console.log('Mock live at:', result.url);
