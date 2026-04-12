// pith-mock.mjs — PITH Svelte 5 interactive mock
// Light Swiss editorial newsprint reading intelligence
// Inspired by HireKit (Land-book) — "Stop searching. Start landing." editorial grid
// + Giacomo Dal Prà — Swiss newspaper column rules, Playfair + IBM Plex Mono

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'PITH',
  tagline:   'read with intention',
  archetype: 'reading-intelligence',

  // LIGHT palette (primary — newsprint + editorial red)
  palette: {
    bg:      '#F8F5F0',
    surface: '#FFFFFF',
    text:    '#0E0E0E',
    accent:  '#C8331A',   // editorial red — the column rule
    accent2: '#1A2E4A',   // deep navy — secondary ink
    muted:   'rgba(14,14,14,0.42)',
  },

  // DARK palette (secondary — deep ink + warm)
  lightPalette: {
    bg:      '#0E0E0E',
    surface: '#1A1A1A',
    text:    '#F8F5F0',
    accent:  '#E04020',   // brighter red for dark bg
    accent2: '#4A88C8',   // lighter navy for dark bg
    muted:   'rgba(248,245,240,0.42)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: "TODAY'S DIGEST · FRIDAY MAR 27", value: "TODAY'S READS.", sub: '5 curated reads · ~18 min total · matched to your 8 topics · 34-day streak' },
        { type: 'metric-row', items: [
          { label: 'READS',    value: '5'     },
          { label: 'MIN',      value: '~18'   },
          { label: 'STREAK',   value: '34d'   },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'The Quiet Death of the Attention Economy',       sub: 'The Atlantic · 7 min · Technology · pith available',      badge: '→ READ'  },
          { icon: 'check', title: 'What Deep-Sea Vents Tell Us About Life',         sub: 'Nature · 5 min · Science · pith available',               badge: '→ READ'  },
          { icon: 'heart', title: 'The Case for Boredom',                           sub: 'The New Yorker · 4 min · Philosophy · pith available',    badge: '→ READ'  },
          { icon: 'map',   title: 'Urban Heat and the Politics of Shade',           sub: 'Bloomberg · 6 min · Politics · pith available',           badge: '→ READ'  },
          { icon: 'play',  title: 'On the Economy of Attention — Revisited',        sub: 'Aeon · 8 min · Culture · pith available',                 badge: '→ READ'  },
        ]},
        { type: 'text', label: "↑ TODAY'S PITH ESSENCE", value: '"The attention economy is not dying — it is being replaced. The new currency is not clicks, but comprehension depth. Readers who slow down will outcompete those who scan."' },
      ],
    },

    {
      id: 'read',
      label: 'Read',
      content: [
        { type: 'metric', label: 'READING · TECHNOLOGY · 7 MIN', value: 'The Quiet Death of the Attention Economy', sub: 'The Atlantic · Jonathan Rosen · Progress: 2 of 7 min · 1 highlight saved' },
        { type: 'metric-row', items: [
          { label: 'PROGRESS',  value: '2/7'   },
          { label: 'HIGHLIGHTS', value: '1'    },
          { label: 'PITH',      value: '3 ¶'   },
        ]},
        { type: 'tags', label: 'PITH SUMMARY', items: ['Attention → Comprehension', 'Slow readers win', 'Depth compounds'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Pith — line 1',      sub: '"The attention economy is not dying — it is being replaced."',              badge: '✦ PITH'    },
          { icon: 'check', title: 'Pith — line 2',      sub: '"The new currency is not clicks, but comprehension depth."',               badge: '✦ PITH'    },
          { icon: 'heart', title: 'Pith — line 3',      sub: '"Readers who slow down will outcompete those who scan."',                  badge: '✦ PITH'    },
          { icon: 'map',   title: 'Your highlight',     sub: '"The economics of distraction have been optimised so completely that—"',    badge: '★ SAVED'   },
        ]},
        { type: 'text', label: '↑ READING NOTE', value: 'Annotation: "Compare with Tolentino\'s argument in Trick Mirror — attention is not just captured but restructured by repeated exposure to fragments."' },
      ],
    },

    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'YOUR LIBRARY', value: '47 articles read', sub: '34 days · 12 annotations · 8 topics covered · 34-day streak · Pith score: 847' },
        { type: 'metric-row', items: [
          { label: 'ARTICLES',     value: '47'   },
          { label: 'ANNOTATIONS',  value: '12'   },
          { label: 'TOPICS',       value: '8'    },
        ]},
        { type: 'tags', label: 'FILTER BY TOPIC', items: ['All', 'Technology', 'Science', 'Philosophy', 'Culture', 'Politics', 'Economics'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'The Quiet Death of the Attention Economy', sub: 'Today · Technology · 1 highlight · pith read',                   badge: '↑ TODAY'  },
          { icon: 'check', title: 'Deep Time and the Human Project',          sub: 'Yesterday · Science · 2 highlights · annotated',                 badge: '↑ ANN.'   },
          { icon: 'heart', title: 'Why Good Arguments Feel Uncomfortable',    sub: 'Mar 25 · Philosophy · 3 highlights · key read',                  badge: '↑ 3 ★'    },
          { icon: 'map',   title: 'The Architecture of Urban Loneliness',     sub: 'Mar 24 · Culture · 1 highlight',                                 badge: 'MAR 24'   },
          { icon: 'play',  title: 'The Last Democratic Media',                sub: 'Mar 23 · Politics · no highlights · pith only',                  badge: 'MAR 23'   },
        ]},
        { type: 'text', label: '↑ LIBRARY INSIGHT', value: 'You\'ve read across 7 of your 8 topics this month. Health is your only gap — PITH has 3 strong reads queued in that space. Your annotation rate is 26% — top 12% of readers.' },
      ],
    },

    {
      id: 'topics',
      label: 'Topics',
      content: [
        { type: 'metric', label: 'YOUR TOPIC FINGERPRINT', value: 'BROAD READER.', sub: '8 topics tracked · balanced across 6 · Technology leading · 34 days of data' },
        { type: 'metric-row', items: [
          { label: 'TOPICS',      value: '8'    },
          { label: 'BALANCED',    value: '6'    },
          { label: 'LEADING',     value: 'TECH' },
        ]},
        { type: 'tags', label: 'YOUR BALANCE', items: ['Tech 28%', 'Science 22%', 'Philosophy 16%', 'Culture 14%', 'Politics 10%', 'Economics 6%', 'Health 2%', 'Art 2%'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Technology',   sub: '28% · 13 articles · leading topic · attention, AI, platforms',     badge: '28%'     },
          { icon: 'check', title: 'Science',      sub: '22% · 10 articles · strong · biology, physics, climate',           badge: '22%'     },
          { icon: 'heart', title: 'Philosophy',   sub: '16% · 7 articles · growing · ethics, epistemology, mind',          badge: '16% ↑'   },
          { icon: 'map',   title: 'Culture',      sub: '14% · 7 articles · stable · literature, art, urban life',          badge: '14%'     },
          { icon: 'play',  title: 'Health',       sub: '2% · 1 article · gap — PITH has queued 3 reads for you',           badge: '2% ↓'    },
        ]},
        { type: 'text', label: '↑ PITH TOPIC NOTE', value: 'Your Philosophy reading has grown +8% this month — likely connected to your Technology reads (3 overlap in AI ethics). This cross-topic pattern is a strong signal. We\'ll surface more of it.' },
      ],
    },

    {
      id: 'you',
      label: 'You',
      content: [
        { type: 'metric', label: 'YOUR READING INTELLIGENCE', value: 'PITH SCORE: 847', sub: '34-day streak · 47 articles · 12 annotations · top 8% of readers globally' },
        { type: 'metric-row', items: [
          { label: 'PITH SCORE',  value: '847'   },
          { label: 'PERCENTILE',  value: 'Top 8%' },
          { label: 'STREAK',      value: '34d'   },
        ]},
        { type: 'tags', label: 'THIS WEEK', items: ['5 reads ✓', '3 highlights ✓', '2 annotations ✓', '+23 score ↑', 'Streak active ✓'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Reading score: 847',        sub: 'Depth 82 · Breadth 91 · Consistency 94 · Annotations 78 — growing weekly',   badge: '↑ 847'   },
          { icon: 'check', title: '34-day streak',             sub: 'Started Feb 22 · 34 consecutive reading days · best run ever',                badge: '34d ★'   },
          { icon: 'heart', title: '12 annotations saved',      sub: 'Your best: "The Quiet Death" — 1 highlight · 1 note connected to Tolentino', badge: '12 ann.' },
          { icon: 'map',   title: 'Top 8% globally',           sub: '847 ranks in top 8% of 42,000 active PITH readers after 34 days',            badge: 'Top 8%'  },
          { icon: 'play',  title: 'Health gap to close',       sub: 'Only 2% of your reads are Health — 3 curated reads queued and waiting',      badge: 'GAP ↓'   },
        ]},
        { type: 'text', label: '↑ PITH SAYS', value: '"You\'re reading consistently and broadly. Your annotation quality is what separates a good reader from a great one — your 12 notes this month show real thinking. Keep the Philosophy streak going."' },
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'star'  },
    { id: 'read',    label: 'Read',    icon: 'check' },
    { id: 'library', label: 'Library', icon: 'heart' },
    { id: 'topics',  label: 'Topics',  icon: 'map'   },
    { id: 'you',     label: 'You',     icon: 'play'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('pith-mock.html', html);
console.log(`✓ Saved pith-mock.html — ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'pith-mock', 'PITH — read with intention · Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published, no URL:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  pith-mock.html saved locally — will publish when quota resets Apr 23');
}
