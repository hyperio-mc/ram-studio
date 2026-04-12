// keen-mock.mjs — Svelte interactive mock for KEEN
// LIGHT theme primary, dark toggle
// Inspired by: Keytail + Equals on land-book.com — data-dense SEO intelligence

import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';
import fs from 'fs';

const design = {
  appName:   'KEEN',
  tagline:   'search intelligence for content teams',
  archetype: 'seo-analytics-light',

  // LIGHT palette (primary — swapped into 'palette' slot for light-first)
  palette: {
    bg:      '#F7F5F2',
    surface: '#FFFFFF',
    text:    '#16130E',
    accent:  '#2563EB',
    accent2: '#F59E0B',
    muted:   'rgba(22,19,14,0.42)',
  },

  // DARK palette (toggle)
  lightPalette: {
    bg:      '#0E1117',
    surface: '#161B26',
    text:    '#EAE8E4',
    accent:  '#3B82F6',
    accent2: '#F59E0B',
    muted:   'rgba(234,232,228,0.42)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Visibility Score', value: '74', sub: '+6 pts this week' },
        { type: 'metric-row', items: [
          { label: 'Ranking KWs', value: '1,847' },
          { label: 'Avg Position', value: '11.2' },
          { label: 'Page 1 KWs', value: '193' },
        ]},
        { type: 'progress', items: [
          { label: 'Week visibility trend', pct: 84 },
          { label: 'Indexed pages crawled', pct: 96 },
          { label: 'Keyword coverage vs competitors', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'content marketing strategy', sub: '#3 · 12.4K/mo', badge: '+2' },
          { icon: 'chart', title: 'seo audit checklist', sub: '#7 · 8.1K/mo', badge: '+4' },
          { icon: 'search', title: 'keyword research tools', sub: '#11 · 22K/mo', badge: '-1' },
          { icon: 'eye', title: 'on-page seo tips', sub: '#14 · 5.9K/mo', badge: '0' },
        ]},
        { type: 'text', label: 'Quick Win', value: '6 keywords are sitting at positions 11-20 — small content updates could push these to page 1 this week.' },
      ],
    },
    {
      id: 'keywords', label: 'Keywords',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Keywords', value: '1,847' },
          { label: 'Page 1', value: '193' },
          { label: 'Rising', value: '84' },
        ]},
        { type: 'tags', label: 'Filter by intent', items: ['All', 'Informational', 'Commercial', 'Transactional'] },
        { type: 'list', items: [
          { icon: 'chart', title: 'best seo tools 2025', sub: '#4 · KD 62 · 18.2K/mo', badge: 'up' },
          { icon: 'chart', title: 'keyword rank tracking', sub: '#8 · KD 45 · 9.6K/mo', badge: 'up' },
          { icon: 'eye', title: 'how to do seo audit', sub: '#12 · KD 31 · 5.4K/mo', badge: 'stable' },
          { icon: 'eye', title: 'content gap analysis', sub: '#16 · KD 38 · 4.1K/mo', badge: 'down' },
          { icon: 'eye', title: 'serp features guide', sub: '#19 · KD 28 · 3.8K/mo', badge: 'stable' },
          { icon: 'search', title: 'buy seo software', sub: '#22 · KD 71 · 6.7K/mo', badge: 'down' },
        ]},
        { type: 'progress', items: [
          { label: 'KD < 40 (easy wins)', pct: 38 },
          { label: 'KD 40-70 (medium)', pct: 44 },
          { label: 'KD > 70 (hard)', pct: 18 },
        ]},
      ],
    },
    {
      id: 'serp', label: 'SERP',
      content: [
        { type: 'metric', label: 'Target Keyword', value: '#4', sub: 'best seo tools 2025 · 18.2K/mo' },
        { type: 'tags', label: 'SERP Features Active', items: ['People Also Ask', 'FAQ Schema', 'Sitelinks'] },
        { type: 'list', items: [
          { icon: 'star', title: 'ahrefs.com/blog/best-seo-tools', sub: '#1 · DR 90 · weak on recency', badge: '#1' },
          { icon: 'star', title: 'backlinko.com/best-seo-tools', sub: '#2 · DR 88 · strong backlinks', badge: '#2' },
          { icon: 'star', title: 'semrush.com/blog/seo-tools', sub: '#3 · DR 91 · thin content', badge: '#3' },
          { icon: 'check', title: 'keen.io/blog/best-seo-tools', sub: '#4 · DR 74 · fresher data · YOURS', badge: '#4' },
        ]},
        { type: 'text', label: 'Opportunity', value: 'Competitors #1 and #3 have not updated their posts since 2023. A fresh, well-linked article could push KEEN to #1 within 60 days.' },
        { type: 'metric-row', items: [
          { label: 'Avg Content Length', value: '3.2K' },
          { label: 'Your Length', value: '2.8K' },
          { label: 'Gap to Fill', value: '400w' },
        ]},
      ],
    },
    {
      id: 'gaps', label: 'Gaps',
      content: [
        { type: 'metric', label: 'Untapped Clusters', value: '312', sub: 'vs. Ahrefs, Semrush, Moz' },
        { type: 'metric-row', items: [
          { label: 'Easy KD<40', value: '94' },
          { label: 'Medium', value: '141' },
          { label: 'Hard KD>70', value: '77' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'seo content brief template', sub: '4.2K queries · KD 28', badge: 'Write' },
          { icon: 'zap', title: 'how to fix crawl errors', sub: '6.1K queries · KD 32', badge: 'Write' },
          { icon: 'zap', title: 'internal linking strategy', sub: '3.8K queries · KD 35', badge: 'Write' },
          { icon: 'zap', title: 'core web vitals 2025', sub: '9.4K queries · KD 38', badge: 'Write' },
          { icon: 'layers', title: 'seo for e-commerce', sub: '14K queries · KD 55', badge: 'Plan' },
          { icon: 'layers', title: 'schema markup guide', sub: '7.6K queries · KD 48', badge: 'Plan' },
        ]},
        { type: 'progress', items: [
          { label: 'Competitor coverage: Ahrefs', pct: 78 },
          { label: 'Competitor coverage: Semrush', pct: 71 },
          { label: 'Your current coverage', pct: 43 },
        ]},
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Reports', value: '6' },
          { label: 'Sent 30d', value: '47' },
          { label: 'Recipients', value: '11' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Weekly Rankings Digest', sub: 'Every Monday 08:00', badge: 'Sent' },
          { icon: 'calendar', title: 'Monthly Executive Summary', sub: '1st of month 09:00', badge: 'Due' },
          { icon: 'bell', title: 'Competitor Alert Digest', sub: 'Every Friday 17:00', badge: 'Sent' },
          { icon: 'chart', title: 'Keyword Movement Report', sub: 'Every Wednesday', badge: 'Pause' },
          { icon: 'share', title: 'Content Gap Summary', sub: 'Every 2 weeks', badge: 'Sent' },
        ]},
        { type: 'text', label: 'Last Report Sent', value: 'Weekly Rankings Digest was delivered to 3 recipients on Monday at 08:02. Open rate: 100%.' },
        { type: 'tags', label: 'Export formats', items: ['PDF', 'CSV', 'Google Slides', 'Slack'] },
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'keywords', label: 'Keywords', icon: 'search' },
    { id: 'serp',     label: 'SERP',     icon: 'eye' },
    { id: 'gaps',     label: 'Gaps',     icon: 'layers' },
    { id: 'reports',  label: 'Reports',  icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'keen-mock',
});

// Save locally
fs.writeFileSync('/workspace/group/design-studio/keen-mock.html', html);
console.log('Mock HTML built, size:', html.length);

// Publish to zenbin.org/p/ (no subdomain — avoids 100-page ram limit)
function publishDirect(slug, html, title) {
  return new Promise((resolve, reject) => {
    const safeHtml = html.replace(/[^\x00-\x7F]/g, ' ');
    const payload = JSON.stringify({ title, html: safeHtml });
    const body = Buffer.from(payload);
    const r = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, url: JSON.parse(d).url || `https://zenbin.org/p/${slug}`, raw: d.slice(0,100) }); }
        catch { resolve({ status: res.statusCode, url: `https://zenbin.org/p/${slug}`, raw: d.slice(0,100) }); }
      });
    });
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

const result = await publishDirect('keen-mock', html, 'KEEN — Interactive Mock');
console.log('Mock live at:', result.url, '| status:', result.status);
