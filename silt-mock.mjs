// silt-mock.mjs — SILT Svelte 5 interactive mock
// Light naturalist field log — sandy warm #EAE3D8 + olive #4A5E3A + terra cotta #C07845
// Inspired by Moke Valley Cabin (stencil/mono), Woset (sandy beige), Cernel (parchment + dark brown)

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'SILT',
  tagline:   'field naturalist log',
  archetype: 'nature-outdoors',

  // LIGHT palette (primary — sandy warm + olive)
  palette: {
    bg:      '#EAE3D8',
    surface: '#F5F1EA',
    text:    '#2B2419',
    accent:  '#4A5E3A',   // field olive
    accent2: '#C07845',   // terra cotta
    muted:   'rgba(43,36,25,0.38)',
  },

  // DARK palette (secondary toggle — deep forest)
  lightPalette: {
    bg:      '#1C2416',
    surface: '#252F1E',
    text:    '#E8E4DA',
    accent:  '#7BAA5E',   // lighter olive for dark bg
    accent2: '#D8956A',   // lighter terra for dark bg
    muted:   'rgba(232,228,218,0.45)',
  },

  screens: [
    {
      id: 'today',
      label: "Today",
      content: [
        { type: 'metric', label: 'SAT 28 MAR 2026', value: "Today's Field Log", sub: '14-day streak · 12 observations · Spring Migration Peak · Harting Down patch' },
        { type: 'metric-row', items: [
          { label: 'TODAY',    value: '12'    },
          { label: 'STREAK',   value: '14d'   },
          { label: 'SPECIES',  value: '128'   },
        ]},
        { type: 'tags', label: "TODAY'S FOCUS", items: ['Check hedgerows', 'Migration arrivals', 'Wet meadow edge', 'Listen at dawn'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Common Chiffchaff',     sub: 'Phylloscopus collybita · 08:22 · North hedge · ×2',         badge: 'BIRD'   },
          { icon: 'check', title: 'Cuckooflower',          sub: 'Cardamine pratensis · 09:10 · Wet meadow edge · patch',      badge: 'PLANT'  },
          { icon: 'heart', title: 'Scarlet Elf Cup',       sub: 'Sarcoscypha austriaca · 10:45 · Old willow log',             badge: 'FUNGI'  },
          { icon: 'map',   title: 'Brimstone Butterfly',   sub: 'Gonepteryx rhamni · 11:20 · Bramble patch · first of year',  badge: 'INVERT' },
          { icon: 'play',  title: 'Blackthorn in bloom',   sub: 'Prunus spinosa · 11:45 · Lane edge hedge · patch record',    badge: 'PLANT'  },
        ]},
        { type: 'text', label: '▲ SEASONAL CONTEXT', value: '"Spring migration is at peak — Chiffchaff numbers are up across the south this week. Your patch is well-placed to catch early arrivals. Listen for Willow Warbler alongside Chiffchaff from now."' },
      ],
    },

    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'metric', label: 'FIELD LOG · ALL TIME', value: '847 observations', sub: '6.2 years · 128 species · 14-day current streak · Harting Down + 2 other patches' },
        { type: 'metric-row', items: [
          { label: 'OBS',      value: '847'   },
          { label: 'SPECIES',  value: '128'   },
          { label: 'YEARS',    value: '6.2'   },
        ]},
        { type: 'tags', label: 'FILTER BY', items: ['ALL', 'BIRDS', 'PLANTS', 'FUNGI', 'INVERTS'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Yellowhammer',    sub: '14 Mar 2026 · Emberiza citrinella · Arable field edge',      badge: 'NEW SP' },
          { icon: 'check', title: 'Hawfinch',        sub: '02 Jan 2026 · Coccothraustes coccothraustes · Yew woodland', badge: 'NEW SP' },
          { icon: 'heart', title: 'Ring Ouzel',      sub: '09 Oct 2025 · Turdus torquatus · Hilltop scrub',            badge: 'BIRD'   },
          { icon: 'map',   title: 'Water Rail',      sub: '22 Aug 2025 · Rallus aquaticus · Reedbed fringe',           badge: 'BIRD'   },
          { icon: 'play',  title: 'Fly Agaric',      sub: '18 Oct 2025 · Amanita muscaria · Birch woodland',           badge: 'FUNGI'  },
        ]},
        { type: 'text', label: '↑ LOG INSIGHT', value: '"Your observation rate has increased by 18% this year — averaging 12.3 per week versus 10.4 last year. March is tracking to be your best single month on record."' },
      ],
    },

    {
      id: 'life',
      label: 'Life List',
      content: [
        { type: 'metric', label: 'LIFE LIST · BIRDS', value: '74 UK species', sub: '89% of sightings from local patch · 23 species this year · 2 new additions in 2026' },
        { type: 'metric-row', items: [
          { label: 'UK BIRDS',   value: '74'    },
          { label: 'LOCAL %',    value: '89%'   },
          { label: 'THIS YR',    value: '23'    },
        ]},
        { type: 'tags', label: 'CATEGORY', items: ['BIRDS', 'PLANTS', 'FUNGI', 'INVERTS', 'MAMMALS'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Yellowhammer',    sub: 'First: 14 Mar 2026 · Emberiza citrinella · Near-threatened',     badge: '★ NEW'   },
          { icon: 'check', title: 'Hawfinch',        sub: 'First: 02 Jan 2026 · Coccothraustes coccothraustes · Rare',      badge: '★ NEW'   },
          { icon: 'heart', title: 'Ring Ouzel',      sub: 'First: 09 Oct 2025 · Turdus torquatus · Migrant',               badge: 'SCARCE'  },
          { icon: 'map',   title: 'Peregrine',       sub: 'First: 03 Apr 2025 · Falco peregrinus · Recovering species',    badge: 'NOTABLE' },
          { icon: 'play',  title: 'Common Chiffchaff', sub: 'First: 28 Mar 2020 · Phylloscopus collybita · Common',        badge: 'COMMON'  },
        ]},
        { type: 'text', label: '↑ LIFE LIST NOTE', value: '"Hawfinch was your hardest-won species — you logged 4 visits to the same yew woodland before finally connecting. Your life list growth rate suggests 2 new species per year on average."' },
      ],
    },

    {
      id: 'patch',
      label: 'Patch',
      content: [
        { type: 'metric', label: 'MY PATCH · HARTING DOWN', value: '2.4km² territory', sub: '847 obs · 128 species · 6.2 years watching · Ranked #3 locally · 15 obs this week' },
        { type: 'metric-row', items: [
          { label: 'TOTAL OBS',  value: '847'  },
          { label: 'SPECIES',    value: '128'  },
          { label: 'LOCAL RANK', value: '#3'   },
        ]},
        { type: 'tags', label: 'PATCH ZONES', items: ['North hedge', 'Wet meadow', 'Willow carr', 'Hilltop scrub', 'Arable edge'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'North hedge — hotspot',      sub: '28 obs this week · Migration funnel · Highest density zone',   badge: '◉ HOT'   },
          { icon: 'check', title: 'Wet meadow edge',            sub: '12 obs this week · Wildflowers emerging · Snipe in winter',    badge: 'ACTIVE'  },
          { icon: 'heart', title: 'Willow carr',                sub: '8 obs this week · Warbler territory · Sedge + Willow Warbler', badge: 'ACTIVE'  },
          { icon: 'map',   title: 'Red Kite nearby',            sub: 'Reported 1.2km NE today · Outside your patch boundary',       badge: '📍 NEAR' },
          { icon: 'play',  title: 'Early Purple Orchid',        sub: 'Reported 0.8km SW · First of year regionally',                badge: '📍 NEAR' },
        ]},
        { type: 'text', label: '↑ PATCH INTELLIGENCE', value: '"Your North hedge has produced 40% of all your migrant warblers over 6 years. It runs east-west against prevailing winds — a natural grounding site for tired migrants. Worth checking every morning April–May."' },
      ],
    },

    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'OBSERVER PROFILE · MIRA THATCH', value: 'Score: 8.4 / 10', sub: '14-day streak · 12.3 obs/week · 18 species this month · Naturalist since 2020' },
        { type: 'metric-row', items: [
          { label: 'STREAK',     value: '14d'   },
          { label: 'OBS/WEEK',   value: '12.3'  },
          { label: 'SP/MONTH',   value: '18'    },
        ]},
        { type: 'tags', label: 'CATEGORY SPLIT', items: ['BIRDS 74', 'PLANTS 32', 'FUNGI 14', 'INVERTS 8'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Best single day: 28 obs',     sub: '18 Apr 2024 · Spring migration push · 14 species',          badge: '◈ BEST'  },
          { icon: 'check', title: 'Best month: 134 obs',         sub: 'May 2024 · Warbler bonanza · 31-species month',             badge: '◈ BEST'  },
          { icon: 'heart', title: 'Rarest find: Hawfinch',       sub: '02 Jan 2026 · 4 visits to finally connect · Life tick',     badge: '★ RARE'  },
          { icon: 'map',   title: 'Badges: Early Riser',         sub: 'Consistently first light observer · 67% obs before 09:00', badge: '◈ BADGE' },
          { icon: 'play',  title: 'Badges: Patch Keeper',        sub: '250+ consecutive visit days on same 2.4km² patch',        badge: '◎ PATCH' },
        ]},
        { type: 'text', label: '↑ OBSERVER NOTE', value: '"Your observer score of 8.4 reflects consistent effort across diversity, patch depth, and species richness. Your 67% pre-09:00 start rate is the single highest predictor of rare bird contact in your dataset."' },
      ],
    },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
fs.writeFileSync('silt-mock.html', html);
console.log('✓ Saved silt-mock.html locally');

// Publish to ram.zenbin.org (publishMock uses X-Subdomain: ram)
const r1 = await publishMock(html, 'silt-mock', 'SILT — field naturalist log');
console.log('Mock (ram):', r1.status, r1.url);

// Also publish to stable zenbin.org/p/silt-mock
import https from 'https';
function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, m => { let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,body:d})); });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}
const stableBody = Buffer.from(JSON.stringify({ html }));
try {
  const r2 = await req({ hostname:'zenbin.org', path:'/v1/pages/silt-mock?overwrite=true', method:'POST',
    headers:{'Content-Type':'application/json','Content-Length':stableBody.length} }, stableBody);
  console.log('Mock (stable):', r2.status, r2.status===200||r2.status===201 ? 'https://zenbin.org/p/silt-mock' : r2.body.slice(0,100));
} catch(e) { console.log('Mock (stable) error:', e.message); }
