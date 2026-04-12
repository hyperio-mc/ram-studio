// flux-mock-rebuild.mjs
// Fix: was publishing raw Svelte source instead of compiled HTML.
// Correct flow: generateSvelteComponent → buildMock (compile) → publish

import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import fs from 'fs';
import https from 'https';

const design = {
  appName:   'FLUX',
  tagline:   'infrastructure monitoring dashboard',
  archetype: 'developer-tool',

  palette: {
    bg:      '#0C0E14',
    surface: '#141820',
    text:    '#E2E8F0',
    accent:  '#00E676',
    accent2: '#FFB300',
    muted:   '#4B5A6F',
  },

  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#1A2235',
    accent:  '#006E3C',
    accent2: '#CC7A00',
    muted:   '#6B7280',
  },

  nav: [
    { id: 'overview', label: '[OV]',  icon: 'chart'    },
    { id: 'services', label: '[SVC]', icon: 'layers'   },
    { id: 'logs',     label: '[LOG]', icon: 'list'     },
    { id: 'deploy',   label: '[DEP]', icon: 'zap'      },
    { id: 'profile',  label: '[ME]',  icon: 'user'     },
  ],

  screens: [
    {
      id: 'overview', label: '[OV]',
      content: [
        { type: 'metric', label: '[FLUX] — SYSTEM DASHBOARD', value: '[ALL SYSTEMS ↑]', sub: 'MON 30 MAR 2026  ·  12 services running  ·  1 warning  ·  last updated 14:23:01' },
        { type: 'metric-row', items: [
          { label: '[CPU]',  value: '72%'  },
          { label: '[MEM]',  value: '48%'  },
          { label: '[NET]',  value: '12ms' },
        ]},
        { type: 'tags', label: '[QUICK ACTIONS]', items: ['[RESTART SVC]', '[VIEW LOGS]', '[DEPLOY]', '[ALERT]'] },
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway',   sub: '[OK]  ·  8ms  ·  env:prod',    badge: 'OK'   },
          { icon: 'check', title: 'auth-service',  sub: '[OK]  ·  3ms  ·  env:prod',    badge: 'OK'   },
          { icon: 'star',  title: 'data-pipeline', sub: '[WARN]  ·  240ms  ·  env:prod', badge: 'WARN' },
          { icon: 'check', title: 'cdn-edge',      sub: '[OK]  ·  2ms  ·  env:prod',    badge: 'OK'   },
          { icon: 'check', title: 'worker-queue',  sub: '[OK]  ·  12%cpu  ·  env:prod', badge: 'OK'   },
        ]},
        { type: 'text', label: '[LOAD AVERAGE]', value: '[CPU] 72%  [MEM] 48%  [NET] 12ms p50\nPeak CPU today: 82% at 11:45 — data-pipeline batch job.\nAll other services nominal. 1 warning active: data-pipeline memory at 85%.' },
      ],
    },
    {
      id: 'services', label: '[SVC]',
      content: [
        { type: 'metric', label: '[SERVICES] — REGISTRY', value: '12 RUNNING', sub: '1 warning  ·  0 critical  ·  0 down  ·  filter: [ALL]' },
        { type: 'metric-row', items: [
          { label: '[RUNNING]', value: '12' },
          { label: '[WARN]',    value: '1'  },
          { label: '[CRIT]',    value: '0'  },
        ]},
        { type: 'tags', label: '[FILTER]', items: ['[ALL]', '[OK]', '[WARN]', '[CRIT]'] },
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway',   sub: 'env:prod  ·  [CPU] 4%   ·  [MEM] 128MB  ·  [UPTIME] 99.9%',  badge: 'OK'   },
          { icon: 'check', title: 'auth-service',  sub: 'env:prod  ·  [CPU] 2%   ·  [MEM] 64MB   ·  [UPTIME] 100%',   badge: 'OK'   },
          { icon: 'star',  title: 'data-pipeline', sub: 'env:prod  ·  [CPU] 78%  ·  [MEM] 512MB  ·  [UPTIME] 98.2%', badge: 'WARN' },
          { icon: 'check', title: 'worker-queue',  sub: 'env:prod  ·  [CPU] 12%  ·  [MEM] 256MB  ·  [UPTIME] 99.7%', badge: 'OK'   },
          { icon: 'check', title: 'search-index',  sub: 'env:prod  ·  [CPU] 8%   ·  [MEM] 384MB  ·  [UPTIME] 99.5%', badge: 'OK'   },
        ]},
        { type: 'text', label: '[NOTE]', value: 'data-pipeline [WARN]: memory at 85% threshold (512MB / 600MB). Auto-scaling triggered at 14:22. CPU spiked during batch ingestion job. Expected to normalize by 15:00.' },
      ],
    },
    {
      id: 'logs', label: '[LOG]',
      content: [
        { type: 'metric', label: '[LOGS] — LIVE STREAM', value: '● LIVE', sub: 'real-time event log  ·  filter: [ALL]  ·  last: 14:23:01' },
        { type: 'metric-row', items: [
          { label: '[INFO]',  value: '847' },
          { label: '[WARN]',  value: '12'  },
          { label: '[ERROR]', value: '3'   },
        ]},
        { type: 'tags', label: '[FILTER]', items: ['[ALL]', '[ERROR]', '[WARN]', '[INFO]'] },
        { type: 'list', items: [
          { icon: 'play',  title: '14:23:01  [INFO]  deployment pipeline started',        sub: 'api-gateway  ·  v2.14.0  ·  by @rahel.a',  badge: 'INFO'  },
          { icon: 'star',  title: '14:22:58  [WARN]  memory threshold at 85%',            sub: 'data-pipeline  ·  512MB / 600MB',           badge: 'WARN'  },
          { icon: 'play',  title: '14:22:47  [INFO]  cache invalidated — 2.4k keys',     sub: 'cdn-edge  ·  regional purge complete',       badge: 'INFO'  },
          { icon: 'heart', title: '14:22:35  [ERROR]  connection timeout after 5000ms',  sub: 'auth-service  ·  external oauth endpoint',  badge: 'ERROR' },
          { icon: 'play',  title: '14:22:28  [INFO]  health check passed all nodes',     sub: '12/12 nodes  ·  avg 4ms response',           badge: 'INFO'  },
        ]},
        { type: 'text', label: '[ERROR DETAIL]', value: '14:22:35  [ERROR]  auth-service\nconnection timeout after 5000ms\n→ external oauth endpoint (accounts.google.com)\n→ retry 1/3 at 14:22:36\n→ retry 2/3 at 14:22:38  [OK]\n→ resolved — total downtime 3.2s' },
      ],
    },
    {
      id: 'deploy', label: '[DEP]',
      content: [
        { type: 'metric', label: '[DEPLOY] — PIPELINE', value: 'v2.14.0 [OK]', sub: 'main → production  ·  deployed 14:22  ·  by @rahel.a  ·  all stages passed' },
        { type: 'metric-row', items: [
          { label: '[BUILD]', value: '1m24s' },
          { label: '[TEST]',  value: '3m12s' },
          { label: '[PROD]',  value: '0m38s' },
        ]},
        { type: 'tags', label: '[PIPELINE]', items: ['BUILD ✓', 'TEST ✓', 'STAGE ✓', 'PROD ✓'] },
        { type: 'list', items: [
          { icon: 'check', title: 'v2.14.0', sub: 'fix: reduce memory leak in pipeline  ·  @rahel.a  ·  14:22  ·  [OK]',      badge: 'OK'   },
          { icon: 'check', title: 'v2.13.8', sub: 'feat: new metrics endpoint           ·  @tobi     ·  11:05  ·  [OK]',      badge: 'OK'   },
          { icon: 'check', title: 'v2.13.7', sub: 'hotfix: auth token refresh           ·  @anya     ·  09:30  ·  [OK]',      badge: 'OK'   },
          { icon: 'star',  title: 'v2.13.6', sub: 'chore: update dependencies           ·  @rahel.a  ·  yesterday  ·  [WARN]', badge: 'WARN' },
          { icon: 'check', title: 'v2.13.5', sub: 'refactor: optimize search index      ·  @kemi     ·  2 days  ·  [OK]',     badge: 'OK'   },
        ]},
        { type: 'text', label: '[ACTIVE]', value: 'v2.14.0 — main → production\nfix: reduce memory leak in data-pipeline service\n\nCommit: a4f2e91\nBranch: main\nAuthor: rahel.a <rahel@team.io>\nDeployed: 14:22 · Total pipeline time: 5m 58s' },
      ],
    },
    {
      id: 'profile', label: '[ME]',
      content: [
        { type: 'metric', label: '[PROFILE] — ACCOUNT', value: 'rahel.a', sub: 'rahel@team.io  ·  [ADMIN]  ·  team workspace  ·  pro plan' },
        { type: 'metric-row', items: [
          { label: '[ROLE]',   value: 'ADMIN' },
          { label: '[PLAN]',   value: 'PRO'   },
          { label: '[ALERTS]', value: 'ON'    },
        ]},
        { type: 'tags', label: '[SETTINGS]', items: ['[ENV]', '[ALERTS]', '[KEYS]', '[TEAM]'] },
        { type: 'list', items: [
          { icon: 'check', title: '[ENVIRONMENT]  production',     sub: 'active environment — all writes go to prod', badge: 'PROD'   },
          { icon: 'play',  title: '[ALERTS]  [ERROR] → slack',     sub: '#incidents channel  ·  immediate delivery',  badge: 'ACTIVE' },
          { icon: 'play',  title: '[ALERTS]  [WARN]  → email',     sub: 'on-call rotation  ·  5 min delay',           badge: 'ACTIVE' },
          { icon: 'check', title: '[API KEY]  flux_live_••••4a2f', sub: 'created 12 Jan 2026  ·  last used 14:22',    badge: 'ACTIVE' },
          { icon: 'check', title: '[API KEY]  flux_test_••••8b91', sub: 'created 08 Feb 2026  ·  test environment',   badge: 'TEST'   },
        ]},
        { type: 'text', label: '[SYSTEM]', value: '[FLUX] v0.4.1\nstatus.flux.dev  ·  docs.flux.dev\n\nTeam workspace · 14 members\nPro plan · renews 01 May 2026\n\nRAM Design Heartbeat · 30 MAR 2026' },
      ],
    },
  ],
};

console.log('⚙  Compiling Svelte component...');
const svelteSource = generateSvelteComponent(design);
const compiled = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug:    'flux-mock',
});

fs.writeFileSync('flux-mock.html', compiled);
console.log(`✓  Compiled — ${Math.round(compiled.length / 1024)}KB`);

// Publish to zenbin.org/p/flux-mock (stable, no subdomain)
function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, m => { let d=''; m.on('data',c=>d+=c); m.on('end',()=>res({status:m.statusCode,body:d})); });
    r.on('error',rej); if(body) r.write(body); r.end();
  });
}

console.log('📤 Publishing to zenbin.org/p/flux-mock...');
const body = Buffer.from(JSON.stringify({ html: compiled }));
const r = await req({
  hostname: 'zenbin.org',
  path: '/v1/pages/flux-mock?overwrite=true',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
}, body);

if (r.status === 200 || r.status === 201) {
  console.log(`✓  Live at https://zenbin.org/p/flux-mock (${r.status})`);
} else {
  console.log(`✗  ZenBin ${r.status}: ${r.body.slice(0, 200)}`);
}
