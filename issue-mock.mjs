import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ISSUE',
  tagline:   'Curated reading for the curious.',
  archetype: 'editorial-magazine-reader',
  palette: {           // DARK theme (required)
    bg:      '#1A1714',
    surface: '#242020',
    text:    '#F5F0E8',
    accent:  '#E05515',
    accent2: '#5CA882',
    muted:   'rgba(245,240,232,0.45)',
  },
  lightPalette: {      // LIGHT theme — this is the primary theme
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#C2420A',
    accent2: '#2C5445',
    muted:   'rgba(26,23,20,0.45)',
  },
  nav: [
    { id: 'library',  label: '◎ Library' },
    { id: 'topics',   label: '☰ Topics' },
    { id: 'saved',    label: '♡ Saved' },
    { id: 'profile',  label: '⊙ Profile' },
  ],
  screens: [
    {
      id: 'library',
      label: 'Library',
      hero: {
        eyebrow: 'No. 47 · Apr 3, 2026',
        title:   'ISSUE',
        subtitle:'Curated reading for the curious',
        tag:     'Independent · 7,300+ issues',
      },
      featured: {
        tag: 'DESIGN',
        title: 'Vol. 12 — The Future of Craft',
        subtitle: 'How independent studios are reclaiming analog process.',
        meta: '12 essays · 34 min read',
      },
      items: [
        { label: 'Vol. 46 — Cities in Motion',     sub: '8 stories · 22 min', tag: 'URBAN' },
        { label: 'Vol. 45 — The Slow Web',          sub: '6 stories · 18 min', tag: 'TECH' },
        { label: 'Vol. 44 — Material Culture',      sub: '10 stories · 27 min', tag: 'ART' },
      ],
    },
    {
      id: 'topics',
      label: 'Issue View',
      hero: {
        eyebrow: 'Vol. 12 · DESIGN',
        title:   'The Future of Craft',
        subtitle:'12 essays · 2 read · Progress: 40%',
        tag:     'Continue reading →',
      },
      items: [
        { label: '01 · The Return of the Handmade',  sub: 'Mia Torrez · 8 min · ✓ Read', tag: 'Essay' },
        { label: "02 · Studio Hytta's Manifesto",     sub: 'Anders Holt · 5 min · ✓ Read', tag: 'Profile' },
        { label: '03 · Grain and Texture as Identity',sub: 'Jun Park · 3 min',             tag: 'Visual' },
        { label: '04 · Against Optimization',         sub: 'Clara Webb · 7 min',            tag: 'Opinion' },
        { label: '05 · Found Objects, New Forms',     sub: 'R. Oduya · 9 min',              tag: 'Feature' },
      ],
    },
    {
      id: 'saved',
      label: 'Article',
      hero: {
        eyebrow: 'ESSAY · 8 min · Vol. 12',
        title:   'The Return of the Handmade',
        subtitle:'Mia Torrez · Apr 3, 2026',
        tag:     '► Reading progress: 37%',
      },
      items: [
        { label: '"There is something the algorithm cannot fake:',  sub: 'the evidence of a human hand deciding."', tag: '— pull quote' },
        { label: 'Craft is not nostalgia. It is a practice of',     sub: 'deliberate slowness in an instant world.', tag: 'body' },
        { label: 'Studio Hytta workshop, Bergen, 2025',             sub: '↑ Photograph', tag: 'caption' },
        { label: 'Next: Studio Hytta\'s Manifesto →',               sub: 'Anders Holt · 5 min',                     tag: 'next' },
      ],
    },
    {
      id: 'profile',
      label: 'Topics',
      hero: {
        eyebrow: 'Discover',
        title:   'Topics',
        subtitle:'Filter by interest — 10 categories',
        tag:     'Active: Design · Architecture · Photography',
      },
      items: [
        { label: '◈ Design',        sub: '47 issues · active', tag: 'active' },
        { label: '◉ Technology',    sub: '38 issues',           tag: 'TECH' },
        { label: '⬡ Architecture',  sub: '31 issues · active',  tag: 'active' },
        { label: '◎ Photography',   sub: '28 issues · active',  tag: 'active' },
        { label: '✦ Writing',       sub: '24 issues',           tag: 'WRITING' },
        { label: '◷ Music',         sub: '19 issues',           tag: 'MUSIC' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'issue-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
