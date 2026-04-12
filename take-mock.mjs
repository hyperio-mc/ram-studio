import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Take',
  tagline:   'Prompt. Generate. Cut.',
  archetype: 'ai-video-studio',
  palette: {
    bg:      '#09090B',
    surface: '#111115',
    text:    '#F0EEF8',
    accent:  '#FF5240',
    accent2: '#2DD4BF',
    muted:   'rgba(139,137,151,0.45)',
  },
  lightPalette: {
    bg:      '#F5F5F7',
    surface: '#FFFFFF',
    text:    '#09090B',
    accent:  '#E03020',
    accent2: '#0D9488',
    muted:   'rgba(9,9,11,0.4)',
  },
  screens: [
    {
      id: 'studio', label: 'Studio',
      content: [
        { type: 'metric-row', items: [
          { label: 'Projects', value: '12' },
          { label: 'GPU Credits', value: '840' },
          { label: 'Rendering', value: '2' },
        ]},
        { type: 'text', label: 'Active Render', value: 'Mountain sunrise timelapse — Cinematic 4K · 78% complete · ~14s remaining' },
        { type: 'list', items: [
          { icon: 'video', title: 'Mountain Sunrise',   sub: 'Cinematic · rendering',        badge: '78%' },
          { icon: 'video', title: 'City Streets Rain',  sub: 'Photorealistic · completed',   badge: 'DONE' },
          { icon: 'video', title: 'Neon Cityscape',     sub: 'Anime style · draft',          badge: 'EDIT' },
          { icon: 'video', title: 'Ocean Fog',          sub: 'Documentary · queued',         badge: 'Q:3' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['New Project', 'Import Clip', 'Browse Library', 'Templates'] },
      ],
    },
    {
      id: 'generate', label: 'Generate',
      content: [
        { type: 'text', label: 'Prompt', value: 'Golden hour sunlight filters through fog over a mountain valley, cinematic slow motion, 4K aerial drone shot' },
        { type: 'metric-row', items: [
          { label: 'Style', value: 'Cinematic' },
          { label: 'Ratio', value: '16:9' },
          { label: 'Duration', value: '10s' },
        ]},
        { type: 'tags', label: 'Style Presets', items: ['Cinematic', 'Anime', 'Photorealistic', 'Abstract', 'Documentary'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Model: Take-V2 Pro',    sub: 'highest quality · 4K output',   badge: 'PRO' },
          { icon: 'check', title: 'Reference Image',       sub: 'uploaded · 1 image',            badge: 'SET' },
          { icon: 'check', title: 'Queue Position: #2',    sub: 'est. 18s generation time',      badge: 'WAIT' },
        ]},
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'metric-row', items: [
          { label: 'Duration', value: '0:34' },
          { label: 'Clips', value: '6' },
          { label: 'Tracks', value: '3' },
        ]},
        { type: 'tags', label: 'AI Enhance', items: ['Upscale 4K', 'Style Transfer', 'Stabilize', 'Denoise', 'AI Fix'] },
        { type: 'progress', items: [
          { label: 'VIDEO lane', pct: 82 },
          { label: 'AUDIO lane', pct: 100 },
          { label: 'AI enhancements', pct: 45 },
        ]},
        { type: 'list', items: [
          { icon: 'video', title: 'Clip 1 — Mountain fog',   sub: 'Violet · 0:00–0:08',   badge: '8s' },
          { icon: 'video', title: 'Clip 2 — Valley pan',     sub: 'Coral · 0:08–0:14',    badge: '6s' },
          { icon: 'video', title: 'Clip 3 — Aerial wide',    sub: 'Teal · 0:14–0:22',     badge: '8s' },
        ]},
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Videos', value: '48' },
          { label: 'Storage', value: '12.4 GB' },
          { label: 'Selected', value: '0' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Cinematic', 'Anime', 'Photorealistic', 'Recent'] },
        { type: 'list', items: [
          { icon: 'video', title: 'Mountain Sunrise', sub: 'Cinematic · 10s · 4K',        badge: '1.2GB' },
          { icon: 'video', title: 'City Streets',     sub: 'Photorealistic · 8s · 4K',   badge: '890MB' },
          { icon: 'video', title: 'Neon Cityscape',   sub: 'Anime · 12s · 1080p',        badge: '640MB' },
          { icon: 'video', title: 'Ocean Fog',        sub: 'Documentary · 15s · 4K',     badge: '1.8GB' },
          { icon: 'video', title: 'Desert Dunes',     sub: 'Cinematic · 10s · 4K',       badge: '1.1GB' },
          { icon: 'video', title: 'Forest Rain',      sub: 'Abstract · 8s · 1080p',      badge: '520MB' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric', label: 'Total Views', value: '284.7K', sub: '+12.4% this week' },
        { type: 'metric-row', items: [
          { label: 'Instagram', value: '142K' },
          { label: 'TikTok',    value: '89K' },
          { label: 'YouTube',   value: '53K' },
        ]},
        { type: 'progress', items: [
          { label: 'Mountain Sunrise  (top take)', pct: 100 },
          { label: 'City Streets Rain',             pct: 71 },
          { label: 'Neon Cityscape',                pct: 48 },
          { label: 'Ocean Fog',                     pct: 36 },
        ]},
        { type: 'tags', label: 'Period', items: ['7D', '30D', '90D', 'All Time'] },
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric-row', items: [
          { label: 'Plan',     value: 'Pro' },
          { label: 'Credits',  value: '840' },
          { label: 'API Keys', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Default Model: Take-V2 Pro', sub: 'highest quality enabled',    badge: 'ON' },
          { icon: 'check', title: 'Auto-enhance after gen',     sub: 'upscale + stabilize',        badge: 'ON' },
          { icon: 'check', title: 'Watermark removed',          sub: 'Pro plan benefit',           badge: 'OFF' },
          { icon: 'check', title: 'Storage auto-archive',       sub: 'after 90 days',              badge: 'ON' },
        ]},
        { type: 'text', label: 'Upgrade to Studio', value: 'Unlimited GPU credits, 8K output, team collaboration, priority rendering queue, and custom model fine-tuning.' },
      ],
    },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'take');
const result = await publishMock(built, 'take');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/take-mock`);
