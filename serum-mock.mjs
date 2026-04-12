import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SERUM',
  tagline:   'Know your skin.',
  archetype: 'ai-skin-intelligence-light',
  palette: {
    bg:      '#FAF7F4',
    surface: '#FFFFFF',
    text:    '#1A1612',
    accent:  '#C46B5A',
    accent2: '#7B9B77',
    muted:   'rgba(26,22,18,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7F4',
    surface: '#FFFFFF',
    text:    '#1A1612',
    accent:  '#C46B5A',
    accent2: '#7B9B77',
    muted:   'rgba(26,22,18,0.45)',
  },
  nav: [
    { id: 'scan',      label: '⊙ Scan' },
    { id: 'dashboard', label: '◫ Dashboard' },
    { id: 'analysis',  label: '◈ Analysis' },
    { id: 'routine',   label: '◻ Routine' },
    { id: 'progress',  label: '∿ Progress' },
  ],
  screens: [
    {
      id: 'scan',
      label: 'Scan',
      hero: {
        eyebrow: '⊙ AI SKIN SCAN',
        title:   'Skin Score: 74',
        subtitle: 'Apr 4, 2026 · Last scan 2 hours ago · AR analysis complete',
        tag:     '◈ AI insight ready',
      },
      metrics: [
        { label: 'HYDRATION',  value: '68%', delta: '↓8%', up: false },
        { label: 'CLARITY',    value: '82%', delta: '+4%',  up: true  },
        { label: 'UV LEVEL',   value: 'Low', delta: 'Safe', up: true  },
      ],
      alerts: [
        { icon: '◈', msg: 'Hydration dropped 8% this week — add hyaluronic serum this AM', tag: 'AI', urgent: true },
        { icon: '☀', msg: 'UV index 3 today — SPF 50 still required', tag: 'UV',  urgent: false },
        { icon: '✦', msg: 'Clarity improved +4% since last scan', tag: 'Win', urgent: false },
      ],
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      hero: {
        eyebrow: '// YOUR SKIN TODAY',
        title:   'Dashboard',
        subtitle: 'Skin Score 74 · Up 3 pts from yesterday · 7-day trend positive',
        tag:     '◈ AI tip available',
      },
      metrics: [
        { label: 'HYDRATION',    value: '68%', delta: '↓ needs attention', up: false },
        { label: 'ELASTICITY',   value: '74%', delta: 'Good',               up: true  },
        { label: 'PORE CLARITY', value: '82%', delta: 'Excellent',          up: true  },
      ],
      items: [
        { label: 'Hydration — 68%',    sub: 'Below optimal. Hyaluronic serum morning + evening.', tag: '⚠ Moderate' },
        { label: 'Elasticity — 74%',   sub: 'On track. Collagen peptide serum helping.',           tag: '✓ Good' },
        { label: 'Pore Clarity — 82%', sub: 'Excellent. Weekly AHA maintaining results.',           tag: '✓ Excellent' },
        { label: 'UV Exposure — Low',  sub: 'SPF routine working. No new UV damage detected.',      tag: '✓ Protected' },
      ],
    },
    {
      id: 'analysis',
      label: 'Analysis',
      hero: {
        eyebrow: '// AI ANALYSIS · B+',
        title:   'AI Analysis',
        subtitle: 'Grade B+ · 3 active concerns · Next full scan in 5 days',
        tag:     '◈ 3 concerns found',
      },
      items: [
        { label: 'Dehydration Lines — Moderate', sub: 'Cause: Low water + AC. Fix: Hyaluronic serum AM + PM, 8+ glasses water.', tag: '⚠ Moderate' },
        { label: 'Uneven Texture — Mild',        sub: 'Cause: Product buildup, T-zone pores. Fix: Weekly AHA/BHA exfoliant.', tag: '· Mild' },
        { label: 'Dullness — Mild',              sub: 'Cause: Vitamin C below optimal. Fix: Vitamin C serum morning + daily SPF.', tag: '· Mild' },
      ],
    },
    {
      id: 'routine',
      label: 'Routine',
      hero: {
        eyebrow: '// MORNING ROUTINE',
        title:   'Routine',
        subtitle: '14-day streak · 2/5 steps done · Vitamin C is today\'s priority',
        tag:     '🔥 14-day streak',
      },
      items: [
        { label: '✓ Cleanser',          sub: 'CeraVe Hydrating Cleanser — done',              tag: '✓ Done' },
        { label: '✓ Toner',             sub: 'Klairs Supple Prep Toner — done',                tag: '✓ Done' },
        { label: 'Vitamin C Serum',     sub: "Paula's Choice C15 Super — KEY for dullness",   tag: '◈ AI Priority' },
        { label: 'Moisturiser',         sub: 'Cetaphil Moisturising Cream — not yet',          tag: '○ Pending' },
        { label: 'SPF 50+',             sub: 'Altruist Mineral — UV protection critical today', tag: '○ Pending' },
      ],
    },
    {
      id: 'progress',
      label: 'Progress',
      hero: {
        eyebrow: '∿ 30-DAY PROGRESS',
        title:   'Good progress, Anya.',
        subtitle: 'Skin score 61 → 74 · +13 points in 30 days · Hydration +12%',
        tag:     '✦ +13 pts overall',
      },
      metrics: [
        { label: 'HYDRATION',    value: '+12%', delta: '56→68', up: true },
        { label: 'PORE CLARITY', value: '+18%', delta: '64→82', up: true },
        { label: 'ELASTICITY',   value: '+6%',  delta: '68→74', up: true },
      ],
      items: [
        { label: 'Hydration: 56% → 68%',    sub: 'Hyaluronic serum added Mar 10 drove this gain.', tag: '+12%' },
        { label: 'Pore Clarity: 64% → 82%', sub: 'Weekly AHA exfoliant from Mar 15.',              tag: '+18%' },
        { label: 'Elasticity: 68% → 74%',   sub: 'Collagen peptides + improved sleep hygiene.',    tag: '+6%' },
        { label: 'Dullness: 72% → 80%',     sub: 'Vitamin C consistency improved radiance score.', tag: '+8%' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'serum-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
