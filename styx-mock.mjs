import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'STYX',
  tagline:   'AI Threat Intelligence & Security Operations',
  archetype: 'productivity',
  palette: {
    bg:      '#010314',
    surface: '#080C24',
    text:    '#DFE1F4',
    accent:  '#6633EE',
    accent2: '#8B5CF6',
    muted:   'rgba(94, 96, 119, 0.5)',
  },
  screens: [
    {
      id: 'home', label: 'Command Center',
      content: [
        { type: 'metric', label: 'Threat Index', value: '74', sub: '↑ ELEVATED — 5 new threats today' },
        { type: 'metric-row', items: [
          { label: 'Active Threats', value: '23' },
          { label: 'Blocked Today',  value: '1.8K' },
          { label: 'Detect Time',    value: '4.2s' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Brute Force — SSH',     sub: '10.4.2.17 → prod-db-01 · LAPSUS$ 89%', badge: '🔴 CRITICAL' },
          { icon: 'alert', title: 'SQL Injection Attempt', sub: '45.33.102.4 → api.styx.io · CVE-2025-0891', badge: '🟠 HIGH' },
          { icon: 'check', title: 'TOR Node Blocked',      sub: '185.220.101.x · Auto-rule #44', badge: '✅ BLOCKED' },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Coordinated attack from 3 IPs. Pattern matches LAPSUS$ TTPs (89% confidence). Playbook #7 recommended.' },
      ],
    },
    {
      id: 'threats', label: 'Threat Feed',
      content: [
        { type: 'tags', label: 'Filter by severity', items: ['All', 'Critical', 'High', 'Blocked', 'AI Only'] },
        { type: 'metric-row', items: [
          { label: 'Events 24h', value: '1,847' },
          { label: 'Critical',   value: '23' },
          { label: 'Blocked',    value: '1,824' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Brute Force — SSH',         sub: '09:41 · 🇷🇺 RU · 340 attempts/2min', badge: '🔴 CRITICAL' },
          { icon: 'alert', title: 'SQL Injection Attempt',     sub: '09:41 · 🇨🇳 CN · WAF blocked', badge: '🟠 HIGH' },
          { icon: 'alert', title: 'Anomalous Data Exfil',      sub: '09:40 · Internal · 14.2MB transfer', badge: '🟠 HIGH' },
          { icon: 'eye',   title: 'Port Scan — Subnet',        sub: '09:39 · Lateral movement detected', badge: '🔵 MEDIUM' },
          { icon: 'check', title: 'CVE-2025-1134 Blocked',     sub: '09:37 · 🇧🇷 BR · Signature match', badge: '✅ BLOCKED' },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incident',
      content: [
        { type: 'metric', label: 'INC-2024-0847 · CRITICAL', value: 'ACTIVE', sub: 'Brute Force — SSH Production DB' },
        { type: 'list', items: [
          { icon: 'alert',    title: '09:39 — First login attempt',       sub: 'Rate threshold not yet exceeded', badge: '🟠 Start' },
          { icon: 'activity', title: '09:39 — Rate > 50 req/min',         sub: 'Escalation threshold breached', badge: '🟠 Escalate' },
          { icon: 'star',     title: '09:40 — AI: LAPSUS$ pattern',       sub: '89% confidence attribution', badge: '🟣 AI' },
          { icon: 'zap',      title: '09:41 — Host auto-isolated',        sub: 'prod-db-01 network segmented', badge: '🔵 Action' },
          { icon: 'check',    title: '09:41 — SOC notified',              sub: 'PagerDuty alert sent', badge: '✅ Done' },
        ]},
        { type: 'text', label: 'AI Analysis', value: 'Coordinated intrusion. No data breach detected. Auto-isolation complete. Playbook #7 estimated containment < 4 minutes.' },
      ],
    },
    {
      id: 'playbooks', label: 'Playbooks',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running',  value: '3' },
          { label: 'Ready',    value: '9' },
          { label: 'Total Runs', value: '53' },
        ]},
        { type: 'progress', items: [
          { label: '#7 Coordinated Intrusion (RUNNING)', pct: 60 },
          { label: '#3 DDoS Mitigation (RUNNING)',       pct: 82 },
          { label: '#11 Insider Threat (RUNNING)',       pct: 30 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Playbook #7 — Coordinated Intrusion', sub: 'Isolate → Block → Notify → Forensics → Patch', badge: '🔵 60%' },
          { icon: 'activity', title: 'Playbook #3 — DDoS Mitigation',       sub: 'Rate limit → GeoBlock → CDN Shield → Alert', badge: '🔵 82%' },
          { icon: 'alert',    title: 'Playbook #2 — Ransomware Containment', sub: 'Last run: 3 days ago · 1 total run', badge: '✅ READY' },
        ]},
      ],
    },
    {
      id: 'intel', label: 'Threat Intel',
      content: [
        { type: 'metric-row', items: [
          { label: 'Actors Tracked', value: '47' },
          { label: 'IOCs Active',    value: '1,240' },
          { label: 'Sig Coverage',   value: '99.7%' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'LAPSUS$',           sub: '🇧🇷 Brazil · Data theft · 84 IOCs · 14 campaigns', badge: '⚠️ 94/100' },
          { icon: 'alert', title: 'Scattered Spider',  sub: '🌐 US/UK · BEC + Ransomware · 62 IOCs', badge: '⚠️ 88/100' },
          { icon: 'alert', title: 'APT-41',            sub: '🇨🇳 China · State-sponsored · 214 IOCs', badge: '💀 96/100' },
          { icon: 'alert', title: 'Midnight Blizzard', sub: '🇷🇺 Russia · SVR-linked · 198 IOCs', badge: '💀 99/100' },
        ]},
        { type: 'tags', label: 'Active TTPs', items: ['Brute Force', 'SQL Injection', 'Phishing', 'BEC', 'Supply Chain', 'Zero-Day'] },
      ],
    },
  ],
  nav: [
    { id: 'home',      label: 'Command', icon: 'home' },
    { id: 'threats',   label: 'Threats', icon: 'alert' },
    { id: 'incidents', label: 'Incident', icon: 'activity' },
    { id: 'playbooks', label: 'Playbooks', icon: 'zap' },
    { id: 'intel',     label: 'Intel',  icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building STYX Svelte 5 mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'styx-mock', 'STYX — Interactive Mock');
console.log('Mock live at:', result.url);
