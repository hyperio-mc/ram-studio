// rite-mock.mjs — RITE Svelte 5 interactive mock
// Light editorial skincare ritual tracker
// Inspired by Overlay.com — PP Editorial Old serif, iridescent gradient palette

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'RITE',
  tagline:   'skin intelligence built on ritual',
  archetype: 'skincare-wellness',

  // LIGHT palette (primary — warm cream editorial)
  palette: {
    bg:      '#FAF8F5',
    surface: '#FFFFFF',
    text:    '#1A1720',
    accent:  '#8B7FD4',   // lavender-violet
    accent2: '#D4847A',   // warm blush
    muted:   'rgba(26,23,32,0.38)',
  },

  // DARK palette (secondary — deep mauve-forest)
  lightPalette: {
    bg:      '#12101A',
    surface: '#1C1928',
    text:    '#EAE6F4',
    accent:  '#A99FE8',   // lighter violet for dark bg
    accent2: '#E0A090',   // lighter blush for dark bg
    muted:   'rgba(234,230,244,0.4)',
  },

  screens: [
    {
      id: 'ritual',
      label: 'Ritual',
      content: [
        { type: 'metric', label: 'MORNING RITUAL', value: '14 day streak', sub: 'Friday · March 27 · 2 of 5 done' },
        { type: 'metric-row', items: [
          { label: 'Steps done', value: '2/5'   },
          { label: 'Remaining', value: '3 min'  },
          { label: 'UV index',  value: '6 high' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '✓ Cleanser',    sub: 'CeraVe Hydrating · 60s',         badge: '✓ Done'     },
          { icon: 'check', title: '✓ Toner',       sub: "Paula's Choice BHA · 30s",       badge: '✓ Done'     },
          { icon: 'star',  title: 'Vitamin C',     sub: 'SkinCeuticals C E Ferulic · 60s', badge: '→ Next'     },
          { icon: 'heart', title: 'Moisturiser',   sub: 'La Roche-Posay Toleriane · 30s', badge: '○ Pending'  },
          { icon: 'map',   title: 'SPF 50',        sub: 'Altruist Sunscreen · 30s',       badge: '○ Pending'  },
        ]},
        { type: 'text', label: '✦ Skin note', value: "UV index 6 today — don't skip SPF. Your skin is drier than usual this week based on your photo log." },
      ],
    },

    {
      id: 'track',
      label: 'Track',
      content: [
        { type: 'metric', label: '7-DAY SKIN SCORE', value: '78 / 100', sub: '↑ +4 pts vs last week · hydration improving' },
        { type: 'metric-row', items: [
          { label: 'Hydration', value: '72%' },
          { label: 'Barrier',   value: '81%' },
          { label: 'Texture',   value: '68%' },
        ]},
        { type: 'tags', label: 'Weekly scores', items: ['72 Mon', '68 Tue', '74 Wed', '71 Thu', '76 Fri', '74 Sat', '78 Sun'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Dryness detected', sub: 'Cheek area — 3 days consistent observation',   badge: '⚠ Monitor' },
          { icon: 'check', title: 'Glow improving',   sub: 'Consistent Vitamin C application — 14 days',  badge: '✦ +4 pts'  },
          { icon: 'heart', title: 'Barrier strength',  sub: 'Moisturiser + no fragrance streak',           badge: '◎ Strong'  },
          { icon: 'map',   title: 'Photo log',         sub: '5 photos this week · trend graph available',  badge: '5 photos'  },
        ]},
        { type: 'text', label: '✦ Tracking insight', value: 'Your skin responds most positively to consistent morning ritual. The 3-day gap last week correlated with a −6pt dip on Thursday.' },
      ],
    },

    {
      id: 'shelf',
      label: 'Shelf',
      content: [
        { type: 'metric', label: 'YOUR SHELF', value: '5 products', sub: '3 need replenishing soon · all active' },
        { type: 'metric-row', items: [
          { label: 'Actives', value: '3' },
          { label: 'Core',    value: '2' },
          { label: 'Avg ★',  value: '9.0' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'CeraVe Hydrating Cleanser',    sub: 'Cleanser · ★ 9.2 · 28 days supply', badge: '28d left' },
          { icon: 'check', title: 'SkinCeuticals C E Ferulic',    sub: 'Vitamin C · ★ 9.6 · 14 days supply', badge: '⚠ 14d'   },
          { icon: 'heart', title: 'La Roche-Posay Toleriane',     sub: 'Moisturiser · ★ 8.8 · 45 days',     badge: '45d left' },
          { icon: 'map',   title: 'Altruist SPF 50',              sub: 'Sunscreen · ★ 8.4 · 60 days',       badge: '60d left' },
          { icon: 'play',  title: "Paula's Choice BHA 2%",        sub: 'Exfoliant · ★ 9.0 · 7 days supply', badge: '⚠ 7d'    },
        ]},
        { type: 'text', label: '✦ Shelf note', value: 'SkinCeuticals and Paula\'s Choice replenishment due soon. Based on your usage, you\'ll run out in 14 and 7 days respectively.' },
      ],
    },

    {
      id: 'insight',
      label: 'Insight',
      content: [
        { type: 'metric', label: 'SKIN INTELLIGENCE', value: 'Barrier is strengthening.', sub: '3 weeks consistent ritual — measurable change' },
        { type: 'metric-row', items: [
          { label: 'TEWL',      value: '−12%' },
          { label: 'Hydration', value: '+8pt' },
          { label: 'Redness',   value: '−5%'  },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '01 · Add a peptide serum',      sub: 'Your barrier metrics suggest collagen support would accelerate improvement.', badge: '★ High impact'   },
          { icon: 'check', title: '02 · Reapply SPF at noon',      sub: 'UV index 6+ on 4 of your last 7 days. Mid-day reapplication reduces risk.', badge: '● Medium'        },
          { icon: 'heart', title: '03 · Reduce BHA frequency',     sub: 'Mild sensitivity markers detected. Try 2×/week instead of daily.',         badge: '⚠ Caution'      },
          { icon: 'map',   title: '04 · Increase ceramide intake', sub: 'Skin barrier benefit from topical + internal sources.',                      badge: '◇ Explore'      },
        ]},
        { type: 'text', label: '✦ Intelligence note', value: 'These recommendations come from correlating your own ritual consistency with your skin\'s measurable response — not generic advice.' },
      ],
    },

    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'YOUR SKIN PROFILE', value: 'Elise · Combination', sub: 'Sensitive · Age 28 · Goals: Hydration + Barrier' },
        { type: 'metric-row', items: [
          { label: 'Morning',  value: '86%' },
          { label: 'Evening',  value: '71%' },
          { label: 'Streak',   value: '14d' },
        ]},
        { type: 'tags', label: 'Skin goals', items: ['Hydration', 'Even tone', 'Barrier repair', 'Anti-aging'] },
        { type: 'list', items: [
          { icon: 'star',  title: '14-day morning streak',  sub: 'Personal best — keep going',                   badge: '✦ Today'   },
          { icon: 'check', title: 'Barrier score hit 80',   sub: 'First time this year — consistent moisturiser', badge: 'Last week' },
          { icon: 'heart', title: 'First ritual completed', sub: 'The habit that started everything',             badge: 'Mar 1'    },
          { icon: 'map',   title: 'Vitamin C 14-day run',   sub: 'Visible improvement in glow metric',            badge: 'Mar 14'   },
        ]},
        { type: 'text', label: '✦ Rite insight', value: '"Combination skin needs a ritual with intention — not more products, better ones." Your pattern data shows mornings matter most for your skin type.' },
      ],
    },
  ],

  nav: [
    { id: 'ritual',  label: 'Ritual',  icon: 'star'  },
    { id: 'track',   label: 'Track',   icon: 'check' },
    { id: 'shelf',   label: 'Shelf',   icon: 'heart' },
    { id: 'insight', label: 'Insight', icon: 'map'   },
    { id: 'profile', label: 'Profile', icon: 'play'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('rite-mock.html', html);
console.log(`✓ Saved rite-mock.html — ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'rite-mock', 'RITE — skin intelligence built on ritual · Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published, no URL:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  rite-mock.html saved locally — will publish when quota resets Apr 23');
}
