import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WRAITH',
  tagline:   'Network Intelligence Monitor',
  archetype: 'devops-security',
  palette: {
    bg:      '#080B10',
    surface: '#0D1117',
    text:    '#CDD9E5',
    accent:  '#39D353',
    accent2: '#58A6FF',
    muted:   'rgba(141,160,181,0.35)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#1C2333',
    accent:  '#1A7F37',
    accent2: '#0550AE',
    muted:   'rgba(28,35,51,0.35)',
  },
  screens: [
    {
      id: 'command',
      label: 'Command',
      content: [
        { type: 'metric', label: 'THREAT LEVEL', value: '2 / 5', sub: 'ELEVATED — 12 active alerts' },
        { type: 'metric-row', items: [
          { label: 'HOSTS', value: '247' },
          { label: 'EVENTS/s', value: '1.4K' },
          { label: 'UPTIME', value: '99.8%' },
        ]},
        { type: 'text', label: 'TOP CONNECTION', value: '10.0.0.12 → 185.220.101.34 · 2.1 MB/s · ⚠ C2 TRAFFIC SUSPECT' },
        { type: 'list', items: [
          { icon: 'alert', title: '185.220.101.34', sub: 'Outbound C2 traffic detected', badge: 'CRIT' },
          { icon: 'activity', title: '10.0.0.8 → 172.16.4.22', sub: '847 KB/s inbound', badge: 'OK' },
          { icon: 'activity', title: '10.0.0.31 → 95.169.0.4', sub: '420 KB/s outbound', badge: 'OK' },
        ]},
      ],
    },
    {
      id: 'signals',
      label: 'Signals',
      content: [
        { type: 'metric-row', items: [
          { label: 'CRITICAL', value: '3' },
          { label: 'WARNING', value: '6' },
          { label: 'INFO', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'SSH brute force detected', sub: 'auth.guard · 23:40', badge: 'CRIT' },
          { icon: 'alert', title: 'Outbound C2 traffic: 185.220.x', sub: 'netflow · 23:38', badge: 'CRIT' },
          { icon: 'alert', title: 'Priv escalation blocked', sub: 'syscall · 23:35', badge: 'CRIT' },
          { icon: 'zap', title: 'High egress bandwidth', sub: 'bw.monitor · 23:30', badge: 'WARN' },
          { icon: 'zap', title: 'TLS cert expiry in 5d', sub: 'cert.watch · 23:21', badge: 'WARN' },
          { icon: 'check', title: 'Deploy completed: svc-relay', sub: 'deploy · 23:10', badge: 'OK' },
        ]},
      ],
    },
    {
      id: 'hosts',
      label: 'Hosts',
      content: [
        { type: 'metric-row', items: [
          { label: 'UP', value: '239' },
          { label: 'WARN', value: '6' },
          { label: 'DOWN', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'prod-web-01', sub: '10.0.1.11 · CPU 34% · MEM 67%', badge: 'UP' },
          { icon: 'alert', title: 'prod-api-02', sub: '10.0.1.12 · CPU 87% · MEM 72%', badge: 'WARN' },
          { icon: 'check', title: 'prod-db-01', sub: '10.0.2.10 · CPU 42% · MEM 88%', badge: 'UP' },
          { icon: 'alert', title: 'edge-node-07', sub: '10.0.4.7 · unreachable', badge: 'DOWN' },
          { icon: 'check', title: 'analytics-01', sub: '10.0.3.5 · CPU 55% · MEM 61%', badge: 'UP' },
          { icon: 'alert', title: 'proxy-haproxy', sub: '10.0.1.2 · CPU 92% · MEM 58%', badge: 'WARN' },
        ]},
      ],
    },
    {
      id: 'metrics',
      label: 'Metrics',
      content: [
        { type: 'metric-row', items: [
          { label: 'REQ/MIN', value: '14.2K' },
          { label: 'ERR RATE', value: '0.31%' },
          { label: 'P99', value: '142ms' },
        ]},
        { type: 'progress', items: [
          { label: 'CPU CORE 0', pct: 34 },
          { label: 'CPU CORE 1', pct: 87 },
          { label: 'CPU CORE 2', pct: 42 },
          { label: 'CPU CORE 3', pct: 28 },
        ]},
        { type: 'tags', label: 'STATUS', items: ['WEB ✓', 'API ✓', 'DB ✓', 'CACHE ✓', 'PROXY ⚠'] },
      ],
    },
    {
      id: 'logs',
      label: 'Logs',
      content: [
        { type: 'text', label: 'STREAMING', value: '1,247 lines · live feed · 1s interval' },
        { type: 'list', items: [
          { icon: 'alert', title: '[ERR] conn refused: 10.0.2.10:5432', sub: '23:44:01 · db', badge: 'ERR' },
          { icon: 'alert', title: '[ERR] query timeout after 30s', sub: '23:44:01 · db', badge: 'ERR' },
          { icon: 'zap', title: '[WRN] rate limit 429: client 10.0.1.5', sub: '23:43:59 · api', badge: 'WRN' },
          { icon: 'check', title: '[INF] svc-api: health check OK', sub: '23:43:58 · health', badge: 'INF' },
          { icon: 'check', title: '[INF] deploy sha=7c3d2f9 applied', sub: '23:43:57 · deploy', badge: 'INF' },
          { icon: 'code', title: '[DBG] cache hit: /v2/users/{id}', sub: '23:43:56 · cache', badge: 'DBG' },
        ]},
      ],
    },
    {
      id: 'intel',
      label: 'Intel',
      content: [
        { type: 'text', label: 'OSINT FEEDS', value: 'AbuseIPDB · Shodan · AlienVault OTX · GreyNoise — Auto-enriched' },
        { type: 'list', items: [
          { icon: 'alert', title: '185.220.101.34', sub: 'Score 98 · RU · C2 RELAY · 14 events', badge: '98' },
          { icon: 'alert', title: '95.169.0.4', sub: 'Score 84 · CN · PORT SCAN · 7 events', badge: '84' },
          { icon: 'zap', title: '91.108.4.77', sub: 'Score 71 · IR · BRUTE SSH · 23 events', badge: '71' },
          { icon: 'eye', title: '45.142.20.55', sub: 'Score 56 · UA · CRAWLER · 3 events', badge: '56' },
        ]},
        { type: 'metric-row', items: [
          { label: 'ABUSEIPDB', value: '✓ 4s' },
          { label: 'SHODAN', value: '✓ 2m' },
          { label: 'GREYNOISE', value: '✓ 8s' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'command', label: 'CMD',     icon: 'layers' },
    { id: 'signals', label: 'Signals', icon: 'bell' },
    { id: 'hosts',   label: 'Hosts',   icon: 'grid' },
    { id: 'metrics', label: 'Metrics', icon: 'chart' },
    { id: 'logs',    label: 'Logs',    icon: 'list' },
    { id: 'intel',   label: 'Intel',   icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'wraith-mock', 'WRAITH — Interactive Mock');
console.log('Mock status:', result.status);
console.log('Mock live at: https://ram.zenbin.org/wraith-mock');
