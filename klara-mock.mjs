import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KLARA',
  tagline:   'surface what you know',
  archetype: 'developer-knowledge-base',
  palette: {
    bg:      '#080A0D',
    surface: '#0D1117',
    text:    '#E0E6ED',
    accent:  '#39FF14',
    accent2: '#00C8FF',
    muted:   'rgba(139,149,161,0.45)',
  },
  lightPalette: {
    bg:      '#F4F6F8',
    surface: '#FFFFFF',
    text:    '#1A2332',
    accent:  '#1A8C00',
    accent2: '#0084A8',
    muted:   'rgba(26,35,50,0.4)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'ENTRIES', value: '2,847' },
          { label: 'LINKS', value: '9,203' },
          { label: 'TOPICS', value: '184' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Diffusion models — cross-attention', sub: 'ML · THEORY · 2m ago', badge: '92' },
          { icon: 'code', title: 'React Server Components caching', sub: 'REACT · PERF · 18m ago', badge: '87' },
          { icon: 'code', title: 'Temporal API timezone edge cases', sub: 'JS · DATE · 1h ago', badge: '75' },
          { icon: 'layers', title: 'PostgreSQL partial indexes', sub: 'DB · PERF · 3h ago', badge: '81' },
        ]},
        { type: 'progress', items: [
          { label: 'Machine Learning', pct: 34 },
          { label: 'Systems Design', pct: 22 },
          { label: 'JavaScript / TS', pct: 18 },
          { label: 'Databases', pct: 14 },
        ]},
        { type: 'text', label: 'System Status', value: 'NOMINAL · INDEX LIVE · SYNC CURRENT' },
      ],
    },
    {
      id: 'search', label: 'Search',
      content: [
        { type: 'metric', label: 'RESULTS', value: '47', sub: '"diffusion attention layers"' },
        { type: 'tags', label: 'Filters', items: ['ALL', 'ML', 'SYSTEMS', 'JS', 'DB', 'PAPERS'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Cross-attention in diffusion — Q/K/V', sub: 'NOTE · 97% relevance · 2 days ago', badge: '97' },
          { icon: 'eye', title: 'Self-attention vs cross-attention', sub: 'PAPER · 91% relevance · 1 week ago', badge: '91' },
          { icon: 'layers', title: 'Stable Diffusion UNet layer by layer', sub: 'NOTE · 88% relevance · 3 days ago', badge: '88' },
          { icon: 'code', title: 'DDPM vs DDIM sampling explained', sub: 'SUMMARY · 82% relevance · 5 days ago', badge: '82' },
          { icon: 'activity', title: 'LoRA fine-tuning — attention injection', sub: 'NOTE · 79% relevance · 1 week ago', badge: '79' },
        ]},
      ],
    },
    {
      id: 'capture', label: 'Capture',
      content: [
        { type: 'tags', label: 'Source Type', items: ['NOTE', 'PAPER', 'URL', 'CODE', 'IDEA'] },
        { type: 'text', label: 'Title', value: 'Attention mechanism — cross vs self' },
        { type: 'text', label: 'Content', value: 'Cross-attention allows a model to attend to information from a different sequence. Q comes from image latent, K/V from text encoder.' },
        { type: 'tags', label: 'Topics', items: ['ML', 'ATTENTION', 'TRANSFORMERS'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Diffusion models overview', sub: 'Linked entry', badge: '◈' },
          { icon: 'code', title: 'Transformer architecture', sub: 'Linked entry', badge: '◈' },
        ]},
        { type: 'text', label: 'AI Assist', value: 'Suggest 3 related entries to link? → YES' },
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'QUALITY SCORE', value: '92', sub: 'Diffusion models — cross-attention mechanics' },
        { type: 'tags', label: 'Tags', items: ['ML', 'DIFFUSION', 'ATTENTION', 'UNet'] },
        { type: 'text', label: 'Content', value: 'Cross-attention is the mechanism that allows diffusion models to condition on text. Q ← image latent. K, V ← text encoder (CLIP/T5). Attention output routes text meaning into spatial feature maps.' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Transformer architecture', sub: 'FOUNDATIONAL · 94% strength', badge: '94%' },
          { icon: 'eye', title: 'Stable Diffusion UNet layers', sub: 'RELATED · 89% strength', badge: '89%' },
          { icon: 'code', title: 'CLIP text encoder internals', sub: 'RELATED · 83% strength', badge: '83%' },
        ]},
      ],
    },
    {
      id: 'graph', label: 'Graph',
      content: [
        { type: 'tags', label: 'View', items: ['ALL NODES', 'ML CLUSTER', 'SYSTEMS', 'RECENT'] },
        { type: 'metric-row', items: [
          { label: 'NODES', value: '184' },
          { label: 'EDGES', value: '9.2K' },
          { label: 'CLUSTERS', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Diffusion Models', sub: 'Core · 12 connections · ML cluster', badge: '●' },
          { icon: 'star', title: 'Cross Attention', sub: 'Core · 9 connections · ML cluster', badge: '●' },
          { icon: 'layers', title: 'UNet Architecture', sub: 'Support · 7 connections', badge: '○' },
          { icon: 'code', title: 'Latent Space', sub: 'Support · 6 connections', badge: '○' },
        ]},
        { type: 'progress', items: [
          { label: 'Depth', pct: 60 },
        ]},
      ],
    },
    {
      id: 'team', label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'MEMBERS', value: '4' },
          { label: 'SHARED', value: '2,847' },
          { label: 'HEALTH', value: '78%' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Alex Chen — LEAD', sub: '987 entries · online', badge: '●' },
          { icon: 'user', title: 'Sam Rivera — RESEARCHER', sub: '634 entries · online', badge: '●' },
          { icon: 'user', title: 'Morgan Liu — ENGINEER', sub: '743 entries · away', badge: '○' },
          { icon: 'user', title: 'Jordan Park — ANALYST', sub: '483 entries · away', badge: '○' },
        ]},
        { type: 'progress', items: [
          { label: 'Link density', pct: 78 },
          { label: 'Topic coverage', pct: 64 },
        ]},
        { type: 'text', label: 'Latest', value: 'Alex Chen added note: RLHF — reward model design · 4m ago' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'capture', label: 'New', icon: 'plus' },
    { id: 'graph', label: 'Graph', icon: 'grid' },
    { id: 'team', label: 'Team', icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'klara');
const result = await publishMock(built, 'klara-mock', 'KLARA — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/klara-mock`);
