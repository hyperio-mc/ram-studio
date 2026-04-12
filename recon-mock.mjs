import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'RECON',
  tagline:   'AI-Powered Competitive Intelligence',
  archetype: 'productivity',
  palette: {
    bg:      '#070B12',
    surface: '#0D1320',
    text:    '#E8F0FC',
    accent:  '#6366F1',
    accent2: '#818CF8',
    muted:   'rgba(68,90,122,0.7)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Rivals Tracked', value: '24', sub: 'across 8 industries' },
        { type: 'metric-row', items: [
          { label: 'Signals', value: '137' },
          { label: 'Threat Idx', value: '6.4' },
          { label: 'Watches', value: '12' },
        ]},
        { type: 'text', label: 'AI Insight ◈', value: 'NovaTech quietly launched API beta — watch for developer integrations this week.' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Acme Corp', sub: 'New feature launch detected', badge: '↑18%' },
          { icon: 'alert', title: 'NovaTech', sub: 'API beta page published', badge: '↓12%' },
          { icon: 'activity', title: 'Vertex AI', sub: 'Funding round signals', badge: '↑9%' },
        ]},
        { type: 'progress', items: [
          { label: 'Pricing Watch', pct: 85 },
          { label: 'Job Postings', pct: 92 },
          { label: 'Product Releases', pct: 64 },
        ]},
      ],
    },
    {
      id: 'rivals', label: 'Rivals',
      content: [
        { type: 'metric', label: 'Total Rivals', value: '24', sub: 'actively monitored' },
        { type: 'list', items: [
          { icon: 'star', title: 'Acme Corp', sub: 'Direct · Score: 82', badge: '↑18%' },
          { icon: 'alert', title: 'NovaTech', sub: 'Emerging · Score: 71', badge: '↓12%' },
          { icon: 'zap', title: 'Vertex AI', sub: 'Direct · Score: 64', badge: '↑9%' },
          { icon: 'eye', title: 'Spectra Inc', sub: 'Watch · Score: 58', badge: '↓4%' },
        ]},
        { type: 'tags', label: 'Threat Types', items: ['Pricing', 'Product', 'Team', 'Funding', 'API'] },
      ],
    },
    {
      id: 'feed', label: 'Feed',
      content: [
        { type: 'text', label: '⚡ CRITICAL · NovaTech · 2 min ago', value: 'API beta page went live — developer docs, pricing tiers, and OAuth 2.0 flow detected.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Acme Corp Pricing', sub: 'Pro tier +$12/mo · 18 min ago', badge: '🔴 HIGH' },
          { icon: 'user', title: 'Vertex AI Team', sub: '+14 ML engineers · 1h ago', badge: '🟡 MED' },
          { icon: 'code', title: 'Spectra Blog', sub: 'Architecture overhaul signals · 2h ago', badge: '🔵 LOW' },
          { icon: 'star', title: 'Acme Hiring', sub: 'Head of Partnerships · 4h ago', badge: '🟡 MED' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All', 'Critical', 'Pricing', 'Product', 'Team'] },
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '14' },
          { label: 'Avg Pages', value: '15.6' },
          { label: 'This Week', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Weekly Intelligence Brief', sub: 'Mar 17 · 12 pages', badge: '✓ Ready' },
          { icon: 'check', title: 'Pricing Strategy Analysis', sub: 'Mar 14 · 8 pages', badge: '✓ Ready' },
          { icon: 'check', title: 'NovaTech Deep Dive', sub: 'Mar 10 · 18 pages', badge: '✓ Ready' },
          { icon: 'layers', title: 'Q1 Market Shifts', sub: 'Mar 1 · 24 pages', badge: '📁 Archive' },
        ]},
        { type: 'text', label: 'Generate Report', value: 'AI compiles full competitor analysis from raw signals. Weekly briefs ready in ~2 minutes.' },
      ],
    },
    {
      id: 'sources', label: 'Sources',
      content: [
        { type: 'metric', label: 'Active Sources', value: '4', sub: '1,923 data points today' },
        { type: 'list', items: [
          { icon: 'eye', title: 'Web Crawler', sub: '847 pages · Every 4h', badge: '✓ On' },
          { icon: 'user', title: 'LinkedIn Monitor', sub: '24 rivals · Every 4h', badge: '✓ On' },
          { icon: 'activity', title: 'News API', sub: '14 feeds · Every 4h', badge: '✓ On' },
          { icon: 'code', title: 'GitHub Tracker', sub: '38 repos · Every 4h', badge: '✓ On' },
          { icon: 'star', title: 'G2 Reviews', sub: '2.4K reviews', badge: '○ Off' },
          { icon: 'share', title: 'Twitter/X', sub: 'Social mentions', badge: '○ Off' },
        ]},
        { type: 'tags', label: 'Status', items: ['4 Active', '2 Inactive', 'Add Source'] },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Home',    icon: 'home' },
    { id: 'rivals',   label: 'Rivals',  icon: 'layers' },
    { id: 'feed',     label: 'Feed',    icon: 'zap' },
    { id: 'reports',  label: 'Reports', icon: 'chart' },
    { id: 'sources',  label: 'Sources', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock for RECON...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'recon-mock', 'RECON — Interactive Mock');
console.log('Mock live at:', result.url);
