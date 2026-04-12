import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LORE',
  tagline:   'Story intelligence workspace for screenwriters',
  archetype: 'story-intelligence',
  palette: {
    bg:      '#080B12',
    surface: '#0E1320',
    text:    '#EAE6DC',
    accent:  '#6B4FE8',
    accent2: '#B8984A',
    muted:   'rgba(234,230,220,0.38)',
  },
  lightPalette: {
    bg:      '#F5F3EE',
    surface: '#FFFFFF',
    text:    '#12151F',
    accent:  '#5A3FD8',
    accent2: '#9A7A30',
    muted:   'rgba(18,21,31,0.4)',
  },
  screens: [
    {
      id: 'universe', label: 'Universe',
      content: [
        { type: 'metric-row', items: [
          { label: 'ACTS', value: '3/5' },
          { label: 'WORDS', value: '42K' },
          { label: 'CHARS', value: '18' },
          { label: 'SCENES', value: '67' },
        ]},
        { type: 'progress', items: [
          { label: 'Act I — The Call', pct: 78 },
          { label: 'Act II-A — Descent', pct: 55 },
          { label: 'Act II-B — The Turn', pct: 30 },
          { label: 'Act III — Resolution', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Lyra Ashveil — motives updated', sub: '2h ago', badge: '◉' },
          { icon: 'edit', title: 'Scene 34 "The Mirror Room" drafted', sub: '5h ago', badge: '◌' },
          { icon: 'layers', title: 'Thread: The Pale War marked active', sub: '1d ago', badge: '◧' },
          { icon: 'map', title: 'Stonehavre Fortress added to Lore', sub: '2d ago', badge: '◫' },
        ]},
        { type: 'text', label: 'Story Graph', value: '18 characters · 24 connections · 6 clusters' },
      ],
    },
    {
      id: 'characters', label: 'Characters',
      content: [
        { type: 'metric', label: 'ACTIVE ROLES', value: '18', sub: 'characters tracked' },
        { type: 'list', items: [
          { icon: 'user', title: 'Lyra Ashveil', sub: 'PROTAGONIST · 34 scenes · 8 links', badge: '72%' },
          { icon: 'user', title: 'Calder Voss', sub: 'ANTAGONIST · 28 scenes · 11 links', badge: '60%' },
          { icon: 'user', title: 'Maren Sol', sub: 'SUPPORT · 16 scenes · 5 links', badge: '45%' },
          { icon: 'user', title: 'The Archivist', sub: 'MYSTERY · 7 scenes · 3 links', badge: '15%' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Protagonist', 'Antagonist', 'Support', 'Mystery'] },
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'text', label: 'Story', value: 'The Pale Kingdom — Dramatic Arc Beat Sheet' },
        { type: 'list', items: [
          { icon: 'check', title: 'SC.01 — Opening Image', sub: 'Lyra in the ruins of Ashveil Keep', badge: '✓' },
          { icon: 'check', title: 'SC.05 — Inciting Incident', sub: "The Pale King's seal found in the library", badge: '✓' },
          { icon: 'star', title: 'SC.12 — Break Into Two', sub: "Lyra accepts Maren's offer to cross the Pale", badge: '~' },
          { icon: 'activity', title: 'SC.21 — Midpoint', sub: 'Archivist appears — allegiances shift', badge: '○' },
          { icon: 'alert', title: 'SC.34 — Dark Night of Soul', sub: "Maren's betrayal revealed", badge: '○' },
          { icon: 'zap', title: 'SC.46 — Climax', sub: 'Confrontation at the Pale Throne', badge: '·' },
          { icon: 'eye', title: 'SC.54 — Final Image', sub: 'Mirror of opening — transformation complete', badge: '·' },
        ]},
      ],
    },
    {
      id: 'lore', label: 'Lore',
      content: [
        { type: 'metric-row', items: [
          { label: 'LOCATIONS', value: '12' },
          { label: 'FACTIONS', value: '7' },
          { label: 'ARTIFACTS', value: '9' },
          { label: 'EVENTS', value: '15' },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Stonehavre Fortress', sub: "FORTIFICATION · Pale King's seat · CRITICAL", badge: '★' },
          { icon: 'map', title: 'The Ashen Crossing', sub: 'WILDERNESS · Treacherous pass · MAJOR', badge: '◉' },
          { icon: 'layers', title: 'Library of Immured Voices', sub: "INSTITUTION · Archivist's domain · MAJOR", badge: '◉' },
          { icon: 'home', title: 'Ashveil Keep (Ruined)', sub: "ORIGIN · Lyra's birthplace · SYMBOLIC", badge: '○' },
        ]},
      ],
    },
    {
      id: 'threads', label: 'Threads',
      content: [
        { type: 'metric-row', items: [
          { label: 'ACTIVE', value: '6' },
          { label: 'STALLED', value: '2' },
          { label: 'RESOLVED', value: '3' },
          { label: 'PLANTED', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'The Pale Inheritance', sub: 'ACTIVE · 23 scenes · CRITICAL · woven 60%', badge: '60%' },
          { icon: 'activity', title: "The Archivist's Game", sub: 'ACTIVE · 12 scenes · MAJOR · woven 40%', badge: '40%' },
          { icon: 'star', title: "Maren's Betrayal", sub: 'PLANTED · 8 scenes · MAJOR · woven 25%', badge: '25%' },
          { icon: 'alert', title: 'The Second Seal', sub: 'STALLED · 4 scenes · needs resolution path', badge: '10%' },
          { icon: 'heart', title: "Lyra's True Name", sub: 'ACTIVE · 31 scenes · SYMBOLIC · woven 72%', badge: '72%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'universe',   label: 'Universe',    icon: 'layers' },
    { id: 'characters', label: 'Characters',   icon: 'user' },
    { id: 'timeline',   label: 'Timeline',     icon: 'activity' },
    { id: 'lore',       label: 'Lore',         icon: 'map' },
    { id: 'threads',    label: 'Threads',       icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lore-mock', 'LORE — Interactive Story Intelligence Mock');
console.log('Mock live at:', result.url);
