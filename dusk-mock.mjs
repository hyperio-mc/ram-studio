// dusk-mock.mjs
// DUSK — Privacy-First Web Analytics
// Svelte 5 interactive mock

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DUSK',
  tagline:   'Privacy-First Web Analytics',
  archetype: 'productivity',
  palette: {
    bg:      '#08000F',
    surface: '#120020',
    text:    '#FAFAFA',
    accent:  '#FF2D78',
    accent2: '#9D4EDD',
    muted:   'rgba(176,160,192,0.5)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Visitors Today', value: '3,841', sub: '↑ 12% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Pageviews', value: '9.2K' },
          { label: 'Bounce', value: '38%' },
          { label: 'Avg. Time', value: '2:34' },
        ]},
        { type: 'metric', label: '🔴 Live Now', value: '24', sub: 'visitors on your site right now' },
        { type: 'progress', items: [
          { label: '12:00 AM', pct: 22 },
          { label: '6:00 AM',  pct: 35 },
          { label: '12:00 PM', pct: 78 },
          { label: '6:00 PM',  pct: 91 },
          { label: 'Now',      pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: '/blog/2026-design-trends', sub: '1,204 visitors', badge: '↑ 31%' },
          { icon: 'chart', title: '/pricing',                 sub: '892 visitors',   badge: '↑ 8%' },
          { icon: 'chart', title: '/docs/getting-started',   sub: '631 visitors',   badge: '↓ 4%' },
          { icon: 'chart', title: '/about',                  sub: '289 visitors',   badge: '→ 0%' },
        ]},
      ],
    },
    {
      id: 'sources', label: 'Sources',
      content: [
        { type: 'metric', label: 'Total Visits Today', value: '3,841', sub: 'Across all channels' },
        { type: 'progress', items: [
          { label: 'Direct',        pct: 42 },
          { label: 'Organic',       pct: 28 },
          { label: 'Social',        pct: 18 },
          { label: 'Referral',      pct: 12 },
          { label: 'Email',         pct: 6 },
        ]},
        { type: 'list', items: [
          { icon: 'search', title: 'google.com',    sub: 'Organic search',     badge: '1,074' },
          { icon: 'share',  title: 'twitter.com',   sub: 'Social',             badge: '561' },
          { icon: 'share',  title: 'linkedin.com',  sub: 'Social',             badge: '131' },
          { icon: 'eye',    title: 'hacker news',   sub: 'Referral',           badge: '98' },
          { icon: 'eye',    title: 'producthunt.com', sub: 'Referral',         badge: '82' },
        ]},
        { type: 'tags', label: 'Top Campaigns', items: ['#launch2026', '#designweekly', '#uxtools', '#privacy'] },
      ],
    },
    {
      id: 'pages', label: 'Pages',
      content: [
        { type: 'metric-row', items: [
          { label: 'Pages Tracked', value: '48' },
          { label: 'Avg Views', value: '192' },
          { label: 'Top Exit', value: '/pricing' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '/blog/2026-design-trends',    sub: '1,204 views · 4:12 avg', badge: '↑ 31%' },
          { icon: 'star',  title: '/pricing',                    sub: '892 views · 1:48 avg',   badge: '↑ 8%' },
          { icon: 'check', title: '/docs/getting-started',       sub: '631 views · 3:01 avg',   badge: '↓ 4%' },
          { icon: 'check', title: '/about',                      sub: '289 views · 0:52 avg',   badge: '→ 0%' },
          { icon: 'check', title: '/blog/privacy-analytics-101', sub: '241 views · 5:22 avg',   badge: '↑ 19%' },
          { icon: 'list',  title: '/changelog',                  sub: '188 views · 1:10 avg',   badge: '↑ 44%' },
        ]},
        { type: 'text', label: 'Insight', value: 'Your blog post on 2026 design trends is driving 31% more traffic than average. Consider a follow-up post.' },
      ],
    },
    {
      id: 'geography', label: 'Geography',
      content: [
        { type: 'metric', label: 'Countries', value: '47', sub: 'Visitors from 47 countries today' },
        { type: 'progress', items: [
          { label: '🇺🇸 United States', pct: 38 },
          { label: '🇬🇧 United Kingdom', pct: 22 },
          { label: '🇩🇪 Germany',        pct: 16 },
          { label: '🇨🇦 Canada',         pct: 11 },
          { label: '🇦🇺 Australia',       pct: 7 },
          { label: '🌐 Other',           pct: 6 },
        ]},
        { type: 'metric-row', items: [
          { label: 'EU Visitors', value: '42%' },
          { label: 'Mobile',      value: '61%' },
          { label: 'New vs Return', value: '68%' },
        ]},
        { type: 'tags', label: 'Top Cities', items: ['San Francisco', 'London', 'Berlin', 'New York', 'Toronto', 'Sydney'] },
        { type: 'text', label: 'Privacy Note', value: 'All geographic data is aggregated. No individual visitor locations are stored or processed.' },
      ],
    },
    {
      id: 'settings', label: 'Privacy',
      content: [
        { type: 'metric', label: 'Privacy Score', value: 'A+', sub: 'GDPR · CCPA · PECR compliant' },
        { type: 'list', items: [
          { icon: 'check', title: 'Cookie-Free Tracking',    sub: 'No cookies used — ever',           badge: '✓ On' },
          { icon: 'check', title: 'No Personal Data',        sub: 'Zero PII collected',               badge: '✓ On' },
          { icon: 'check', title: 'EU Data Storage',         sub: 'Stored in Frankfurt, DE',          badge: '✓ On' },
          { icon: 'alert', title: 'Bot Filtering',           sub: 'Filter known bots automatically',  badge: '✓ On' },
          { icon: 'lock',  title: 'Data Retention',         sub: 'Auto-delete after 24 months',      badge: '24mo' },
        ]},
        { type: 'text', label: 'About DUSK Analytics', value: 'DUSK uses only the referring URL, page URL, and approximate screen size. No fingerprinting, no tracking pixels, no third-party scripts.' },
        { type: 'tags', label: 'Certifications', items: ['GDPR', 'CCPA', 'PECR', 'SCO Certified', 'Open Source'] },
      ],
    },
  ],
  nav: [
    { id: 'overview',   label: 'Overview',   icon: 'home' },
    { id: 'sources',    label: 'Sources',    icon: 'share' },
    { id: 'pages',      label: 'Pages',      icon: 'list' },
    { id: 'geography',  label: 'Geography',  icon: 'map' },
    { id: 'settings',   label: 'Privacy',    icon: 'lock' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'dusk-mock', 'DUSK — Privacy-First Web Analytics — Interactive Mock');
console.log('Mock live at:', result.url);
