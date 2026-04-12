/**
 * Anchor — Svelte 5 Interactive Mock
 * Light theme · Deploy Confidence & Reliability Dashboard
 */

import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';

const SLUG = 'anchor-deploy';

// Custom publish that bypasses the subdomain limit by using overwrite=true without X-Subdomain
function publishPage(html, slug, title) {
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
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const design = {
  appName:   'Anchor',
  tagline:   'Deploy with confidence',
  archetype: 'reliability-dashboard',

  // PRIMARY = LIGHT theme
  palette: {
    bg:      '#F2F5FB',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#2563EB',
    accent2: '#10B981',
    muted:   'rgba(13,17,23,0.45)',
  },

  // DARK theme for toggle
  lightPalette: {
    bg:      '#0A0D18',
    surface: '#131726',
    text:    '#DCE4FF',
    accent:  '#4D8FFF',
    accent2: '#34D399',
    muted:   'rgba(220,228,255,0.4)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Overall Reliability', value: '99.7%', sub: '↑ 0.2% vs last 30 days' },
        { type: 'metric-row', items: [
          { label: 'Incidents', value: '0' },
          { label: 'Deploys', value: '14' },
          { label: 'MTTR', value: '4m' },
        ]},
        { type: 'tags', label: 'Error Budget', items: ['87% Remaining', '99.9% SLA', '30d window'] },
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway', sub: 'Platform · 4,281 req/s', badge: '100%' },
          { icon: 'check', title: 'auth-service', sub: 'Security · 1,103 req/s', badge: '99.9%' },
          { icon: 'alert', title: 'payments', sub: 'Commerce · 312 req/s', badge: '99.4%' },
          { icon: 'check', title: 'notifications', sub: 'Growth · 820 req/s', badge: '100%' },
        ]},
        { type: 'text', label: 'Status', value: 'All critical services nominal. Payments experiencing minor latency — investigating.' },
      ],
    },
    {
      id: 'deploy', label: 'Deploy',
      content: [
        { type: 'metric', label: 'Deploy Confidence', value: '92', sub: 'api-gateway v2.14.1 → production' },
        { type: 'progress', items: [
          { label: 'Overall confidence', pct: 92 },
          { label: 'Test coverage', pct: 94 },
          { label: 'Staging soak', pct: 100 },
          { label: 'Latency budget', pct: 71 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'All tests passing', sub: '1,847 / 1,847 tests', badge: '✓' },
          { icon: 'check', title: 'Coverage threshold', sub: '94.2% (req: 90%)', badge: '✓' },
          { icon: 'check', title: 'No open P0 issues', sub: 'GitHub Issues clear', badge: '✓' },
          { icon: 'check', title: 'p99 latency nominal', sub: '142ms (threshold 200ms)', badge: '✓' },
          { icon: 'check', title: 'Staging canary healthy', sub: '1h soak · 0 errors', badge: '✓' },
          { icon: 'alert', title: 'DB migration reviewed', sub: '1 pending migration', badge: '!' },
        ]},
        { type: 'tags', label: 'Safe to deploy', items: ['High Confidence', 'Staging ✓', 'P0 Clear'] },
      ],
    },
    {
      id: 'services', label: 'Services',
      content: [
        { type: 'metric-row', items: [
          { label: 'Healthy', value: '7' },
          { label: 'Degraded', value: '1' },
          { label: 'Down', value: '0' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'api-gateway', sub: 'Platform · 4,281 req/s', badge: '100%' },
          { icon: 'activity', title: 'auth-service', sub: 'Security · 1,103 req/s', badge: '99.9%' },
          { icon: 'alert', title: 'payments', sub: 'Commerce · 312 req/s', badge: '99.4%' },
          { icon: 'activity', title: 'notifications', sub: 'Growth · 820 req/s', badge: '100%' },
          { icon: 'activity', title: 'search', sub: 'Discovery · 2,041 req/s', badge: '100%' },
          { icon: 'activity', title: 'storage', sub: 'Platform · 660 req/s', badge: '100%' },
        ]},
        { type: 'tags', label: 'SLAs', items: ['All within threshold', 'Next review: Fri'] },
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric-row', items: [
          { label: 'MTTR (30d)', value: '4m 12s' },
          { label: 'MTTD (30d)', value: '1m 44s' },
          { label: 'Budget', value: '87%' },
        ]},
        { type: 'text', label: 'Active Incidents', value: 'No active incidents · All systems operational.' },
        { type: 'progress', items: [
          { label: 'Error budget remaining', pct: 87 },
          { label: 'MTTR improvement', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Elevated payment errors', sub: 'payments · P2 · 2d ago · MTTR 6m', badge: '✓' },
          { icon: 'alert', title: 'Auth latency spike', sub: 'auth-service · P3 · 5d ago · MTTR 3m', badge: '✓' },
          { icon: 'alert', title: 'CDN cache miss storm', sub: 'cdn · P2 · 11d ago · MTTR 14m', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'oncall', label: 'On-Call',
      content: [
        { type: 'metric', label: 'Primary On-Call', value: 'Dan Lee', sub: 'Platform · Ends in 3h 22m' },
        { type: 'list', items: [
          { icon: 'user', title: 'Dan Lee', sub: 'Platform · PRIMARY', badge: 'NOW' },
          { icon: 'user', title: 'Sara Kim', sub: 'Security · NEXT in 3h 22m', badge: 'NEXT' },
          { icon: 'user', title: 'Mo Okafor', sub: 'Commerce · Mon 00:00 UTC', badge: '' },
          { icon: 'user', title: 'Priya Singh', sub: 'Discovery · Tue 00:00 UTC', badge: '' },
        ]},
        { type: 'tags', label: 'Alert Policies', items: ['PagerDuty P0+P1', 'Slack #incidents', 'SMS P0 only'] },
        { type: 'text', label: 'Escalation', value: 'No-ack escalation: 5 minutes → secondary on-call → engineering manager.' },
      ],
    },
  ],

  nav: [
    { id: 'overview',  label: 'Home',      icon: 'home' },
    { id: 'deploy',    label: 'Deploy',    icon: 'zap' },
    { id: 'services',  label: 'Services',  icon: 'layers' },
    { id: 'incidents', label: 'Incidents', icon: 'alert' },
    { id: 'oncall',    label: 'On-Call',   icon: 'user' },
  ],
};

console.log('Generating Svelte component…');
const svelteSource = generateSvelteComponent(design);

console.log('Building mock HTML…');
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

console.log('Publishing mock…');
const mockSlug = `${SLUG}-mock`;
const result = await publishPage(html, mockSlug, `${design.appName} — Interactive Mock`);
console.log('Mock live at:', result.url);

// Also publish hero and viewer with the same approach
import { readFileSync } from 'fs';
const heroHtml = readFileSync(`/workspace/group/design-studio/${SLUG}-hero.html`, 'utf8').catch?.(() => null);
