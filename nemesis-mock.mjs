import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NEMESIS',
  tagline:   'Tactical UAV Swarm Commander',
  archetype: 'productivity',
  palette: {
    bg:      '#080A0A',
    surface: '#121515',
    text:    '#D8E8E8',
    accent:  '#00E5B0',
    accent2: '#FFB830',
    muted:   'rgba(58,72,72,0.8)',
  },
  screens: [
    {
      id: 'overview', label: 'Mission Ops',
      content: [
        { type: 'metric', label: 'THREAT LEVEL', value: '3/5', sub: 'Elevated — 4 enemy UAVs detected' },
        { type: 'metric-row', items: [
          { label: 'Missions', value: '3' },
          { label: 'Drones Up', value: '12' },
          { label: 'Kills Today', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'OP-ALPHA-7', sub: 'Sector N-14 · Search & Intercept', badge: '🟢 LIVE' },
          { icon: 'alert',    title: 'OP-BRAVO-2', sub: 'Sector W-06 · Holding pattern',    badge: '🟡 HOLD' },
          { icon: 'map',      title: 'OP-DELTA-9', sub: 'Sector E-21 · Return to base',     badge: '⬜ RTB' },
        ]},
        { type: 'text', label: 'INTERCEPT INTEL', value: 'NMS-01 & NMS-02 closing on T-219 at N-14. ETA: 14 seconds. Authorize autonomous intercept.' },
      ],
    },
    {
      id: 'swarm', label: 'Swarm Status',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',   value: '5' },
          { label: 'Holding',  value: '2' },
          { label: 'RTB',      value: '2' },
          { label: 'Standby',  value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'NMS-01',  sub: 'OP-ALPHA-7 · INTERCEPT · Alt 120m', badge: '78% BAT' },
          { icon: 'zap',   title: 'NMS-02',  sub: 'OP-ALPHA-7 · PURSUIT · Alt 115m',   badge: '65% BAT' },
          { icon: 'zap',   title: 'NMS-03',  sub: 'OP-ALPHA-7 · PATROL · Alt 108m',    badge: '52% BAT' },
          { icon: 'alert', title: 'NMS-06',  sub: 'OP-DELTA-9 · RTB · Alt 60m',        badge: '⚠ 24%' },
          { icon: 'check', title: 'NMS-08',  sub: '— · STANDBY · Ground',              badge: '100% BAT' },
        ]},
        { type: 'progress', items: [
          { label: 'NMS-01 Battery', pct: 78 },
          { label: 'NMS-02 Battery', pct: 65 },
          { label: 'NMS-06 Battery ⚠', pct: 24 },
        ]},
      ],
    },
    {
      id: 'map', label: 'Tactical Map',
      content: [
        { type: 'metric', label: 'ACTIVE SECTOR', value: 'N-14', sub: 'OP-ALPHA-7 live intercept zone' },
        { type: 'list', items: [
          { icon: 'map',   title: 'ALPHA-7 → T-214', sub: '280° bearing · 1.2km range',   badge: '14s ETA' },
          { icon: 'map',   title: 'ALPHA-7 → T-219', sub: '264° bearing · 2.1km range',   badge: '28s ETA' },
          { icon: 'alert', title: 'BRAVO-2 → T-183', sub: 'On hold — awaiting clearance',  badge: 'HOLD' },
        ]},
        { type: 'tags', label: 'ACTIVE SECTORS', items: ['N-14', 'N-15', 'W-06', 'E-21'] },
        { type: 'text', label: 'THREAT MAP', value: '4 hostile UAVs detected across sectors N-14 and N-15. Grid squares showing enemy formation movement NW at ~40 km/h.' },
      ],
    },
    {
      id: 'brief', label: 'Mission Brief',
      content: [
        { type: 'metric', label: 'OPERATION CODE', value: 'ALPHA-7', sub: '// TOP SECRET // — Issued 09:00 UTC' },
        { type: 'list', items: [
          { icon: 'map',    title: 'SECTOR',            sub: 'North Grid N-14',                   badge: 'ACTIVE' },
          { icon: 'eye',    title: 'OBJECTIVE',         sub: 'Neutralize hostile UAV swarm',       badge: 'PRIMARY' },
          { icon: 'alert',  title: 'THREAT CLASS',      sub: 'Enemy kamikaze drones × 4',          badge: 'HIGH' },
          { icon: 'lock',   title: 'COMMS',             sub: '433.92 MHz / AES-256 encrypted',     badge: 'SECURE' },
        ]},
        { type: 'text', label: 'TARGET COORDINATES', value: '48.127° N  37.744° E — Donbas Front Sector N-14. Engagement rules: intercept only, no kinetic fire.' },
      ],
    },
    {
      id: 'alerts', label: 'Alert Log',
      content: [
        { type: 'metric-row', items: [
          { label: 'Intercepts', value: '4' },
          { label: 'Threats',    value: '3' },
          { label: 'Warnings',   value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: '09:38 INTERCEPT',  sub: 'NMS-01 neutralized T-214 @ N-14',   badge: '✓' },
          { icon: 'alert',    title: '09:36 THREAT',     sub: 'New UAV T-219 detected N-14',        badge: '◆' },
          { icon: 'activity', title: '09:34 INTERCEPT',  sub: 'NMS-02 closing on T-219 · 14s',     badge: '→' },
          { icon: 'alert',    title: '09:31 LOW BAT ⚠',  sub: 'NMS-06 battery critical · 24%',     badge: '!' },
          { icon: 'zap',      title: '09:28 THREAT',     sub: 'Swarm cluster detected W-06',        badge: '◆' },
          { icon: 'check',    title: '09:25 INTERCEPT',  sub: 'NMS-04 neutralized T-207 @ W-06',   badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'OPS',    icon: 'grid' },
    { id: 'map',      label: 'MAP',    icon: 'map' },
    { id: 'swarm',    label: 'SWARM',  icon: 'activity' },
    { id: 'brief',    label: 'BRIEF',  icon: 'lock' },
    { id: 'alerts',   label: 'ALERTS', icon: 'alert' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building NEMESIS Svelte 5 mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'nemesis-mock', 'NEMESIS — Interactive Tactical Mock');
console.log('Mock live at:', result.url);
