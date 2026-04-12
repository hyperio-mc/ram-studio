import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Podium',
  tagline:   'The talks worth your time.',
  archetype: 'conference-discovery',
  palette: {
    bg:      '#0F0E0E',
    surface: '#1A1918',
    text:    '#F2EFE8',
    accent:  '#7C7FFA',
    accent2: '#2EC4B6',
    muted:   'rgba(242,239,232,0.40)',
  },
  lightPalette: {
    bg:      '#F7F4EE',
    surface: '#FFFFFF',
    text:    '#16130E',
    accent:  '#635BFF',
    accent2: '#2EC4B6',
    muted:   'rgba(22,19,14,0.45)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'text', label: 'Morning', value: 'Your week in conferences.', sub: 'Good morning, Alex. 4 talks saved across 2 conferences.' },
        { type: 'metric-row', items: [
          { label: 'Saved', value: '4' },
          { label: 'Conferences', value: '2' },
          { label: 'This Week', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Designing for Agentic Systems', sub: 'Maria Chen · Config 2026 · 2:30 PM', badge: 'AI/ML' },
          { icon: 'layers', title: 'The New Shape of Design Systems', sub: 'Figma Config · Tomorrow · Room 2', badge: 'Design' },
          { icon: 'chart', title: 'Pricing Psychology in SaaS', sub: 'SaaStr Annual · Apr 5', badge: 'Growth' },
        ]},
        { type: 'tags', label: 'Your Topics', items: ['AI / ML', 'Design Systems', 'Growth', 'DevEx', 'Product'] },
      ],
    },
    {
      id: 'agenda', label: 'Agenda',
      content: [
        { type: 'metric', label: 'April 29', value: '4 talks', sub: 'Stripe Sessions 2026 · Moscone West, SF' },
        { type: 'list', items: [
          { icon: 'play',   title: '9:00 AM — Opening Keynote',              sub: 'Patrick Collison · Main Stage',  badge: '✓' },
          { icon: 'layers', title: '10:30 AM — New Shape of Design Systems', sub: 'Juliana Perez · Room 2',          badge: '✓' },
          { icon: 'star',   title: '2:30 PM — Designing for Agentic Systems', sub: 'Maria Chen · Hall A',            badge: '✓' },
          { icon: 'chart',  title: '4:15 PM — Revenue Models in the AI Age', sub: 'David Sacks · Growth Stage',     badge: '✓' },
        ]},
        { type: 'text', label: '⚠ Conflict Detected', value: '10:30 AM talk overlaps with "Pricing Psychology" (SaaStr).' },
      ],
    },
    {
      id: 'speaker', label: 'Speaker',
      content: [
        { type: 'metric', label: 'Maria Chen', value: 'Head of Design', sub: 'Anthropic · 3.2K followers · 98% rating' },
        { type: 'metric-row', items: [
          { label: 'Talks', value: '12' },
          { label: 'Followers', value: '3.2K' },
          { label: 'Rating', value: '98%' },
        ]},
        { type: 'text', label: 'About', value: 'Maria leads design at Anthropic, focusing on making AI systems understandable, trustworthy, and usable by everyone. Former design lead at Figma.' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Designing for Agentic Systems', sub: 'Config 2026 · Apr 29, 2:30 PM', badge: 'Saved' },
          { icon: 'calendar', title: 'Trust Layers in Multi-Agent Systems', sub: 'NeurIPS 2026 · Jun 12', badge: 'New' },
        ]},
      ],
    },
    {
      id: 'browse', label: 'Browse',
      content: [
        { type: 'metric', label: 'AI / ML Filter Active', value: '48 talks', sub: 'Across 6 conferences this season' },
        { type: 'tags', label: 'Active Filters', items: ['✦ AI / ML', 'Design', 'Growth', 'DevEx'] },
        { type: 'list', items: [
          { icon: 'star',    title: 'Designing for Agentic Systems',    sub: 'Maria Chen · Config 2026 · Apr 29',   badge: '✓ Saved' },
          { icon: 'zap',     title: 'AI-Powered Payment Optimisation',  sub: 'Dhruv Malhotra · Stripe Sessions',     badge: 'Save' },
          { icon: 'layers',  title: 'The New Shape of Design Systems',  sub: 'Juliana Perez · Figma Config',         badge: '✓ Saved' },
          { icon: 'chart',   title: 'Revenue Models in the AI Age',     sub: 'David Sacks · SaaStr Annual',          badge: 'Save' },
        ]},
      ],
    },
    {
      id: 'talk', label: 'Talk Detail',
      content: [
        { type: 'metric', label: 'AI / ML · Config 2026', value: 'Designing for Agentic Systems', sub: 'Trust, Error & Recovery' },
        { type: 'metric-row', items: [
          { label: 'Date', value: 'Apr 29' },
          { label: 'Duration', value: '45 min' },
          { label: 'Room', value: 'Hall A' },
        ]},
        { type: 'text', label: 'About', value: 'As AI agents take on more complex tasks, design challenges multiply: How do we communicate uncertainty? How should errors surface and recover? This talk explores trust patterns for agentic UI.' },
        { type: 'tags', label: 'Topics', items: ['AI Design', 'UX Patterns', 'Product', 'Trust', 'Error Handling'] },
        { type: 'list', items: [
          { icon: 'user', title: 'Maria Chen', sub: 'Head of Design · Anthropic', badge: 'Follow' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'home' },
    { id: 'agenda',   label: 'Agenda',   icon: 'calendar' },
    { id: 'browse',   label: 'Browse',   icon: 'search' },
    { id: 'talk',     label: 'Talk',     icon: 'play' },
    { id: 'speaker',  label: 'Speaker',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'podium-mock', 'Podium — Interactive Mock');
console.log('Mock live at:', result.url);
