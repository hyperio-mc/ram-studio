import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';

// Custom zenPost that doesn't fail on 429 for new pages
function zenPost(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path:     '/v1/pages/' + slug + '?overwrite=true',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': body.length,
        'X-Subdomain':    'ram',
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const design = {
  appName:   'Relay',
  tagline:   'Orchestrate your personal AI agents',
  archetype: 'ai-orchestration',
  palette: {
    bg:      '#0B0C0F',
    surface: '#141519',
    text:    '#E6E7EE',
    accent:  '#00D4A8',
    accent2: '#7C5CFF',
    muted:   'rgba(230,231,238,0.35)',
  },
  lightPalette: {
    bg:      '#F4F5F7',
    surface: '#FFFFFF',
    text:    '#0D0E12',
    accent:  '#008F72',
    accent2: '#5A3ED9',
    muted:   'rgba(13,14,18,0.40)',
  },
  screens: [
    {
      id: 'command', label: 'Command',
      content: [
        { type: 'metric', label: 'Running Now', value: '7', sub: 'agents active · 24 tasks queued' },
        { type: 'metric-row', items: [
          { label: 'Research', value: '68%' },
          { label: 'Writer',   value: '41%' },
          { label: 'Coder',    value: '22%' },
        ]},
        { type: 'list', items: [
          { icon: 'search', title: 'Research Agent', sub: 'SaaS pricing analysis Q1', badge: '68%' },
          { icon: 'edit',   title: 'Writer Agent',   sub: 'Blog post: agent patterns', badge: '41%' },
          { icon: 'code',   title: 'Coder Agent',    sub: 'Refactor /src/auth/*',      badge: '22%' },
        ]},
        { type: 'tags', label: 'Status', items: ['Live', '7 running', '24 queued'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'text', label: 'Fleet Status', value: '5 agents · 3 active right now' },
        { type: 'list', items: [
          { icon: 'search', title: 'Research',  sub: 'Web, arxiv, news synthesis',    badge: '3 tasks' },
          { icon: 'edit',   title: 'Writer',    sub: 'Longform, tweets, docs',         badge: '2 tasks' },
          { icon: 'code',   title: 'Coder',     sub: 'Full-stack, tests, refactors',   badge: 'busy' },
          { icon: 'layers', title: 'Planner',   sub: 'Roadmaps, briefs, priorities',   badge: 'idle' },
          { icon: 'eye',    title: 'Monitor',   sub: 'Uptime, alerts, metrics',        badge: '8 tasks' },
        ]},
      ],
    },
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '3' },
          { label: 'Queued',  value: '5' },
          { label: 'Done',    value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'SaaS pricing analysis Q1',   sub: 'Research · 4m',  badge: 'on' },
          { icon: 'activity', title: 'Blog post: agent patterns',  sub: 'Writer · 9m',    badge: 'on' },
          { icon: 'alert',    title: 'Auth module refactor',       sub: 'Coder · 18m',    badge: '!' },
          { icon: 'list',     title: 'Q2 roadmap synthesis',       sub: 'Planner · —',    badge: '...' },
          { icon: 'check',    title: 'Competitor feature matrix',  sub: 'Research · done',badge: 'done' },
        ]},
      ],
    },
    {
      id: 'output', label: 'Output',
      content: [
        { type: 'text', label: 'Pending Review', value: '1 item needs your approval' },
        { type: 'list', items: [
          { icon: 'search', title: 'Competitor Feature Matrix',    sub: '14 sources · 3,200 words',  badge: '?' },
          { icon: 'edit',   title: 'Twitter: AI agents in 2026',  sub: '12 tweets · 890 chars',      badge: 'ok' },
          { icon: 'eye',    title: 'Stripe Webhook Health',       sub: '6 endpoints · p99: 94ms',    badge: 'ok' },
        ]},
        { type: 'tags', label: 'Actions', items: ['Approve', 'Reject', 'Request edit'] },
      ],
    },
    {
      id: 'memory', label: 'Memory',
      content: [
        { type: 'metric', label: 'Context Usage', value: '7.8', sub: 'GB of 16 GB used across all agents' },
        { type: 'progress', items: [
          { label: 'Research context', pct: 56 },
          { label: 'Coder context',    pct: 43 },
          { label: 'Writer context',   pct: 28 },
          { label: 'Monitor context',  pct: 14 },
        ]},
        { type: 'tags', label: 'Top Nodes', items: ['SaaS landscape', 'Brand voice', 'Codebase map', 'Infra topology'] },
      ],
    },
  ],
  nav: [
    { id: 'command',  label: 'Command',  icon: 'home'   },
    { id: 'agents',   label: 'Agents',   icon: 'grid'   },
    { id: 'pipeline', label: 'Pipeline', icon: 'list'   },
    { id: 'output',   label: 'Output',   icon: 'check'  },
    { id: 'memory',   label: 'Memory',   icon: 'layers' },
  ],
};

console.log('Building Svelte mock...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('  Built HTML:', Math.round(html.length / 1024) + 'KB');

console.log('Publishing mock...');
const res = await zenPost('relay-mock', html, 'Relay — Interactive Mock');
if (res.status === 200 || res.status === 201) {
  console.log('  Mock live at: https://ram.zenbin.org/relay-mock');
} else {
  console.log('  Publish result:', res.status, res.body.slice(0, 120));
}
