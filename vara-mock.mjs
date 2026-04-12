// vara-mock.mjs — VARA Svelte 5 interactive mock
// Dark navy biomarker health intelligence app
// Inspired by Superpower.com (godly.website) + MÁLÀ PROJECT dramatic depth (siteinspire)

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'VARA',
  tagline:   'know your biology. all of it.',
  archetype: 'health-biomarker',

  // DARK palette (primary — deep navy intelligence)
  palette: {
    bg:      '#080C18',
    surface: '#0F1526',
    text:    '#E8EDF8',
    accent:  '#FF5A30',   // orange — primary action
    accent2: '#3DA8F5',   // blue — data insight
    muted:   'rgba(232,237,248,0.38)',
  },

  // LIGHT palette (secondary — clean clinical)
  lightPalette: {
    bg:      '#F4F6FB',
    surface: '#FFFFFF',
    text:    '#080C18',
    accent:  '#E04A20',   // darker orange for light bg
    accent2: '#2088D8',   // darker blue for light bg
    muted:   'rgba(8,12,24,0.4)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'HEALTH SCORE', value: '84 / 100', sub: 'Friday · March 27 · ↑ +3 pts this week' },
        { type: 'metric-row', items: [
          { label: 'Metabolic',  value: '91%'  },
          { label: 'Hormonal',   value: '78%'  },
          { label: 'Immune',     value: '88%'  },
        ]},
        { type: 'tags', label: 'Category scores', items: ['91 Metabolic', '78 Hormonal', '88 Immune', '82 Cardiac', '76 Nutrient'] },
        { type: 'list', items: [
          { icon: 'star',  title: '⚠ Cortisol elevated',        sub: '18.4 µg/dL — above optimal range (6–18)',      badge: '→ Act now'  },
          { icon: 'check', title: '✓ Vitamin D optimal',         sub: '52 ng/mL — target achieved + sustained',       badge: '✓ Good'     },
          { icon: 'heart', title: '✓ Fasting glucose stable',   sub: '88 mg/dL — consistent for 3 tests',             badge: '✓ Stable'   },
          { icon: 'map',   title: '→ Next test in 18 days',     sub: 'Full panel · April 14 · LabCorp Midtown',        badge: '18d'        },
        ]},
        { type: 'text', label: '▲ Priority today', value: 'Cortisol is your only out-of-range flag. Stress reduction and sleep quality are the highest-leverage interventions this week.' },
      ],
    },

    {
      id: 'labs',
      label: 'Labs',
      content: [
        { type: 'metric', label: 'LATEST PANEL', value: 'March 9 · 42 markers', sub: '38 in range · 3 watch · 1 act → Full CBC + Metabolic' },
        { type: 'metric-row', items: [
          { label: 'In range', value: '38'   },
          { label: 'Watch',    value: '3'    },
          { label: 'Act',      value: '1'    },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Metabolic', 'Hormones', 'Nutrients', 'Cardiac', 'Immune'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Cortisol',         sub: '18.4 µg/dL · Range: 6–18 · AM draw · ⚠ High',    badge: '⚠ High'   },
          { icon: 'check', title: 'Testosterone',      sub: '642 ng/dL · Range: 264–916 · ✓ Optimal',         badge: '✓ Good'   },
          { icon: 'heart', title: 'TSH',               sub: '1.8 mIU/L · Range: 0.5–4.5 · ✓ Optimal',         badge: '✓ Good'   },
          { icon: 'map',   title: 'Vitamin D (25-OH)', sub: '52 ng/mL · Range: 30–80 · ✓ Optimal',             badge: '✓ Good'   },
          { icon: 'play',  title: 'hsCRP',             sub: '1.2 mg/L · Range: <1.0 · ↗ Watch',               badge: '↗ Watch'  },
          { icon: 'star',  title: 'HbA1c',             sub: '5.1% · Range: <5.7 · ✓ Optimal',                  badge: '✓ Good'   },
        ]},
        { type: 'text', label: '↗ Lab note', value: 'hsCRP is below clinical concern but has risen from 0.6 to 1.2 over 3 tests — the upward trend is worth watching against your Cortisol pattern.' },
      ],
    },

    {
      id: 'trends',
      label: 'Trends',
      content: [
        { type: 'metric', label: 'TREND OVERVIEW', value: '6 tests · 14 months', sub: 'Mar 2025 → Mar 2026 · 4 markers improving · 2 watch' },
        { type: 'metric-row', items: [
          { label: 'Improving', value: '4'  },
          { label: 'Stable',    value: '3'  },
          { label: 'Watch',     value: '2'  },
        ]},
        { type: 'tags', label: 'Test dates', items: ['Jan 25', 'Mar 25', 'Jun 25', 'Sep 25', 'Dec 25', 'Mar 26'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Vitamin D',    sub: '28 → 52 ng/mL · ↑ +24 pts · sustained after Oct',        badge: '↑ +24'    },
          { icon: 'check', title: 'Testosterone', sub: '486 → 642 ng/dL · ↑ +32% · aligned with sleep improve',   badge: '↑ +32%'   },
          { icon: 'heart', title: 'Cortisol',     sub: '12.1 → 18.4 µg/dL · ↑ creeping up · correlates Q4 work', badge: '↗ Watch'  },
          { icon: 'map',   title: 'hsCRP',        sub: '0.6 → 1.2 mg/L · ↗ slow rise · 3 consecutive tests',     badge: '↗ Watch'  },
          { icon: 'play',  title: 'HbA1c',        sub: '5.4 → 5.1% · ↓ improving · diet changes Mar 25 effect',  badge: '↓ Better' },
        ]},
        { type: 'text', label: '▲ Trend insight', value: 'The Cortisol + hsCRP rise pattern across 3 consecutive tests suggests a systemic stress response. This is the most important pattern to address in your next 90 days.' },
      ],
    },

    {
      id: 'insight',
      label: 'Insight',
      content: [
        { type: 'metric', label: 'AI RECOMMENDATIONS', value: '3 priority actions', sub: 'Ranked by impact · updated Mar 27 · personalised to your data' },
        { type: 'metric-row', items: [
          { label: 'High impact', value: '1'    },
          { label: 'Medium',      value: '2'    },
          { label: 'Evidence',    value: '14★'  },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '01 · Reduce cortisol load',      sub: 'Sleep 7–9h, reduce caffeine after 12pm, add 10min breathwork daily. Evidence: 6 studies, strong correlation to your Q4 data.', badge: '★ High'   },
          { icon: 'check', title: '02 · Address hsCRP trajectory',  sub: 'Anti-inflammatory diet: reduce refined carbs, increase omega-3 (2g/day). Your HbA1c improvement shows diet response is real.', badge: '● Medium' },
          { icon: 'heart', title: '03 · Sustain testosterone gains', sub: 'Resistance training 3×/week is already working. Protect sleep quality — it\'s your biggest lever for sustained levels.', badge: '● Medium' },
          { icon: 'map',   title: '04 · Add DHEA-S to next panel',  sub: 'Cortisol/DHEA-S ratio is a key adrenal stress marker. Not in current panel — worth adding to April draw.', badge: '◇ Explore' },
        ]},
        { type: 'text', label: '▲ Vara intelligence', value: 'These recommendations come from correlating your specific biomarker trajectories with peer-reviewed intervention data — not generic health advice.' },
      ],
    },

    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'YOUR BIOLOGY', value: 'Marcus · 34 · Male', sub: 'Goals: Performance + Longevity · Member since Mar 2025' },
        { type: 'metric-row', items: [
          { label: 'Tests run',  value: '6'    },
          { label: 'Markers',   value: '42'   },
          { label: 'Score now', value: '84'   },
        ]},
        { type: 'tags', label: 'Health goals', items: ['Performance', 'Longevity', 'Stress', 'Sleep', 'Muscle'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Score reached 84',        sub: 'All-time high — 3 consecutive improvements',         badge: '✦ Today'   },
          { icon: 'check', title: 'Vitamin D optimised',     sub: 'From deficient (28) to optimal (52) in 6 months',    badge: 'Sep 25'    },
          { icon: 'heart', title: 'Testosterone up 32%',     sub: 'Sleep + training protocol — sustained 3 tests',      badge: 'Dec 25'    },
          { icon: 'map',   title: 'First panel complete',    sub: 'Established baseline — 42 markers tracked',          badge: 'Mar 25'    },
        ]},
        { type: 'text', label: '▲ Connected sources', value: 'Oura Ring (sleep + HRV), Apple Health (activity), MyFitnessPal (nutrition). These enrich your biomarker analysis with daily context.' },
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'star'  },
    { id: 'labs',    label: 'Labs',    icon: 'check' },
    { id: 'trends',  label: 'Trends',  icon: 'heart' },
    { id: 'insight', label: 'Insight', icon: 'map'   },
    { id: 'profile', label: 'Profile', icon: 'play'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('vara-mock.html', html);
console.log(`✓ Saved vara-mock.html — ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'vara-mock', 'VARA — know your biology. all of it. · Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published, no URL:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  vara-mock.html saved locally — will publish when quota resets Apr 23');
}
