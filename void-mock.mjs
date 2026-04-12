// VOID — Svelte interactive mock
import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';

// Publish without X-Subdomain (ram subdomain is full, use base zenbin.org)
function publishMock(html, slug, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: title || slug, html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const design = {
  appName:   'VOID',
  tagline:   'Infrastructure topology for the dark web of services',
  archetype: 'infra-monitor',
  palette: {
    bg:      '#050505',
    surface: '#0D0D0D',
    text:    '#F0EEE8',
    accent:  '#00E5FF',
    accent2: '#7B61FF',
    muted:   'rgba(240,238,232,0.38)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0A0E14',
    accent:  '#0070CC',
    accent2: '#5B3FCC',
    muted:   'rgba(10,14,20,0.42)',
  },
  screens: [
    {
      id: 'topology',
      label: 'Topology',
      content: [
        { type: 'metric', label: 'Cluster Health', value: '89%', sub: 'us-east-1 / prod — 1 node offline' },
        { type: 'metric-row', items: [
          { label: 'Nodes', value: '8/9' },
          { label: 'Latency', value: '2.4ms' },
          { label: 'Req/s', value: '4.2K' },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'GATEWAY',  sub: '4 replicas · healthy', badge: '●' },
          { icon: 'check',  title: 'AUTH',     sub: '99.9% uptime',          badge: '●' },
          { icon: 'check',  title: 'API',      sub: '2.1ms avg',             badge: '●' },
          { icon: 'alert',  title: 'CACHE',    sub: '78% capacity',          badge: '!' },
          { icon: 'check',  title: 'DB-01',    sub: 'primary · healthy',     badge: '●' },
          { icon: 'alert',  title: 'WORKER-3', sub: 'offline 4m 32s',        badge: '✗' },
        ]},
        { type: 'tags', label: 'Active Alerts', items: ['3 CRITICAL', '2 WARN', '1 INFO'] },
      ],
    },
    {
      id: 'node',
      label: 'Node Detail',
      content: [
        { type: 'metric', label: 'GATEWAY', value: 'Healthy', sub: 'nginx / 4 replicas / us-east-1a' },
        { type: 'progress', items: [
          { label: 'CPU',    pct: 23 },
          { label: 'Memory', pct: 41 },
          { label: 'Req/s',  pct: 68 },
          { label: 'Errors', pct: 2  },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'AUTH',  sub: '0.8ms round-trip', badge: '↔' },
          { icon: 'activity', title: 'API',   sub: '1.2ms round-trip', badge: '↔' },
          { icon: 'activity', title: 'DB-01', sub: '2.1ms round-trip', badge: '↔' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Uptime', value: '99.97%' },
          { label: 'Deploys', value: '14' },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Incidents', value: '3', sub: '2 warn · 1 critical' },
        { type: 'list', items: [
          { icon: 'alert', title: 'WORKER-3 offline',          sub: 'No heartbeat for 4m 32s',        badge: 'CRIT' },
          { icon: 'alert', title: 'CACHE memory threshold',    sub: '78% capacity — nearing 80%',      badge: 'WARN' },
          { icon: 'alert', title: 'API p99 latency spike',     sub: 'p99 > 480ms — SLA is 400ms',      badge: 'WARN' },
          { icon: 'check', title: 'DB-02 replica synced',      sub: 'Replication lag reduced to 0ms',  badge: 'INFO' },
          { icon: 'check', title: 'Deploy gateway-v2.4.1',     sub: '4/4 replicas healthy',            badge: 'INFO' },
        ]},
        { type: 'tags', label: 'Filter', items: ['ALL', 'CRITICAL', 'WARN', 'INFO'] },
      ],
    },
    {
      id: 'traces',
      label: 'Traces',
      content: [
        { type: 'metric', label: 'POST /api/checkout', value: '142ms', sub: 'trace_a7f3c12b9e · 200 OK · 4 spans' },
        { type: 'progress', items: [
          { label: 'GATEWAY  http.request',   pct: 100 },
          { label: 'AUTH     jwt.verify',      pct: 8   },
          { label: 'API      db.query',        pct: 69  },
          { label: 'DB-01    postgres.exec',   pct: 58  },
          { label: 'QUEUE    job.enqueue',     pct: 6   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Slowest', value: 'DB-01' },
          { label: 'Spans', value: '5' },
          { label: 'Status', value: '200 OK' },
        ]},
      ],
    },
    {
      id: 'config',
      label: 'Config',
      content: [
        { type: 'metric', label: 'prod-cluster-01', value: 'us-east-1', sub: 'AWS EKS · K8s 1.29.3' },
        { type: 'list', items: [
          { icon: 'settings', title: 'CPU Alert',   sub: 'Threshold: 80%',   badge: '80%'  },
          { icon: 'settings', title: 'Mem Alert',   sub: 'Threshold: 75%',   badge: '75%'  },
          { icon: 'settings', title: 'Latency p99', sub: 'Threshold: 400ms', badge: '400ms'},
          { icon: 'settings', title: 'Error Rate',  sub: 'Threshold: 1%',    badge: '1%'   },
        ]},
        { type: 'tags', label: 'Integrations', items: ['PagerDuty ●', 'Slack ●', 'DataDog ○'] },
        { type: 'text', label: 'Cluster Note', value: 'WORKER-3 decommission scheduled for maintenance window Tue 02:00 UTC.' },
      ],
    },
  ],
  nav: [
    { id: 'topology', label: 'Topology', icon: 'layers'   },
    { id: 'node',     label: 'Nodes',    icon: 'activity' },
    { id: 'alerts',   label: 'Alerts',   icon: 'alert'    },
    { id: 'traces',   label: 'Traces',   icon: 'share'    },
    { id: 'config',   label: 'Config',   icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'void-mock', 'VOID — Interactive Mock');
console.log('Mock live at:', result.url);
