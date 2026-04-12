// welt-mock.mjs — WELT Svelte 5 interactive mock
// Dark global signal feed — warm near-black + copper amber + warm ivory
// Inspired by Muzli ECHO Smart Device warm dark palette, Awwwards SOTD "The Lookback"

import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'WELT',
  tagline:   'global signal feed',
  archetype: 'news-media',

  // DARK palette (primary — warm near-black + copper)
  palette: {
    bg:      '#0B0807',
    surface: '#161210',
    text:    '#E8DFD0',
    accent:  '#C4862E',   // copper amber
    accent2: '#5B7EC4',   // europe blue
    muted:   'rgba(232,223,208,0.42)',
  },

  // LIGHT palette (ivory parchment)
  lightPalette: {
    bg:      '#F5F0E8',
    surface: '#FFFFFF',
    text:    '#2A1F14',
    accent:  '#A06820',   // deeper copper for light bg
    accent2: '#3B5FA0',   // deeper blue for light bg
    muted:   'rgba(42,31,20,0.45)',
  },

  screens: [
    {
      id: 'signal',
      label: 'Signal',
      content: [
        { type: 'metric', label: 'MON 30 MAR 2026 · LIVE', value: 'WELT', sub: '847 stories · 112 countries · Signal 94% · 14-day reading streak' },
        { type: 'metric-row', items: [
          { label: 'STORIES',   value: '847'  },
          { label: 'COUNTRIES', value: '112'  },
          { label: 'SIGNAL',    value: '94%'  },
        ]},
        { type: 'tags', label: 'LIVE TOPICS', items: ['AI Governance', 'Geopolitics', 'Economy', 'Climate', 'Technology'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'AI governance summit fractures on enforcement',    sub: '83 countries · 4,812 articles · 3h ago · 5 regions active',     badge: '🔥 83'  },
          { icon: 'check', title: 'Central banks diverge on rate path as data splits', sub: '64 countries · 2,104 articles · 5h ago',                        badge: '⚡ 64' },
          { icon: 'heart', title: 'Deep-sea survey maps unknown trench ecosystem',    sub: '31 countries · 847 articles · 8h ago',                          badge: '◎ 31'  },
          { icon: 'map',   title: 'Three elections in one week reshape regional power', sub: '47 countries · 1,236 articles · 11h ago',                      badge: '◈ 47'  },
          { icon: 'play',  title: 'Open-source model surpasses proprietary benchmarks', sub: '72 countries · 1,847 articles · 14h ago · trending',           badge: '⚡ 72' },
        ]},
        { type: 'text', label: '◎ SIGNAL NOTE', value: '"AI governance is today\'s dominant global signal — covered in 83 countries with significant divergence between European and Asian framing. Europe favours binding enforcement; Asia emphasises sovereignty. This is your most-read topic this week."' },
      ],
    },

    {
      id: 'story',
      label: 'Story',
      content: [
        { type: 'metric', label: '🔥 TOP STORY · 83 COUNTRIES', value: 'AI governance summit fractures on enforcement', sub: '4,812 articles · 3h ago · updating live · 5 regions covering' },
        { type: 'metric-row', items: [
          { label: 'ARTICLES', value: '4,812' },
          { label: 'COUNTRIES', value: '83'   },
          { label: 'REGIONS',  value: '5'     },
        ]},
        { type: 'tags', label: 'REGIONAL FRAMING', items: ['🇪🇺 Binding rules', '🌏 Sovereignty', '🇺🇸 Self-regulate', '🌍 Access equity'] },
        { type: 'list', items: [
          { icon: 'star',  title: '🇪🇺 Europe — 1,247 articles',       sub: 'Favours binding enforcement with sanctions mechanism · concerned tone',  badge: 'CONCERNED' },
          { icon: 'check', title: '🌏 East Asia — 893 articles',       sub: 'Emphasises national sovereignty, resists external oversight · resistant', badge: 'RESISTANT' },
          { icon: 'heart', title: '🇺🇸 USA — 742 articles',            sub: 'Split: industry self-regulation vs congressional mandate · divided',      badge: 'DIVIDED'   },
          { icon: 'map',   title: '🌍 Africa — 318 articles',          sub: 'Raises access equity — developing nations excluded from draft · critical', badge: 'CRITICAL'  },
          { icon: 'play',  title: '🕌 Middle East — 204 articles',     sub: 'Focuses on geopolitical leverage in multilateral AI negotiations',         badge: 'WATCHFUL'  },
        ]},
        { type: 'text', label: '◎ DIVERGENCE NOTE', value: '"This story has the highest regional divergence score this week (8.4/10). European outlets lead with enforcement mechanisms; East Asian outlets lead with sovereignty concerns. These framings are nearly opposite — worth reading both."' },
      ],
    },

    {
      id: 'globe',
      label: 'Globe',
      content: [
        { type: 'metric', label: 'LIVE SIGNAL MAP', value: '847 stories active', sub: '112 countries reporting · 5 regions · Europe leading at 94% signal strength' },
        { type: 'metric-row', items: [
          { label: 'EU',     value: '94%' },
          { label: 'ASIA',   value: '88%' },
          { label: 'AMER',   value: '72%' },
        ]},
        { type: 'tags', label: 'REGION FILTER', items: ['ALL', 'EUROPE', 'ASIA', 'AMERICAS', 'AFRICA'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Europe — 312 active stories',          sub: '47 countries · Signal 94% · +8% vs yesterday · AI governance dominant',   badge: '◉ 94%' },
          { icon: 'check', title: 'East Asia — 218 active stories',       sub: '18 countries · Signal 88% · +14% · Technology + trade dominant',         badge: '◉ 88%' },
          { icon: 'heart', title: 'Americas — 186 active stories',        sub: '35 countries · Signal 72% · -2% · Economy + climate mix',                badge: '◉ 72%' },
          { icon: 'map',   title: 'Middle East — 74 active stories',      sub: '14 countries · Signal 85% · +22% · Diplomacy + energy leading',          badge: '◉ 85%' },
          { icon: 'play',  title: 'Africa — 57 active stories',           sub: '54 countries · Signal 61% · +5% · Development finance + elections',      badge: '◉ 61%' },
        ]},
        { type: 'text', label: '◎ MAP INSIGHT', value: '"Africa has the most countries (54) but lowest signal intensity — reflecting coverage gaps rather than low activity. Middle East has the fastest-growing signal today (+22%), driven by the ongoing diplomatic calendar."' },
      ],
    },

    {
      id: 'regions',
      label: 'Regions',
      content: [
        { type: 'metric', label: 'BROWSE BY WORLD REGION', value: '6 regions tracked', sub: 'Follow regions to personalise your signal feed · currently following Europe + East Asia' },
        { type: 'metric-row', items: [
          { label: 'FOLLOWING', value: '2' },
          { label: 'AVAILABLE', value: '6' },
          { label: 'STORIES',   value: '847'},
        ]},
        { type: 'tags', label: 'SORT BY', items: ['SIGNAL', 'STORIES', 'TRENDING', 'FOLLOWING'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Europe ★ following',           sub: '312 stories · AI governance · energy transition · democratic resilience', badge: '94% ◉' },
          { icon: 'check', title: 'East Asia ★ following',        sub: '218 stories · Technology · trade policy · maritime tensions',           badge: '88% ◉' },
          { icon: 'heart', title: 'Americas',                     sub: '186 stories · Economic data · climate · domestic politics',             badge: '72% ◉' },
          { icon: 'map',   title: 'Middle East',                  sub: '74 stories · Regional diplomacy · energy · infrastructure',            badge: '85% ◉' },
          { icon: 'play',  title: 'Africa',                       sub: '57 stories · Development finance · elections · climate',              badge: '61% ◉' },
        ]},
        { type: 'text', label: '◎ REGIONS NOTE', value: '"You follow 2 of 6 regions. Adding Africa or Middle East to your feed would push your perspective diversity score from 7.8 to an estimated 8.6 — and surface stories you\'re currently missing entirely."' },
      ],
    },

    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'READER PROFILE · A. THATCHER', value: 'Diversity: 7.8/10', sub: '14-day streak · 312 stories read · 47 countries · top 12% of readers · WELT since 2024' },
        { type: 'metric-row', items: [
          { label: 'STORIES',  value: '312'  },
          { label: 'COUNTRIES',value: '47'   },
          { label: 'STREAK',   value: '14d'  },
        ]},
        { type: 'tags', label: 'FOLLOWED TOPICS', items: ['AI Governance', 'Climate Policy', 'Geopolitics', 'Tech Regulation'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Diversity score: 7.8/10',       sub: 'Reading spans 5 world regions · top 12% · actively seeking counter-narratives', badge: '◈ TOP 12' },
          { icon: 'check', title: 'Europe — 118 stories (38%)',    sub: 'Your most-read region · AI + climate + governance dominant topics',           badge: '◉ EU'    },
          { icon: 'heart', title: 'East Asia — 68 stories (22%)',  sub: 'Technology + trade policy focus · growing this quarter',                     badge: '◉ AS'    },
          { icon: 'map',   title: 'Americas — 81 stories (26%)',   sub: 'Economy + climate mix · US + Brazil dominant coverage',                      badge: '◉ AM'    },
          { icon: 'play',  title: 'Suggestion: read Africa today', sub: 'Development finance story today — outside your usual regions — +0.8 diversity', badge: '+ 0.8'  },
        ]},
        { type: 'text', label: '◎ PROFILE INSIGHT', value: '"Your reading is strong but skews heavily Western. Adding one African or South Asian story daily would raise your diversity score toward 9.0 in about 3 weeks. WELT\'s most-informed readers read uncomfortably widely."' },
      ],
    },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
fs.writeFileSync('welt-mock.html', html);
console.log('✓ Saved welt-mock.html locally');
console.log('Note: ZenBin quota exhausted — will publish on Apr 23 when quota resets');
