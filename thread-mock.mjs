import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'THREAD',
  tagline:   'every thought, connected',
  archetype: 'pkm-knowledge-graph',

  // DARK palette (primary)
  palette: {
    bg:      '#0C0B0F',
    surface: '#16141C',
    text:    '#EBE8F5',
    accent:  '#8B6FE8',
    accent2: '#52B88A',
    muted:   'rgba(235,232,245,0.35)',
  },

  // LIGHT palette
  lightPalette: {
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#1A1628',
    accent:  '#6B4ED4',
    accent2: '#3A8F66',
    muted:   'rgba(26,22,40,0.4)',
  },

  screens: [
    {
      id: 'today',
      label: "Today",
      content: [
        { type: 'text', label: 'TUE · 24 MAR 2026', value: "Today's Note" },
        { type: 'metric-row', items: [
          { label: 'WORDS', value: '247' },
          { label: 'LINKS',  value: '18'  },
          { label: 'NOTES',  value: '3'   },
        ]},
        { type: 'text', label: 'Morning thoughts', value: 'The problem with most PKM systems: they optimize for input, not retrieval. Every thought dumped in, but never surfaced when needed.' },
        { type: 'tags', label: 'Linked', items: ['[[Spaced repetition]]', '[[Info overload]]', '[[PKM]]'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Finish THREAD design sprint', sub: 'Completed', badge: '☑' },
          { icon: 'list',  title: 'Review [[API latency notes]]', sub: 'Pending', badge: '☐' },
          { icon: 'list',  title: 'Write [[Weekly review]]', sub: 'Pending', badge: '☐' },
        ]},
        { type: 'text', label: 'BACKLINKS · 4', value: '' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Information overload', sub: 'See also: Inbox zero philosophy', badge: '3→' },
          { icon: 'layers', title: 'Spaced repetition',   sub: 'Anki vs natural linking',         badge: '5→' },
        ]},
      ],
    },
    {
      id: 'graph',
      label: 'Graph',
      content: [
        { type: 'metric', label: 'KNOWLEDGE GRAPH', value: '247', sub: '1,840 connections across all notes' },
        { type: 'text', label: 'Active clusters', value: 'Design Systems → Typography, Components, Tokens, Grid · PKM → Zettelkasten, Spaced Repetition, Linking · Cognition bridges the two clusters.' },
        { type: 'progress', items: [
          { label: 'Design cluster',   pct: 88 },
          { label: 'PKM cluster',      pct: 72 },
          { label: 'Reading cluster',  pct: 54 },
          { label: 'Code cluster',     pct: 41 },
        ]},
        { type: 'tags', label: 'Node types', items: ['◉ Topic', '◉ Concept', '◉ Bridge', '◉ Orphan'] },
        { type: 'text', label: 'View', value: 'Showing cluster: Design + PKM · 11 nodes · Zoom: 80%' },
      ],
    },
    {
      id: 'note',
      label: 'Notes',
      content: [
        { type: 'metric', label: 'Information Overload', value: '14 Mar', sub: '3 backlinks · 2 outgoing · 2 highlights' },
        { type: 'text', label: 'Note', value: 'The Paradox of Choice argues that more options lead to worse decisions. This applies equally to information consumption: more reading does not equal more clarity.' },
        { type: 'text', label: 'Key insight', value: 'More reading ≠ more clarity. Every notification consumes working memory before being classified as noise.' },
        { type: 'list', items: [
          { icon: 'star', title: 'Attention residue — Cal Newport',    sub: 'Outgoing link', badge: '→' },
          { icon: 'star', title: 'Deep Work — active vs passive',      sub: 'Outgoing link', badge: '→' },
          { icon: 'star', title: 'Zettelkasten — atomic note',         sub: 'Outgoing link', badge: '→' },
        ]},
        { type: 'text', label: 'HIGHLIGHTS · 2', value: '"The cure for information overload is not more filtering — it is better questions." · "Every open tab is a cognitive debt you will eventually pay."' },
      ],
    },
    {
      id: 'capture',
      label: 'Capture',
      content: [
        { type: 'text', label: 'Quick Capture', value: 'The way we consume information determines what we think about. Design apps to match reading intent, not dopamine loops. ▌' },
        { type: 'metric-row', items: [
          { label: 'WORDS', value: '38' },
          { label: 'CHARS', value: '210' },
        ]},
        { type: 'text', label: '✦ AI SUGGESTED LINKS', value: '' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Information overload',    sub: 'Strong match', badge: '+ Link' },
          { icon: 'zap', title: 'Deep Work (Newport)',     sub: 'Strong match', badge: '+ Link' },
          { icon: 'zap', title: 'Attention economics',     sub: 'Possible match', badge: '+ Link' },
          { icon: 'zap', title: 'PKM systems',             sub: 'Possible match', badge: '+ Link' },
        ]},
        { type: 'tags', label: 'Tags', items: ['#pkm', '#reading', '#design'] },
      ],
    },
    {
      id: 'search',
      label: 'Search',
      content: [
        { type: 'text', label: 'Search', value: '⊕ Search your threads…' },
        { type: 'text', label: 'RECENTLY VIEWED', value: '' },
        { type: 'list', items: [
          { icon: 'eye', title: 'Information overload', sub: '3 links',  badge: '↗' },
          { icon: 'eye', title: 'Deep Work',            sub: '7 links',  badge: '↗' },
          { icon: 'eye', title: 'Spaced repetition',    sub: '5 links',  badge: '↗' },
          { icon: 'eye', title: 'Design systems',       sub: '12 links', badge: '↗' },
          { icon: 'eye', title: 'Attention residue',    sub: '2 links',  badge: '↗' },
        ]},
        { type: 'metric-row', items: [
          { label: 'NOTES',  value: '247' },
          { label: 'LINKS',  value: '1,840' },
          { label: 'TAGS',   value: '18' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'home'     },
    { id: 'graph',   label: 'Graph',   icon: 'grid'     },
    { id: 'note',    label: 'Notes',   icon: 'list'     },
    { id: 'capture', label: 'Capture', icon: 'plus'     },
    { id: 'search',  label: 'Search',  icon: 'search'   },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'thread-mock', 'THREAD — Interactive Mock');
console.log('Mock live at:', result.url);
