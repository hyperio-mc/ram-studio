import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPECTER',
  tagline:   'AI threat intelligence, real-time',
  archetype: 'cybersecurity-secops',
  palette: {
    bg:      '#09090D',
    surface: '#0E0F15',
    text:    '#E2E8F4',
    accent:  '#00FF88',
    accent2: '#F43F5E',
    muted:   'rgba(136,146,160,0.45)',
  },
  lightPalette: {
    bg:      '#F4F6FA',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#059669',
    accent2: '#DC2626',
    muted:   'rgba(13,17,23,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Threat Dashboard',
      content: [
        { type: 'metric', label: 'Threat Score', value: '8.4', sub: 'ELEVATED — global telemetry' },
        { type: 'metric-row', items: [
          { label: 'Active Incidents', value: '23' },
          { label: 'Blocked / hr', value: '1,847' },
          { label: 'Patched', value: '99.1%' },
        ]},
        { type: 'progress', items: [
          { label: 'Phishing', pct: 72 },
          { label: 'Ransomware', pct: 58 },
          { label: 'Zero-Day', pct: 41 },
          { label: 'Insider Threat', pct: 29 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Lateral movement — node 192.168.3.12', sub: 'HIGH · 11:47 UTC', badge: 'HIGH' },
          { icon: 'alert', title: 'Brute-force attempt — SSH exposed', sub: 'MED · 11:51 UTC', badge: 'MED' },
          { icon: 'alert', title: 'Anomalous DNS volume — endpoint 04', sub: 'LOW · 12:02 UTC', badge: 'LOW' },
        ]},
      ],
    },
    {
      id: 'feeds',
      label: 'Threat Feeds',
      content: [
        { type: 'tags', label: 'Filter', items: ['ALL', 'CRITICAL', 'MALWARE', 'EXPLOIT', 'PHISH'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Cobalt Strike C2 Infrastructure Expanded', sub: 'ThreatConnect · CRITICAL', badge: '!' },
          { icon: 'zap', title: 'CVE-2026-0021 POC Published to GitHub', sub: 'NVD + GitHub Scan · CRITICAL', badge: '!' },
          { icon: 'alert', title: 'Conti Successor — Healthcare Sector', sub: 'CrowdStrike Intel · HIGH', badge: '↑' },
          { icon: 'alert', title: 'Mass Phishing Wave — O365 Lookalikes', sub: 'PhishLabs · HIGH', badge: '↑' },
          { icon: 'eye', title: 'Quasar RAT Variant — Finance Targets', sub: 'Recorded Future · MED', badge: '~' },
        ]},
        { type: 'text', label: 'Sources', value: '12 intel feeds active · Updated 3s ago · CrowdStrike, Recorded Future, ThreatConnect, PhishLabs, DarkOwl' },
      ],
    },
    {
      id: 'hunt',
      label: 'Threat Hunt',
      content: [
        { type: 'text', label: 'Active Query', value: '> process.name:"cmd.exe" AND parent.name:"word.exe"' },
        { type: 'metric-row', items: [
          { label: 'Results', value: '847' },
          { label: 'Endpoints', value: '23' },
          { label: 'Timespan', value: '180d' },
        ]},
        { type: 'tags', label: 'MITRE ATT&CK', items: ['T1059.003', 'T1055', 'T1071', 'TA0011'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'WORKSTATION-042', sub: 'PID 4821 · 11:47:22', badge: 'CRIT' },
          { icon: 'activity', title: 'LAPTOP-JCHEN', sub: 'PID 3204 · 11:51:09', badge: 'CRIT' },
          { icon: 'activity', title: 'SERVER-PROD-03', sub: 'PID 9102 · 12:02:44', badge: 'HIGH' },
          { icon: 'activity', title: 'WORKSTATION-017', sub: 'PID 1847 · 12:18:31', badge: 'HIGH' },
          { icon: 'activity', title: 'LAPTOP-MKHAN', sub: 'PID 6623 · 12:24:55', badge: 'MED' },
        ]},
      ],
    },
    {
      id: 'intel',
      label: 'APT-29 Intel',
      content: [
        { type: 'metric', label: 'APT-29 — COZY BEAR', value: '9.5', sub: 'Priority Watch · SVR Affiliate · Russia' },
        { type: 'metric-row', items: [
          { label: 'Sophistication', value: '9.2' },
          { label: 'Active Score', value: '8.7' },
          { label: 'Impact', value: '9.5' },
        ]},
        { type: 'list', items: [
          { icon: 'code', title: 'Initial Access', sub: 'Spearphishing — T1566', badge: 'TTP' },
          { icon: 'code', title: 'Persistence', sub: 'Registry Run Keys — T1547', badge: 'TTP' },
          { icon: 'code', title: 'C2 Channel', sub: 'Encrypted comms — T1573', badge: 'TTP' },
          { icon: 'code', title: 'Exfiltration', sub: 'Cloud Storage — T1567', badge: 'TTP' },
        ]},
        { type: 'tags', label: 'Recent Campaigns', items: ['WellMess v3', 'MiniDuke', 'CloudAtlas EU'] },
      ],
    },
    {
      id: 'incident',
      label: 'Incident Detail',
      content: [
        { type: 'metric', label: 'INC-2026-0847', value: '↑ 8.1', sub: 'Lateral movement via SMB · INVESTIGATING' },
        { type: 'metric-row', items: [
          { label: 'Hosts', value: '12' },
          { label: 'Accounts', value: '3' },
          { label: 'Data Risk', value: '2.4TB' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Phishing email → macro execution', sub: '11:02 UTC · CONFIRMED', badge: '✓' },
          { icon: 'check', title: 'PowerShell spawn · WMI', sub: '11:18 UTC · CONFIRMED', badge: '✓' },
          { icon: 'check', title: 'Registry run key installed', sub: '11:31 UTC · CONFIRMED', badge: '✓' },
          { icon: 'check', title: 'Pass-the-hash · SMB sweep', sub: '11:47 UTC · CONFIRMED', badge: '✓' },
          { icon: 'activity', title: 'HTTPS beacon to C2 server', sub: 'ACTIVE · Investigating', badge: '!' },
          { icon: 'eye', title: 'Exfiltration', sub: 'PENDING · Not yet observed', badge: '?' },
        ]},
      ],
    },
    {
      id: 'ops',
      label: 'Ops Console',
      content: [
        { type: 'metric-row', items: [
          { label: 'SIEM', value: '100%' },
          { label: 'EDR', value: '100%' },
          { label: 'SOAR', value: '67%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'CrowdStrike Falcon', sub: 'EDR · 2.4M events/h', badge: '✓' },
          { icon: 'activity', title: 'Splunk Enterprise', sub: 'SIEM · 8.1M events/h', badge: '✓' },
          { icon: 'activity', title: 'Microsoft Sentinel', sub: 'Cloud SIEM · 1.9M events/h', badge: '✓' },
          { icon: 'activity', title: 'ThreatConnect', sub: 'Threat Intel · 12K/h', badge: '✓' },
          { icon: 'activity', title: 'Recorded Future', sub: 'Threat Intel · 8K/h', badge: '✓' },
          { icon: 'alert', title: 'Palo Alto XSOAR', sub: 'SOAR · 430/h · DEGRADED', badge: '!' },
        ]},
        { type: 'text', label: 'Build', value: 'SPECTER v3.1.0 · build 20260411 · 180d log retention · AES-256 encryption' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Threat', icon: 'zap' },
    { id: 'feeds', label: 'Feeds', icon: 'list' },
    { id: 'hunt', label: 'Hunt', icon: 'search' },
    { id: 'intel', label: 'Intel', icon: 'layers' },
    { id: 'ops', label: 'Ops', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'specter-mock', 'SPECTER — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/specter-mock');
