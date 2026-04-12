// lens-mock.mjs — LENS Interactive Svelte Mock
// DARK: #09090F + #7C5CFC violet + #2DCBBA teal
// AI Agent Observability Platform

import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';

// Custom publish function — zenbin.org without X-Subdomain (ram is at 100-page limit)
function publishToZenbin(html, slug, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const url = `https://zenbin.org/p/${slug}`;
        resolve({ ok: res.statusCode === 200 || res.statusCode === 201, url, status: res.statusCode, body: d.slice(0, 200) });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const design = {
  appName:   'LENS',
  tagline:   'AI agent observability platform',
  archetype: 'developer-tools-dark',

  palette: {               // DARK theme
    bg:      '#09090F',
    surface: '#111120',
    text:    '#EEEEFF',
    accent:  '#7C5CFC',
    accent2: '#2DCBBA',
    muted:   'rgba(112,112,160,0.8)',
  },

  lightPalette: {          // LIGHT theme
    bg:      '#F4F3FF',
    surface: '#FFFFFF',
    text:    '#0F0E1F',
    accent:  '#6342F0',
    accent2: '#1FA898',
    muted:   'rgba(80,78,120,0.55)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric',     label: 'Agents Active',  value: '12',    sub: 'Mission control — all systems' },
        { type: 'metric-row', items: [
          { label: 'Tasks today', value: '4,281' },
          { label: 'Success rate', value: '98.2%' },
          { label: 'Spend today', value: '$14.32' },
        ]},
        { type: 'progress', items: [
          { label: 'Researcher-01', pct: 72 },
          { label: 'Coder-02',      pct: 88 },
          { label: 'Reviewer-03',   pct: 45 },
          { label: 'Deployer-04',   pct: 62 },
          { label: 'Monitor-05',    pct: 0  },
        ]},
        { type: 'text', label: 'Live insight', value: '9 of 12 agents running optimally. Monitor-05 in error state — requires restart.' },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '9' },
          { label: 'Idle', value: '2' },
          { label: 'Error', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Researcher-01', sub: 'claude-3-7-sonnet  |  42 tasks/hr', badge: 'LIVE' },
          { icon: 'code',     title: 'Coder-02',      sub: 'claude-3-5-haiku  |  118 tasks/hr', badge: 'LIVE' },
          { icon: 'eye',      title: 'Reviewer-03',   sub: 'gpt-4o  |  31 tasks/hr', badge: 'IDLE' },
          { icon: 'zap',      title: 'Deployer-04',   sub: 'claude-3-7-sonnet  |  8 tasks/hr', badge: 'LIVE' },
          { icon: 'alert',    title: 'Monitor-05',    sub: 'gemini-2.0-flash  |  0 tasks/hr', badge: 'ERR' },
          { icon: 'layers',   title: 'Writer-06',     sub: 'claude-3-5-haiku  |  27 tasks/hr', badge: 'LIVE' },
        ]},
        { type: 'tags', label: 'Filter by model', items: ['All', 'Sonnet', 'Haiku', 'GPT-4o', 'Gemini'] },
      ],
    },
    {
      id: 'stream', label: 'Stream',
      content: [
        { type: 'metric', label: 'Tasks Today', value: '4,281', sub: 'Live — updates in real time' },
        { type: 'list', items: [
          { icon: 'search',   title: 'Web search: ML benchmarks Q1 2026', sub: 'Researcher-01  |  2s ago', badge: 'OK' },
          { icon: 'share',    title: 'Draft executive summary v3',         sub: 'Writer-06  |  9s ago',    badge: 'OK' },
          { icon: 'code',     title: 'Run test_suite_core — 312 tests',    sub: 'Coder-02  |  15s ago',    badge: 'OK' },
          { icon: 'eye',      title: 'Review PR #2041 diff analysis',      sub: 'Reviewer-03  |  34s ago', badge: '~' },
          { icon: 'zap',      title: 'Deploy staging-v1.4.2',              sub: 'Deployer-04  |  52s ago', badge: 'OK' },
          { icon: 'alert',    title: 'Error: model timeout — 3rd attempt', sub: 'Monitor-05  |  1m ago',   badge: '!' },
          { icon: 'chart',    title: 'Analyze: weekly token usage report', sub: 'Researcher-01  |  2m ago', badge: 'OK' },
        ]},
      ],
    },
    {
      id: 'usage', label: 'Usage',
      content: [
        { type: 'metric', label: 'Total Spend Today', value: '$14.32', sub: 'Up 12% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Tokens used', value: '2.47M' },
          { label: 'Avg cost/task', value: '$0.003' },
        ]},
        { type: 'progress', items: [
          { label: 'claude-3-7-sonnet', pct: 68 },
          { label: 'claude-3-5-haiku',  pct: 42 },
          { label: 'gpt-4o',            pct: 18 },
          { label: 'gemini-2.0-flash',  pct: 8 },
        ]},
        { type: 'text', label: 'Cost insight', value: 'Sonnet accounts for 68% of token spend. Switch non-critical agents to Haiku to reduce burn by est. $4.20/day.' },
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Errors', value: '1' },
          { label: 'Warnings', value: '3' },
          { label: 'Info', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',  title: 'Monitor-05: model timeout',        sub: '3 consecutive failures — action required', badge: '!' },
          { icon: 'alert',  title: 'Token burn rate elevated',         sub: 'Sonnet 40% above 7-day baseline', badge: '~' },
          { icon: 'alert',  title: 'Reviewer-03 latency high',         sub: 'P95 at 8.4s — threshold 5.0s', badge: '~' },
          { icon: 'bell',   title: 'New agent slot available',         sub: '3 additional agents can run now', badge: 'i' },
          { icon: 'check',  title: 'Deployer memory spike resolved',   sub: 'Cleared 2h ago', badge: 'OK' },
          { icon: 'check',  title: 'Writer rate limit cleared',        sub: 'Cleared 5h ago', badge: 'OK' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'agents',   label: 'Agents',   icon: 'layers' },
    { id: 'stream',   label: 'Stream',   icon: 'activity' },
    { id: 'usage',    label: 'Usage',    icon: 'chart' },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell' },
  ],
};

console.log('Building LENS Svelte mock...');

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, {
    appName: design.appName,
    tagline: design.tagline,
    slug: 'lens-mock',
  });

  console.log('+ Svelte compiled OK, HTML length:', html.length);

  // Publish to zenbin.org/p/lens-mock (no subdomain — ram is at 100-page limit)
  const result = await publishToZenbin(html, 'lens-mock', 'LENS — Interactive Mock');
  if (result.ok) {
    console.log('+ Mock published:', result.url);
  } else {
    console.log('- Publish status:', result.status, result.body);
    console.log('  Mock URL would be:', result.url);
  }

} catch (err) {
  console.error('Build error:', err.message);
  process.exit(1);
}
