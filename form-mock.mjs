// form-mock.mjs — FORM Svelte 5 interactive mock
// Dark near-black + electric lime premium personal training
// Inspired by Equinox (equinox.com) + Guarding Your Dawns/Qream (Awwwards)

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'FORM',
  tagline:   'train with intention',
  archetype: 'fitness-training',

  // DARK palette (primary — near-black + electric lime)
  palette: {
    bg:      '#080808',
    surface: '#131313',
    text:    '#F0EAE0',
    accent:  '#C8F044',   // electric lime — the racing stripe
    accent2: '#E8B830',   // gold — personal records
    muted:   'rgba(240,234,224,0.38)',
  },

  // LIGHT palette (secondary — bone + ink)
  lightPalette: {
    bg:      '#F5F2EC',
    surface: '#FFFFFF',
    text:    '#0A0A0A',
    accent:  '#5A8A00',   // darker lime for light bg
    accent2: '#A07820',   // darker gold for light bg
    muted:   'rgba(10,10,10,0.42)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'MARCH 27 · WEEK 4 OF 12', value: 'WEDNESDAY. PUSH DAY.', sub: '5 exercises · ~52 min · Coach: Dara Kinsella · 22-day streak' },
        { type: 'metric-row', items: [
          { label: 'STREAK',     value: '22d'  },
          { label: 'ADHERENCE',  value: '89%'  },
          { label: 'THIS WEEK',  value: '3/5'  },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Bench Press',          sub: '4 × 6 · 85 kg · South-facing bay',   badge: '✓ DONE'  },
          { icon: 'check', title: 'Incline DB Press',     sub: '3 × 10 · 30 kg',                     badge: '✓ DONE'  },
          { icon: 'heart', title: 'Cable Fly',            sub: '3 × 12 · 15 kg · UP NEXT',            badge: '→ NEXT'  },
          { icon: 'map',   title: 'Tricep Pushdown',      sub: '4 × 12 · 25 kg',                     badge: '○ TODO'  },
          { icon: 'play',  title: 'Overhead Extension',   sub: '3 × 10 · 20 kg',                     badge: '○ TODO'  },
        ]},
        { type: 'text', label: '↑ COACH NOTE — DARA', value: '"Push bench to 90kg today — your form looked solid on Tuesday. You\'re ready. And control the negative on cable fly, you\'re rushing it."' },
      ],
    },

    {
      id: 'session',
      label: 'Session',
      content: [
        { type: 'metric', label: 'EXERCISE 3 OF 5 · SET 2 OF 3', value: 'CABLE FLY', sub: '12 reps · 15 kg · Rest: 01:34 remaining · 2 of 3 sets done' },
        { type: 'metric-row', items: [
          { label: 'REPS',    value: '12'      },
          { label: 'WEIGHT',  value: '15 kg'   },
          { label: 'REST',    value: '01:34'   },
        ]},
        { type: 'tags', label: 'SET LOG', items: ['SET 1 · 12 · 15kg ✓', 'SET 2 · 12 · 15kg ✓', 'SET 3 · — NEXT'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Set 1',            sub: '12 reps · 15 kg · completed',               badge: '✓ DONE'    },
          { icon: 'check', title: 'Set 2',            sub: '12 reps · 15 kg · completed',               badge: '✓ DONE'    },
          { icon: 'heart', title: 'Set 3',            sub: '12 reps · 15 kg · up next after rest',      badge: '→ UP NEXT' },
          { icon: 'map',   title: 'Next: Tricep Pushdown', sub: '4 × 12 · 25 kg · 4th exercise',       badge: 'EXERCISE 4' },
        ]},
        { type: 'text', label: '↑ FORM NOTE', value: '"Keep elbows soft throughout the fly — don\'t lock out at the bottom. Squeeze at the top for a full second. You\'ve been rushing the negative."' },
      ],
    },

    {
      id: 'program',
      label: 'Program',
      content: [
        { type: 'metric', label: 'YOUR PROGRAM', value: 'STRENGTH FOUNDATION', sub: '12-week · Week 4 of 12 · Push / Pull / Legs · Coach: Dara Kinsella' },
        { type: 'metric-row', items: [
          { label: 'WEEK',      value: '4 / 12' },
          { label: 'PHASE',     value: 'HYPER'  },
          { label: 'DONE',      value: '3 / 5'  },
        ]},
        { type: 'tags', label: 'PHASE · WEEKS 3–6', items: ['W1 ✓', 'W2 ✓', 'W3 ✓', 'W4 NOW', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'MON — Upper Strength',        sub: 'DONE · bench + rows + accessories · 51 min',   badge: '✓ DONE' },
          { icon: 'check', title: 'TUE — Lower Strength',        sub: 'DONE · squat + RDL + accessories · 58 min',    badge: '✓ DONE' },
          { icon: 'heart', title: 'WED — Push Day',              sub: 'TODAY · bench + incline + cable work',          badge: '→ TODAY' },
          { icon: 'map',   title: 'THU — Rest / Active Recovery', sub: 'Light walk or mobility work · 20–30 min',      badge: 'REST'   },
          { icon: 'play',  title: 'FRI — Pull Day',              sub: 'Deadlift focus · rows + curls · ~55 min',       badge: 'UPCOMING' },
        ]},
        { type: 'text', label: '↑ CURRENT PHASE', value: 'HYPERTROPHY (Weeks 3–6): Volume emphasis, 4×8–12 reps. Progressive overload on major compounds every session. Dara targets +2.5–5kg on main lifts each week.' },
      ],
    },

    {
      id: 'progress',
      label: 'Progress',
      content: [
        { type: 'metric', label: 'YOUR PROGRESS · WEEK 4', value: 'GETTING STRONGER.', sub: '18 sessions · 22-day streak · 89% adherence · 3 new personal records this block' },
        { type: 'metric-row', items: [
          { label: 'SESSIONS',    value: '18'   },
          { label: 'STREAK',      value: '22d'  },
          { label: 'NEW PRs',     value: '3'    },
        ]},
        { type: 'tags', label: 'PERSONAL RECORDS', items: ['BENCH 102.5kg ★', 'SQUAT 160kg ★', 'DEADLIFT 195kg ★'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Bench Press',   sub: '77.5 kg → 102.5 kg · +32% in 4 weeks · NEW PR ★',  badge: '+32% ★'  },
          { icon: 'check', title: 'Squat',         sub: '130 kg → 160 kg · +23% · another PR incoming',     badge: '+23%'    },
          { icon: 'heart', title: 'Deadlift',      sub: '160 kg → 195 kg · +22% · strongest ever',          badge: '+22%'    },
          { icon: 'map',   title: 'OHP',           sub: '55 kg → 65 kg · +18% · consistent weekly gains',   badge: '+18%'    },
          { icon: 'play',  title: 'Pull-up',       sub: 'BW → BW+5kg · first weighted pull-up PR',          badge: '↑ PR ★'  },
        ]},
        { type: 'text', label: '↑ VOLUME THIS WEEK', value: '22 working sets so far — +4 vs Week 3. Weekly volume has increased every week. Dara notes: "You\'re recovering well. Don\'t add sessions — add intensity instead."' },
      ],
    },

    {
      id: 'coach',
      label: 'Coach',
      content: [
        { type: 'metric', label: 'YOUR COACH', value: 'DARA KINSELLA', sub: 'Strength & Conditioning Coach · Next check-in: Friday 2pm · Video call · 2 days away' },
        { type: 'metric-row', items: [
          { label: 'SESSIONS',   value: '18'    },
          { label: 'CHECK-INS',  value: '4'     },
          { label: 'RATING',     value: '4.9★'  },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '↑ FORM NOTE',    sub: '"Bench: arch slightly, drive feet. Losing tightness at the top — control the negative."', badge: 'LATEST'  },
          { icon: 'check', title: '▲ LOAD NOTE',   sub: '"Push bench to 90kg today. Squat is ready for 160 next session."',                         badge: 'TODAY'   },
          { icon: 'heart', title: '◎ RECOVERY',    sub: '"Sleep data looks good — 7h avg. Keep the Thursday rest day. No add-ons this week."',       badge: 'WED'     },
          { icon: 'map',   title: 'Msg from Dara', sub: '"Go for 160. You\'re ready." — responding to your question about squat load.',              badge: '2h ago'  },
        ]},
        { type: 'text', label: '↑ DARA SAYS', value: '"You\'re in one of the best training blocks I\'ve coached this year. Your consistency is making the difference. Friday check-in: we\'ll plan the Week 5 intensity bump."' },
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'star'  },
    { id: 'session',  label: 'Session',  icon: 'check' },
    { id: 'program',  label: 'Program',  icon: 'heart' },
    { id: 'progress', label: 'Progress', icon: 'map'   },
    { id: 'coach',    label: 'Coach',    icon: 'play'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('form-mock.html', html);
console.log(`✓ Saved form-mock.html — ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'form-mock', 'FORM — train with intention · Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published, no URL:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  form-mock.html saved locally — will publish when quota resets Apr 23');
}
