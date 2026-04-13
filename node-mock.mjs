import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NODE',
  tagline:   'every connection, in focus',
  archetype: 'network-observability',
  palette: {
    bg:      '#090C12',
    surface: '#0D1321',
    text:    '#E2EAF4',
    accent:  '#00D4FF',
    accent2: '#7B5FFF',
    muted:   'rgba(74,98,128,0.5)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0D1321',
    accent:  '#0099CC',
    accent2: '#5B3FCC',
    muted:   'rgba(13,19,33,0.4)',
  },
  screens: [
    {
      id: 'map',
      label: 'Network Map',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Nodes', value: '18' },
          { label: 'Packets/s', value: '2.4K' },
          { label: 'Threats', value: '3' },
        ]},
        { type: 'metric', label: 'Network Health', value: '94%', sub: 'Overall topology score' },
        { type: 'list', items: [
          { icon: 'check', title: 'web-01', sub: '45.142.18.22 · nginx · OK', badge: '●' },
          { icon: 'check', title: 'api-02', sub: '45.142.18.24 · node · OK', badge: '●' },
          { icon: 'alert', title: 'mail-05', sub: '45.142.18.30 · postfix · ERR', badge: '▲' },
          { icon: 'zap',   title: 'cache-06', sub: '45.142.18.31 · redis · WARN', badge: '◆' },
        ]},
        { type: 'tags', label: 'Status Summary', items: ['12 OK', '4 WARN', '2 ERR', '0 OFFLINE'] },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '2' },
          { label: 'Warning', value: '4' },
          { label: 'Resolved', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Port Scan Detected', sub: '45.142.212.18 → web-01 · 2m ago', badge: 'CRIT' },
          { icon: 'alert', title: 'Brute Force Attempt', sub: 'Failed logins: 142 in 60s · 5m ago', badge: 'CRIT' },
          { icon: 'zap',   title: 'High Traffic Spike', sub: 'CDN-04 bandwidth >90% · 8m ago', badge: 'WARN' },
          { icon: 'zap',   title: 'SSL Cert Expiring', sub: 'mail-05.node.internal · 12 days', badge: 'WARN' },
          { icon: 'eye',   title: 'Unusual Outbound', sub: 'cache-06 → 23.235.35.0/24', badge: 'WARN' },
        ]},
        { type: 'text', label: 'AI Analysis', value: 'The port scan from 45.142.212.18 correlates with known threat actor patterns. Brute force attempt is likely automated — recommend temp IP block.' },
      ],
    },
    {
      id: 'traffic',
      label: 'Traffic',
      content: [
        { type: 'metric', label: 'Current Throughput', value: '2.4K', sub: 'packets per second' },
        { type: 'metric-row', items: [
          { label: 'Inbound', value: '1.8K' },
          { label: 'Outbound', value: '600' },
          { label: 'Dropped', value: '12' },
        ]},
        { type: 'progress', items: [
          { label: 'HTTPS/443', pct: 68 },
          { label: 'HTTP/80', pct: 18 },
          { label: 'SSH/22', pct: 8 },
          { label: 'DNS/53', pct: 4 },
          { label: 'Other', pct: 2 },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'United States', sub: '1,008 pkt/s · 42%', badge: '🇺🇸' },
          { icon: 'map', title: 'Germany', sub: '432 pkt/s · 18%', badge: '🇩🇪' },
          { icon: 'map', title: 'Singapore', sub: '264 pkt/s · 11%', badge: '🇸🇬' },
          { icon: 'alert', title: 'Russia', sub: '216 pkt/s · 9% · flagged', badge: '🇷🇺' },
        ]},
      ],
    },
    {
      id: 'node-detail',
      label: 'Node Detail',
      content: [
        { type: 'metric', label: 'web-01.node.internal', value: 'ACTIVE', sub: '45.142.18.22 · nginx/1.25 · EU-West' },
        { type: 'metric-row', items: [
          { label: 'CPU', value: '24%' },
          { label: 'RAM', value: '1.2G' },
          { label: 'Disk', value: '38%' },
          { label: 'Net', value: '380M' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: ':443 HTTPS', sub: 'Open · serving · 1.6K req/s', badge: 'OK' },
          { icon: 'check', title: ':80 HTTP', sub: 'Open · redirect → :443', badge: 'OK' },
          { icon: 'alert', title: ':8080 Alt-HTTP', sub: 'Open · port scan detected!', badge: 'SCAN' },
          { icon: 'check', title: ':22 SSH', sub: 'Open · key-auth only', badge: 'OK' },
        ]},
        { type: 'tags', label: 'Tags', items: ['production', 'nginx', 'eu-west-1', 'tier-1', 'monitored'] },
      ],
    },
    {
      id: 'rules',
      label: 'Firewall',
      content: [
        { type: 'metric', label: 'Active Policy', value: 'zero-trust-v3', sub: '14 rules · last updated 2h ago' },
        { type: 'metric-row', items: [
          { label: 'Blocked Today', value: '1.2K' },
          { label: 'Allowed', value: '84K' },
          { label: 'Rules', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'ALLOW ANY → :443 TCP', sub: 'HTTPS inbound · global', badge: 'TCP' },
          { icon: 'check', title: 'ALLOW ANY → :80 TCP', sub: 'HTTP inbound · global', badge: 'TCP' },
          { icon: 'alert', title: 'DENY 45.142.212.0/24', sub: 'Threat actor block · any port', badge: 'ALL' },
          { icon: 'check', title: 'ALLOW 10.0.0.0/8 → :22', sub: 'SSH internal only', badge: 'TCP' },
          { icon: 'alert', title: 'DENY ANY → :22', sub: 'Block external SSH', badge: 'TCP' },
        ]},
        { type: 'text', label: 'Policy Note', value: 'Zero-trust v3 enforces explicit allow-listing with default-deny. All external SSH is blocked at perimeter. Threat actor range auto-blocked after port scan detection.' },
      ],
    },
    {
      id: 'system',
      label: 'System',
      content: [
        { type: 'metric', label: 'NODE System', value: 'v2.4.1', sub: 'Build #20260413 · License: Professional' },
        { type: 'list', items: [
          { icon: 'settings', title: 'Scan Interval', sub: 'How often nodes are polled', badge: '60s' },
          { icon: 'zap',      title: 'Alert Threshold', sub: 'Minimum severity to alert', badge: 'Med' },
          { icon: 'eye',      title: 'Packet Capture', sub: 'Full packet logging enabled', badge: 'ON' },
          { icon: 'map',      title: 'Geo IP Lookup', sub: 'Origin country resolution', badge: 'ON' },
        ]},
        { type: 'tags', label: 'Integrations', items: ['Slack', 'PagerDuty', 'Datadog ✗', 'SIEM'] },
        { type: 'text', label: 'About NODE', value: 'Network Observability & Detection Engine. Designed with a blueprint annotation aesthetic inspired by circuit-diagram UIs — every connection in focus.' },
      ],
    },
  ],
  nav: [
    { id: 'map',         label: 'Map',     icon: 'grid' },
    { id: 'alerts',      label: 'Alerts',  icon: 'zap' },
    { id: 'traffic',     label: 'Traffic', icon: 'activity' },
    { id: 'node-detail', label: 'Nodes',   icon: 'layers' },
    { id: 'rules',       label: 'Rules',   icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'node-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
