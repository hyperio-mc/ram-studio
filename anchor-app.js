/**
 * Anchor — Deploy with confidence
 * Deployment readiness & reliability dashboard
 * Light theme — rotating from ZENITH (dark)
 * Inspired by: Land-book "Interfere" site & minimal.gallery SaaS category
 */

const fs = require('fs');
const path = require('path');

const SLUG = 'anchor-deploy';
const APP_NAME = 'Anchor';
const TAGLINE = 'Deploy with confidence';

// ─── PALETTE ────────────────────────────────────────────────────────────────
const palette = {
  bg:      '#F2F5FB',
  surface: '#FFFFFF',
  border:  '#E2E8F4',
  text:    '#0D1117',
  muted:   '#667085',
  accent:  '#2563EB',
  accent2: '#10B981',
  warn:    '#F59E0B',
  error:   '#EF4444',
};

// ─── SCREENS ────────────────────────────────────────────────────────────────
const screens = [

  // ── Screen 1: Overview ──────────────────────────────────────────────────
  {
    id: 'overview',
    label: 'Overview',
    bg: palette.bg,
    elements: [
      // Header bar
      {
        type: 'rect', x: 0, y: 0, w: 390, h: 56,
        fill: palette.surface, stroke: palette.border, strokeWidth: 1,
      },
      { type: 'text', x: 20, y: 34, text: 'Anchor', font: 'Inter', size: 18, weight: 700, color: palette.accent },
      { type: 'text', x: 20, y: 52, text: 'Reliability Dashboard', font: 'Inter', size: 11, weight: 400, color: palette.muted },
      // Live badge
      {
        type: 'rect', x: 310, y: 16, w: 62, h: 22, r: 11,
        fill: '#DCFCE7',
      },
      { type: 'text', x: 326, y: 31, text: '● LIVE', font: 'Inter', size: 10, weight: 600, color: '#16A34A' },

      // ── Reliability Score Card ────────────────────────────────────────────
      {
        type: 'rect', x: 16, y: 68, w: 358, h: 132, r: 16,
        fill: palette.accent, shadow: '0 8px 32px rgba(37,99,235,0.22)',
      },
      { type: 'text', x: 32, y: 96, text: 'Overall Reliability', font: 'Inter', size: 12, weight: 500, color: 'rgba(255,255,255,0.7)' },
      { type: 'text', x: 32, y: 142, text: '99.7%', font: 'Inter', size: 52, weight: 800, color: '#FFFFFF' },
      { type: 'text', x: 32, y: 172, text: '↑ 0.2% vs last 30 days', font: 'Inter', size: 12, weight: 400, color: 'rgba(255,255,255,0.6)' },
      // Error budget pill
      {
        type: 'rect', x: 256, y: 82, w: 102, h: 28, r: 8,
        fill: 'rgba(255,255,255,0.15)',
      },
      { type: 'text', x: 270, y: 101, text: 'Budget: 87%', font: 'Inter', size: 11, weight: 600, color: '#FFFFFF' },

      // ── Stat Cards Row ────────────────────────────────────────────────────
      // Card 1: Active Incidents
      {
        type: 'rect', x: 16, y: 212, w: 110, h: 82, r: 12,
        fill: palette.surface, stroke: palette.border, strokeWidth: 1,
      },
      { type: 'text', x: 28, y: 234, text: 'Incidents', font: 'Inter', size: 11, weight: 500, color: palette.muted },
      { type: 'text', x: 28, y: 264, text: '0', font: 'Inter', size: 32, weight: 800, color: palette.text },
      { type: 'text', x: 28, y: 284, text: 'active', font: 'Inter', size: 10, weight: 400, color: palette.accent2 },

      // Card 2: Deploys Today
      {
        type: 'rect', x: 140, y: 212, w: 110, h: 82, r: 12,
        fill: palette.surface, stroke: palette.border, strokeWidth: 1,
      },
      { type: 'text', x: 152, y: 234, text: 'Deploys', font: 'Inter', size: 11, weight: 500, color: palette.muted },
      { type: 'text', x: 152, y: 264, text: '14', font: 'Inter', size: 32, weight: 800, color: palette.text },
      { type: 'text', x: 152, y: 284, text: 'today', font: 'Inter', size: 10, weight: 400, color: palette.muted },

      // Card 3: MTTR
      {
        type: 'rect', x: 264, y: 212, w: 110, h: 82, r: 12,
        fill: palette.surface, stroke: palette.border, strokeWidth: 1,
      },
      { type: 'text', x: 276, y: 234, text: 'MTTR', font: 'Inter', size: 11, weight: 500, color: palette.muted },
      { type: 'text', x: 276, y: 264, text: '4m', font: 'Inter', size: 32, weight: 800, color: palette.text },
      { type: 'text', x: 276, y: 284, text: 'avg recovery', font: 'Inter', size: 10, weight: 400, color: palette.muted },

      // ── Services Section ──────────────────────────────────────────────────
      { type: 'text', x: 20, y: 316, text: 'Services', font: 'Inter', size: 14, weight: 700, color: palette.text },
      { type: 'text', x: 322, y: 316, text: 'See all', font: 'Inter', size: 12, weight: 500, color: palette.accent },

      // Service rows
      ...[
        { name: 'api-gateway', uptime: '100%', status: 'healthy', color: palette.accent2 },
        { name: 'auth-service', uptime: '99.9%', status: 'healthy', color: palette.accent2 },
        { name: 'payments', uptime: '99.4%', status: 'degraded', color: palette.warn },
      ].map((svc, i) => [
        {
          type: 'rect', x: 16, y: 328 + i * 58, w: 358, h: 50, r: 10,
          fill: palette.surface, stroke: palette.border, strokeWidth: 1,
        },
        { type: 'circle', x: 44, y: 353 + i * 58, r: 6, fill: svc.color },
        { type: 'text', x: 60, y: 349 + i * 58, text: svc.name, font: 'Inter Mono', size: 13, weight: 600, color: palette.text },
        { type: 'text', x: 60, y: 367 + i * 58, text: svc.status, font: 'Inter', size: 11, weight: 400, color: palette.muted },
        { type: 'text', x: 330, y: 356 + i * 58, text: svc.uptime, font: 'Inter', size: 13, weight: 700, color: svc.status === 'healthy' ? palette.accent2 : palette.warn },
      ]).flat(),

      // ── Bottom Nav ────────────────────────────────────────────────────────
      {
        type: 'rect', x: 0, y: 790, w: 390, h: 64,
        fill: palette.surface, stroke: palette.border, strokeWidth: 1,
      },
      ...[
        { label: 'Home', x: 39, active: true },
        { label: 'Deploy', x: 117, active: false },
        { label: 'Services', x: 195, active: false },
        { label: 'Incidents', x: 273, active: false },
        { label: 'On-Call', x: 351, active: false },
      ].map(n => [
        { type: 'circle', x: n.x, y: 812, r: 4, fill: n.active ? palette.accent : palette.border },
        { type: 'text', x: n.x, y: 830, text: n.label, font: 'Inter', size: 9, weight: n.active ? 700 : 400, color: n.active ? palette.accent : palette.muted, align: 'center' },
      ]).flat(),
    ],
  },

  // ── Screen 2: Deploy Ready ────────────────────────────────────────────────
  {
    id: 'deploy',
    label: 'Deploy Ready',
    bg: palette.bg,
    elements: [
      // Header
      { type: 'rect', x: 0, y: 0, w: 390, h: 56, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      { type: 'text', x: 20, y: 34, text: '← Deploy Checklist', font: 'Inter', size: 16, weight: 700, color: palette.text },

      // Target deploy badge
      { type: 'rect', x: 16, y: 68, w: 358, h: 58, r: 12, fill: '#EFF6FF', stroke: '#BFDBFE', strokeWidth: 1 },
      { type: 'text', x: 32, y: 88, text: 'api-gateway v2.14.1', font: 'Inter Mono', size: 14, weight: 700, color: palette.accent },
      { type: 'text', x: 32, y: 108, text: 'main → production · requested by dan@team.co', font: 'Inter', size: 11, weight: 400, color: palette.muted },

      // ── Confidence Meter ─────────────────────────────────────────────────
      { type: 'rect', x: 16, y: 140, w: 358, h: 100, r: 12, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      { type: 'text', x: 32, y: 162, text: 'Deploy Confidence', font: 'Inter', size: 12, weight: 600, color: palette.muted },
      { type: 'text', x: 32, y: 196, text: '92', font: 'Inter', size: 44, weight: 800, color: palette.text },
      { type: 'text', x: 82, y: 196, text: '/ 100', font: 'Inter', size: 18, weight: 400, color: palette.muted },
      // Progress bar
      { type: 'rect', x: 32, y: 208, w: 326, h: 8, r: 4, fill: palette.border },
      { type: 'rect', x: 32, y: 208, w: 300, h: 8, r: 4, fill: palette.accent },
      { type: 'text', x: 32, y: 232, text: 'High confidence — safe to deploy', font: 'Inter', size: 11, weight: 500, color: palette.accent2 },

      // ── Pre-flight Checks ────────────────────────────────────────────────
      { type: 'text', x: 20, y: 260, text: 'Pre-flight Checks', font: 'Inter', size: 14, weight: 700, color: palette.text },

      ...[
        { label: 'All tests passing', detail: '1,847 / 1,847 tests', status: 'pass' },
        { label: 'Coverage threshold', detail: '94.2% (req: 90%)', status: 'pass' },
        { label: 'No open P0 issues', detail: 'GitHub Issues clear', status: 'pass' },
        { label: 'p99 latency nominal', detail: '142ms (threshold: 200ms)', status: 'pass' },
        { label: 'Staging canary healthy', detail: '1h soak, 0 errors', status: 'pass' },
        { label: 'DB migration reviewed', detail: '1 pending migration', status: 'warn' },
      ].map((check, i) => [
        {
          type: 'rect', x: 16, y: 272 + i * 54, w: 358, h: 46, r: 10,
          fill: palette.surface, stroke: check.status === 'warn' ? '#FDE68A' : palette.border, strokeWidth: 1,
        },
        {
          type: 'rect', x: 16, y: 272 + i * 54, w: 6, h: 46, r: [3, 0, 0, 3],
          fill: check.status === 'pass' ? palette.accent2 : palette.warn,
        },
        { type: 'text', x: 34, y: 292 + i * 54, text: check.label, font: 'Inter', size: 13, weight: 600, color: palette.text },
        { type: 'text', x: 34, y: 308 + i * 54, text: check.detail, font: 'Inter', size: 11, weight: 400, color: palette.muted },
        { type: 'text', x: 342, y: 298 + i * 54, text: check.status === 'pass' ? '✓' : '!', font: 'Inter', size: 16, weight: 700, color: check.status === 'pass' ? palette.accent2 : palette.warn },
      ]).flat(),

      // Deploy button
      { type: 'rect', x: 16, y: 604, w: 358, h: 52, r: 14, fill: palette.accent },
      { type: 'text', x: 195, y: 634, text: 'Deploy to Production', font: 'Inter', size: 16, weight: 700, color: '#FFFFFF', align: 'center' },

      // Bottom nav
      { type: 'rect', x: 0, y: 790, w: 390, h: 64, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      ...[
        { label: 'Home', x: 39, active: false },
        { label: 'Deploy', x: 117, active: true },
        { label: 'Services', x: 195, active: false },
        { label: 'Incidents', x: 273, active: false },
        { label: 'On-Call', x: 351, active: false },
      ].map(n => [
        { type: 'circle', x: n.x, y: 812, r: 4, fill: n.active ? palette.accent : palette.border },
        { type: 'text', x: n.x, y: 830, text: n.label, font: 'Inter', size: 9, weight: n.active ? 700 : 400, color: n.active ? palette.accent : palette.muted, align: 'center' },
      ]).flat(),
    ],
  },

  // ── Screen 3: Services ───────────────────────────────────────────────────
  {
    id: 'services',
    label: 'Services',
    bg: palette.bg,
    elements: [
      { type: 'rect', x: 0, y: 0, w: 390, h: 56, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      { type: 'text', x: 20, y: 34, text: 'Services', font: 'Inter', size: 18, weight: 700, color: palette.text },
      { type: 'text', x: 340, y: 34, text: '8 total', font: 'Inter', size: 12, weight: 500, color: palette.muted },

      // SLA summary strip
      { type: 'rect', x: 16, y: 68, w: 358, h: 48, r: 12, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      { type: 'text', x: 30, y: 88, text: '7 healthy', font: 'Inter', size: 13, weight: 700, color: palette.accent2 },
      { type: 'text', x: 110, y: 88, text: '·', font: 'Inter', size: 13, color: palette.border },
      { type: 'text', x: 122, y: 88, text: '1 degraded', font: 'Inter', size: 13, weight: 600, color: palette.warn },
      { type: 'text', x: 220, y: 88, text: '·', font: 'Inter', size: 13, color: palette.border },
      { type: 'text', x: 232, y: 88, text: '0 down', font: 'Inter', size: 13, weight: 600, color: palette.muted },
      { type: 'text', x: 30, y: 106, text: 'All SLAs within threshold', font: 'Inter', size: 10, weight: 400, color: palette.muted },

      // Service list
      ...[
        { name: 'api-gateway', team: 'Platform', uptime: '100%', rps: '4,281 req/s', health: 'healthy' },
        { name: 'auth-service', team: 'Security', uptime: '99.9%', rps: '1,103 req/s', health: 'healthy' },
        { name: 'payments', team: 'Commerce', uptime: '99.4%', rps: '312 req/s', health: 'degraded' },
        { name: 'notifications', team: 'Growth', uptime: '100%', rps: '820 req/s', health: 'healthy' },
        { name: 'search', team: 'Discovery', uptime: '100%', rps: '2,041 req/s', health: 'healthy' },
        { name: 'storage', team: 'Platform', uptime: '100%', rps: '660 req/s', health: 'healthy' },
      ].map((svc, i) => [
        {
          type: 'rect', x: 16, y: 128 + i * 66, w: 358, h: 58, r: 12,
          fill: palette.surface,
          stroke: svc.health === 'degraded' ? '#FDE68A' : palette.border,
          strokeWidth: 1,
        },
        // Status dot
        { type: 'circle', x: 38, y: 157 + i * 66, r: 7, fill: svc.health === 'healthy' ? palette.accent2 : palette.warn },
        // Service name
        { type: 'text', x: 56, y: 150 + i * 66, text: svc.name, font: 'Inter Mono', size: 13, weight: 700, color: palette.text },
        { type: 'text', x: 56, y: 168 + i * 66, text: svc.team + ' · ' + svc.rps, font: 'Inter', size: 11, weight: 400, color: palette.muted },
        // Uptime
        { type: 'text', x: 340, y: 157 + i * 66, text: svc.uptime, font: 'Inter', size: 13, weight: 700, color: svc.health === 'healthy' ? palette.accent2 : palette.warn, align: 'right' },
      ]).flat(),

      // Bottom nav
      { type: 'rect', x: 0, y: 790, w: 390, h: 64, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      ...[
        { label: 'Home', x: 39, active: false },
        { label: 'Deploy', x: 117, active: false },
        { label: 'Services', x: 195, active: true },
        { label: 'Incidents', x: 273, active: false },
        { label: 'On-Call', x: 351, active: false },
      ].map(n => [
        { type: 'circle', x: n.x, y: 812, r: 4, fill: n.active ? palette.accent : palette.border },
        { type: 'text', x: n.x, y: 830, text: n.label, font: 'Inter', size: 9, weight: n.active ? 700 : 400, color: n.active ? palette.accent : palette.muted, align: 'center' },
      ]).flat(),
    ],
  },

  // ── Screen 4: Incidents ──────────────────────────────────────────────────
  {
    id: 'incidents',
    label: 'Incidents',
    bg: palette.bg,
    elements: [
      { type: 'rect', x: 0, y: 0, w: 390, h: 56, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      { type: 'text', x: 20, y: 34, text: 'Incidents', font: 'Inter', size: 18, weight: 700, color: palette.text },

      // Active incidents section
      { type: 'text', x: 20, y: 74, text: 'ACTIVE', font: 'Inter', size: 10, weight: 700, color: palette.muted },
      { type: 'rect', x: 16, y: 84, w: 358, h: 60, r: 12, fill: '#F0FDF4', stroke: '#BBF7D0', strokeWidth: 1 },
      { type: 'text', x: 32, y: 106, text: 'No active incidents', font: 'Inter', size: 14, weight: 700, color: palette.accent2 },
      { type: 'text', x: 32, y: 124, text: 'All systems operational', font: 'Inter', size: 12, weight: 400, color: palette.muted },

      // MTTR stats
      { type: 'text', x: 20, y: 164, text: 'RELIABILITY METRICS', font: 'Inter', size: 10, weight: 700, color: palette.muted },
      ...[
        { label: 'MTTR (30d)', value: '4m 12s', sub: '↓ 38% improvement' },
        { label: 'MTTD (30d)', value: '1m 44s', sub: 'Time to detect' },
        { label: 'Error Budget', value: '87%', sub: 'Remaining (99.9% SLA)' },
      ].map((m, i) => [
        { type: 'rect', x: 16, y: 174 + i * 58, w: 358, h: 50, r: 10, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 32, y: 195 + i * 58, text: m.label, font: 'Inter', size: 11, weight: 500, color: palette.muted },
        { type: 'text', x: 32, y: 213 + i * 58, text: m.sub, font: 'Inter', size: 10, weight: 400, color: palette.accent2 },
        { type: 'text', x: 340, y: 205 + i * 58, text: m.value, font: 'Inter', size: 20, weight: 800, color: palette.text, align: 'right' },
      ]).flat(),

      // Past incidents
      { type: 'text', x: 20, y: 362, text: 'RECENT — RESOLVED', font: 'Inter', size: 10, weight: 700, color: palette.muted },

      ...[
        { title: 'Elevated payment errors', service: 'payments', ago: '2d ago', sev: 'P2', mttr: '6m' },
        { title: 'Auth latency spike', service: 'auth-service', ago: '5d ago', sev: 'P3', mttr: '3m' },
        { title: 'CDN cache miss storm', service: 'cdn', ago: '11d ago', sev: 'P2', mttr: '14m' },
      ].map((inc, i) => [
        { type: 'rect', x: 16, y: 372 + i * 68, w: 358, h: 60, r: 12, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
        {
          type: 'rect', x: 16, y: 372 + i * 68, w: 58, h: 22, r: [12, 0, 8, 0],
          fill: inc.sev === 'P2' ? '#FEF3C7' : '#EDE9FE',
        },
        { type: 'text', x: 34, y: 387 + i * 68, text: inc.sev, font: 'Inter', size: 10, weight: 700, color: inc.sev === 'P2' ? palette.warn : '#7C3AED' },
        { type: 'text', x: 32, y: 408 + i * 68, text: inc.title, font: 'Inter', size: 13, weight: 600, color: palette.text },
        { type: 'text', x: 32, y: 424 + i * 68, text: inc.service + ' · MTTR ' + inc.mttr, font: 'Inter', size: 11, weight: 400, color: palette.muted },
        { type: 'text', x: 350, y: 395 + i * 68, text: inc.ago, font: 'Inter', size: 10, weight: 400, color: palette.muted, align: 'right' },
      ]).flat(),

      // Bottom nav
      { type: 'rect', x: 0, y: 790, w: 390, h: 64, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      ...[
        { label: 'Home', x: 39, active: false },
        { label: 'Deploy', x: 117, active: false },
        { label: 'Services', x: 195, active: false },
        { label: 'Incidents', x: 273, active: true },
        { label: 'On-Call', x: 351, active: false },
      ].map(n => [
        { type: 'circle', x: n.x, y: 812, r: 4, fill: n.active ? palette.accent : palette.border },
        { type: 'text', x: n.x, y: 830, text: n.label, font: 'Inter', size: 9, weight: n.active ? 700 : 400, color: n.active ? palette.accent : palette.muted, align: 'center' },
      ]).flat(),
    ],
  },

  // ── Screen 5: On-Call ────────────────────────────────────────────────────
  {
    id: 'oncall',
    label: 'On-Call',
    bg: palette.bg,
    elements: [
      { type: 'rect', x: 0, y: 0, w: 390, h: 56, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      { type: 'text', x: 20, y: 34, text: 'On-Call', font: 'Inter', size: 18, weight: 700, color: palette.text },

      // Primary responder card
      { type: 'rect', x: 16, y: 68, w: 358, h: 100, r: 16, fill: palette.accent },
      { type: 'text', x: 32, y: 90, text: 'PRIMARY ON-CALL', font: 'Inter', size: 10, weight: 700, color: 'rgba(255,255,255,0.6)' },
      { type: 'circle', x: 56, y: 130, r: 22, fill: 'rgba(255,255,255,0.2)' },
      { type: 'text', x: 56, y: 135, text: 'DL', font: 'Inter', size: 14, weight: 800, color: '#FFFFFF', align: 'center' },
      { type: 'text', x: 92, y: 118, text: 'Dan Lee', font: 'Inter', size: 16, weight: 700, color: '#FFFFFF' },
      { type: 'text', x: 92, y: 138, text: 'Platform · Ends in 3h 22m', font: 'Inter', size: 12, weight: 400, color: 'rgba(255,255,255,0.7)' },
      { type: 'rect', x: 280, y: 116, w: 80, h: 28, r: 8, fill: 'rgba(255,255,255,0.2)' },
      { type: 'text', x: 320, y: 134, text: 'Page now', font: 'Inter', size: 11, weight: 700, color: '#FFFFFF', align: 'center' },

      // Rotation schedule
      { type: 'text', x: 20, y: 188, text: 'ROTATION SCHEDULE', font: 'Inter', size: 10, weight: 700, color: palette.muted },

      ...[
        { name: 'Sara Kim', team: 'Security', shift: 'Next · 3h 22m', initials: 'SK' },
        { name: 'Mo Okafor', team: 'Commerce', shift: 'Mon 00:00 UTC', initials: 'MO' },
        { name: 'Priya Singh', team: 'Discovery', shift: 'Tue 00:00 UTC', initials: 'PS' },
      ].map((person, i) => [
        { type: 'rect', x: 16, y: 200 + i * 66, w: 358, h: 58, r: 12, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
        { type: 'circle', x: 44, y: 229 + i * 66, r: 20, fill: palette.bg },
        { type: 'text', x: 44, y: 234 + i * 66, text: person.initials, font: 'Inter', size: 12, weight: 700, color: palette.muted, align: 'center' },
        { type: 'text', x: 76, y: 222 + i * 66, text: person.name, font: 'Inter', size: 14, weight: 600, color: palette.text },
        { type: 'text', x: 76, y: 240 + i * 66, text: person.team, font: 'Inter', size: 11, weight: 400, color: palette.muted },
        { type: 'text', x: 350, y: 229 + i * 66, text: person.shift, font: 'Inter', size: 11, weight: 500, color: i === 0 ? palette.accent : palette.muted, align: 'right' },
      ]).flat(),

      // Alert policies
      { type: 'text', x: 20, y: 408, text: 'ALERT POLICIES', font: 'Inter', size: 10, weight: 700, color: palette.muted },

      ...[
        { name: 'PagerDuty', sub: 'P0 + P1 incidents', enabled: true },
        { name: 'Slack #incidents', sub: 'All severity levels', enabled: true },
        { name: 'SMS Escalation', sub: 'P0 only · 5m no-ack', enabled: true },
        { name: 'Email Digest', sub: 'Daily summary 09:00 UTC', enabled: false },
      ].map((policy, i) => [
        { type: 'rect', x: 16, y: 420 + i * 54, w: 358, h: 46, r: 10, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 32, y: 440 + i * 54, text: policy.name, font: 'Inter', size: 13, weight: 600, color: palette.text },
        { type: 'text', x: 32, y: 456 + i * 54, text: policy.sub, font: 'Inter', size: 11, weight: 400, color: palette.muted },
        // Toggle
        { type: 'rect', x: 316, y: 433 + i * 54, w: 42, h: 22, r: 11, fill: policy.enabled ? palette.accent : palette.border },
        { type: 'circle', x: policy.enabled ? 348 : 327, y: 444 + i * 54, r: 9, fill: '#FFFFFF' },
      ]).flat(),

      // Bottom nav
      { type: 'rect', x: 0, y: 790, w: 390, h: 64, fill: palette.surface, stroke: palette.border, strokeWidth: 1 },
      ...[
        { label: 'Home', x: 39, active: false },
        { label: 'Deploy', x: 117, active: false },
        { label: 'Services', x: 195, active: false },
        { label: 'Incidents', x: 273, active: false },
        { label: 'On-Call', x: 351, active: true },
      ].map(n => [
        { type: 'circle', x: n.x, y: 812, r: 4, fill: n.active ? palette.accent : palette.border },
        { type: 'text', x: n.x, y: 830, text: n.label, font: 'Inter', size: 9, weight: n.active ? 700 : 400, color: n.active ? palette.accent : palette.muted, align: 'center' },
      ]).flat(),
    ],
  },
];

// ─── ASSEMBLE PEN FILE ───────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: APP_NAME,
    tagline: TAGLINE,
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    slug: SLUG,
  },
  canvas: { width: 390, height: 854 },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Pen file written: ${outPath}`);
console.log(`  Screens: ${screens.length}`);
