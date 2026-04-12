// nook-mock.mjs — NOOK Svelte 5 interactive mock
// Light warm parchment home discovery app
// Inspired by RAY (land-book.com) — "More than a building. It's a place."

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'NOOK',
  tagline:   'find where you belong',
  archetype: 'home-discovery',

  // LIGHT palette (primary — warm parchment editorial)
  palette: {
    bg:      '#F7F0E8',
    surface: '#FEFCF9',
    text:    '#1C1510',
    accent:  '#C4653A',   // terracotta / adobe brick
    accent2: '#6B9B7A',   // muted sage green
    muted:   'rgba(28,21,16,0.42)',
  },

  // DARK palette (secondary — deep warm ink)
  lightPalette: {
    bg:      '#1A100A',
    surface: '#261810',
    text:    '#F7F0E8',
    accent:  '#E07040',   // brighter terracotta for dark bg
    accent2: '#80B88A',   // lighter sage for dark bg
    muted:   'rgba(247,240,232,0.42)',
  },

  screens: [
    {
      id: 'home',
      label: 'Home',
      content: [
        { type: 'metric', label: 'GOOD MORNING', value: 'Good morning, Aiko.', sub: 'Friday · March 27 · Dalston · 3 new matches today' },
        { type: 'metric-row', items: [
          { label: 'Saved',   value: '3'      },
          { label: 'Viewed',  value: '18'     },
          { label: 'Feel',    value: '94 max' },
        ]},
        { type: 'tags', label: 'How do you want to feel at home?', items: ['✦ Cosy', 'Airy', 'Minimal', 'Social', 'Quiet'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Marlowe Flat — Dalston E8',   sub: '1 bed · 2nd floor · £1,850 /mo · ✦ Perfect feel match',   badge: '94 feel' },
          { icon: 'check', title: 'Rowan House — Hackney E9',    sub: '2 bed · Top floor · £2,200 /mo · Bright + Character',     badge: '91 feel' },
          { icon: 'heart', title: 'Linden Studio — London Fields', sub: 'Studio · Ground · £1,320 /mo · Airy + Quiet',           badge: '88 feel' },
          { icon: 'map',   title: '6 more matches found today',  sub: 'Nook found new listings matching your feel profile',      badge: '→ Browse' },
        ]},
        { type: 'text', label: '✦ Nook says', value: 'Your Cosy + Character preferences are well matched right now. 3 of your saved homes have viewings available this weekend.' },
      ],
    },

    {
      id: 'browse',
      label: 'Browse',
      content: [
        { type: 'metric', label: 'BROWSE', value: 'Dalston & London Fields', sub: '24 homes · sorted by feel match · 3 strong matches (94+)' },
        { type: 'metric-row', items: [
          { label: '94+ score', value: '3'   },
          { label: '80–93',     value: '9'   },
          { label: 'New today', value: '6'   },
        ]},
        { type: 'tags', label: 'Feel filter', items: ['All feels', 'Cosy', 'Airy', 'Quiet', 'Character', 'Minimal'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Marlowe Flat',   sub: '1 bed · Dalston E8 · £1,850 /mo · ✦ 94 feel score · South-facing bay',    badge: '✦ 94'  },
          { icon: 'check', title: 'Rowan House',    sub: '2 bed · Hackney E9 · £2,200 /mo · 91 feel · Top floor + period features',  badge: '91'    },
          { icon: 'heart', title: 'Linden Studio',  sub: 'Studio · London Fields · £1,320 /mo · 88 feel · Garden access',            badge: '88'    },
          { icon: 'map',   title: 'Vine Cottage',   sub: '1 bed · Bethnal Green · £1,600 /mo · 84 feel · Victorian conversion',      badge: '84'    },
          { icon: 'play',  title: 'Oak Mansions',   sub: '2 bed · Hackney E8 · £2,400 /mo · 81 feel · Large rooms + quiet',          badge: '81'    },
        ]},
        { type: 'text', label: '✦ Browse tip', value: 'Filtering by Cosy reduces your results from 24 to 8 — all with strong light and character scores. Your most likely match is in Dalston.' },
      ],
    },

    {
      id: 'listing',
      label: 'Listing',
      content: [
        { type: 'metric', label: 'MARLOWE FLAT · DALSTON E8', value: '£1,850 /mo · 94 feel score', sub: '1 bedroom · 2nd floor · Available from April 1 · ✦ Perfect feel match' },
        { type: 'metric-row', items: [
          { label: 'Light',       value: '91' },
          { label: 'Character',   value: '97' },
          { label: 'Walkability', value: '93' },
        ]},
        { type: 'tags', label: 'Attributes', items: ['☀ South-facing', '◑ Quiet street', '⌘ Period features', '⊙ 12 min city', '◎ High ceilings', '↑ 2nd floor'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Light score: 91',       sub: 'South-facing bay window. Full light from 9am–4pm. Original glazing.', badge: '91/100' },
          { icon: 'check', title: 'Quiet score: 85',       sub: 'Back of the building. Residential street. Victorian double glazing.', badge: '85/100' },
          { icon: 'heart', title: 'Character score: 97',   sub: 'Original cornicing, period fireplace, herringbone floor. Exceptional.', badge: '97/100' },
          { icon: 'map',   title: 'Space score: 88',       sub: '520 sq ft. 3.2m ceilings. Large storage cupboard. No awkward layout.', badge: '88/100' },
        ]},
        { type: 'text', label: '✦ Nook says', value: 'This is your highest feel match. The Character score (97) is exceptional — period features that perfectly match your stated preferences. Arrange a viewing this weekend.' },
      ],
    },

    {
      id: 'saved',
      label: 'Saved',
      content: [
        { type: 'metric', label: 'YOUR SHORTLIST', value: '3 homes saved', sub: '2 viewings arranged · 1 pending · updated today · move by May 1' },
        { type: 'metric-row', items: [
          { label: 'Avg feel',   value: '91'   },
          { label: 'Viewings',   value: '2'    },
          { label: 'Days left',  value: '35'   },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Marlowe Flat — 94 feel',  sub: 'Dalston E8 · £1,850 /mo · Viewing: Tomorrow 10:30am · Confirmed',  badge: '✦ Top pick' },
          { icon: 'check', title: 'Rowan House — 91 feel',   sub: 'Hackney E9 · £2,200 /mo · Viewing: Sat 2:00pm · Pending confirm',  badge: '⏳ Pending'  },
          { icon: 'heart', title: 'Linden Studio — 88 feel', sub: 'London Fields E8 · £1,320 /mo · No viewing yet',                  badge: '○ Book'      },
          { icon: 'map',   title: 'Your move deadline',      sub: 'May 1, 2026 · 35 days away · Nook will alert if new matches emerge', badge: '35 days'    },
        ]},
        { type: 'text', label: '✦ Your note', value: '"Marlowe has the light we want — ask about the storage and whether the upstairs neighbours are quiet. Priority visit this week."' },
      ],
    },

    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'YOUR FEEL PROFILE', value: 'Aiko Inoue', sub: 'Looking in East London · Move by May 1 · 18 homes browsed · 3 shortlisted' },
        { type: 'metric-row', items: [
          { label: 'Light pref',     value: '90%' },
          { label: 'Character pref', value: '95%' },
          { label: 'Move in',        value: '35d' },
        ]},
        { type: 'tags', label: 'Must-haves', items: ['South-facing', 'Period features', 'Quiet street', 'Within 15 min city', 'Outdoor space'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Feel fingerprint set',    sub: 'Light 90 · Quiet 80 · Space 60 · Character 95 · Walkability 85',   badge: '✦ Active'  },
          { icon: 'check', title: '3 strong matches found',  sub: '94+ feel score in your target area — Dalston & London Fields',     badge: '3 homes'   },
          { icon: 'heart', title: 'Best match score: 94',    sub: 'Marlowe Flat is your highest match in 3 months of searching',      badge: 'All-time'  },
          { icon: 'map',   title: 'Search started',          sub: 'December 2025 · 3 months active · 18 homes explored',             badge: 'Dec 25'    },
        ]},
        { type: 'text', label: '✦ Nook profile insight', value: 'Your Character score preference (95) is unusually specific — you respond strongly to period features and original details. This narrows your match pool but makes your matches much more accurate.' },
      ],
    },
  ],

  nav: [
    { id: 'home',    label: 'Home',    icon: 'star'  },
    { id: 'browse',  label: 'Browse',  icon: 'check' },
    { id: 'listing', label: 'Listing', icon: 'heart' },
    { id: 'saved',   label: 'Saved',   icon: 'map'   },
    { id: 'profile', label: 'Profile', icon: 'play'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('nook-mock.html', html);
console.log(`✓ Saved nook-mock.html — ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'nook-mock', 'NOOK — find where you belong · Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published, no URL:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  nook-mock.html saved locally — will publish when quota resets Apr 23');
}
