// Build mock HTML locally (ZenBin at 100-page limit)
import fs from 'fs';
import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CANARY',
  tagline:   "know when they're inside",
  archetype: 'deception-security',
  palette: {
    bg:      '#070B14',
    surface: '#0D1220',
    text:    '#E2E8F3',
    accent:  '#F5C842',
    accent2: '#EF4444',
    muted:   'rgba(107,126,154,0.9)',
  },
  lightPalette: {
    bg:      '#F4F6FA',
    surface: '#FFFFFF',
    text:    '#0D1220',
    accent:  '#C9960A',
    accent2: '#DC2626',
    muted:   'rgba(100,116,139,0.85)',
  },
  screens: [
    {
      id: 'nest', label: 'Nest',
      content: [
        { type: 'metric-row', items: [
          { label: 'Canaries', value: '24' },
          { label: 'Alerts', value: '3' },
          { label: 'Coverage', value: '87%' },
        ]},
        { type: 'progress', items: [
          { label: 'Cloud / IAM', pct: 92 },
          { label: 'Database', pct: 78 },
          { label: 'File Server', pct: 100 },
          { label: 'HR Systems', pct: 65 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'AWS Credentials Token', sub: 'Cloud / IAM · 4m ago', badge: 'CRIT' },
          { icon: 'alert', title: 'SQL Dump Canary File', sub: 'DB Server · 31m ago', badge: 'HIGH' },
          { icon: 'alert', title: 'HR Directory Document', sub: 'File Share · 2h ago', badge: 'MED' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'AWS Credentials Token', value: 'CRITICAL', sub: 'Cloud / IAM · triggered 4 minutes ago' },
        { type: 'list', items: [
          { icon: 'map', title: 'IP Address', sub: '185.220.101.47 · Tor Exit Node', badge: '🇷🇺' },
          { icon: 'eye', title: 'Protocol', sub: 'HTTPS / boto3 SDK · python-requests', badge: '' },
          { icon: 'activity', title: 'Actor', sub: 'APT-SHADOW-41 · Nation-state', badge: '84%' },
        ]},
        { type: 'tags', label: 'Recommended Actions', items: ['Rotate Credentials', 'Block IP', 'Create Incident', 'Alert SOC'] },
      ],
    },
    {
      id: 'map', label: 'Map',
      content: [
        { type: 'metric-row', items: [
          { label: 'Live', value: '19' },
          { label: 'Triggered', value: '3' },
          { label: 'Warning', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Cloud / IAM', sub: '5 canaries · 1 triggered', badge: '🔴' },
          { icon: 'alert', title: 'Database', sub: '4 canaries · 1 triggered', badge: '🟠' },
          { icon: 'check', title: 'File Server', sub: '6 canaries · clean', badge: '🟢' },
          { icon: 'check', title: 'Web Tier', sub: '4 canaries · clean', badge: '🟢' },
          { icon: 'alert', title: 'HR Systems', sub: '3 canaries · 1 triggered', badge: '🟡' },
        ]},
      ],
    },
    {
      id: 'intel', label: 'Intel',
      content: [
        { type: 'metric', label: 'Threat Actor', value: 'APT-SHADOW-41', sub: 'Nation-state · Russia · Confidence 84%' },
        { type: 'progress', items: [
          { label: 'Reconnaissance', pct: 100 },
          { label: 'Initial Access', pct: 80 },
          { label: 'Credential Access', pct: 90 },
          { label: 'Lateral Movement', pct: 60 },
          { label: 'Exfiltration', pct: 30 },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: '185.220.101.47', sub: 'Tor Exit Node · AS60729', badge: 'IP' },
          { icon: 'code', title: 'a4f3d8...c91e2b', sub: 'Dropper binary hash', badge: 'HASH' },
          { icon: 'lock', title: 'python-requests/2.28', sub: 'Scraper user-agent', badge: 'UA' },
        ]},
      ],
    },
    {
      id: 'deploy', label: 'Deploy',
      content: [
        { type: 'tags', label: 'Token Type', items: ['AWS Key ☁', 'Document 📄', 'SQL Dump 🗄', 'SSH Key 🔑'] },
        { type: 'metric', label: 'Target Zone', value: 'Cloud / IAM', sub: 'Tap to select zone' },
        { type: 'progress', items: [
          { label: 'Lure Quality: High Fidelity', pct: 82 },
        ]},
        { type: 'list', items: [
          { icon: 'bell', title: 'Push Notification', sub: 'Instant mobile alert', badge: '✓' },
          { icon: 'bell', title: 'PagerDuty', sub: 'On-call escalation', badge: '✓' },
          { icon: 'bell', title: 'Slack #incidents', sub: 'Team channel', badge: '—' },
        ]},
        { type: 'text', label: 'Ready to Deploy', value: 'Active within 30s. Zero false positives.' },
      ],
    },
  ],
  nav: [
    { id: 'nest',   label: 'Nest',   icon: 'home' },
    { id: 'alerts', label: 'Alerts', icon: 'bell' },
    { id: 'map',    label: 'Map',    icon: 'map' },
    { id: 'intel',  label: 'Intel',  icon: 'eye' },
    { id: 'deploy', label: 'Deploy', icon: 'plus' },
  ],
};

console.log('Building CANARY Svelte mock (local save)...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
fs.writeFileSync('/workspace/group/design-studio/canary-mock.html', html);
console.log('✓ Saved canary-mock.html (' + Math.round(html.length/1024) + ' KB)');
console.log('  ZenBin at 100-page cap — will publish when quota resets 2026-04-23');
