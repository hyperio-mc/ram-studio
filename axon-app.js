// AXON — AI Workflow Router
// Inspired by: Codegen.com's "OS for Code Agents" dark aesthetic
// Trend: Deep charcoal-black bases, integration badge UX, neon accent pops
// Theme: DARK (previous was light/quill)

'use strict';
const fs = require('fs');

const SLUG = 'axon';
const APP_NAME = 'Axon';
const TAGLINE = 'Route your AI workflows';

const palette = {
  bg: '#0D0E12',
  surface: '#13151C',
  surface2: '#1A1D27',
  border: '#252836',
  text: '#F0F1F5',
  textMuted: 'rgba(240,241,245,0.45)',
  accent: '#00D4AA',
  accent2: '#7B61FF',
  danger: '#FF4B6E',
};

const pen = {
  version: '2.8',
  meta: {
    name: 'Axon',
    slug: SLUG,
    tagline: TAGLINE,
    description: 'AI workflow router for developers. Orchestrate multi-step AI pipelines across your stack.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    inspiration: 'Codegen.com — OS for Code Agents with integration badge UX and deep near-black aesthetic',
    tags: ['ai', 'workflow', 'developer-tools', 'dark', 'automation'],
  },
  canvas: { width: 390, height: 844, platform: 'mobile' },
  palette,
  screens: [

    // ── SCREEN 1 ── Dashboard
    {
      id: 'dashboard',
      name: 'Dashboard',
      bg: palette.bg,
      elements: [
        // Status bar
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },
        // Header
        { type: 'text', x: 20, y: 72, text: 'AXON', fontSize: 22, fontWeight: '800', color: palette.text, letterSpacing: 3 },
        { type: 'text', x: 20, y: 94, text: 'Route your AI workflows', fontSize: 13, color: palette.textMuted },
        { type: 'rect', x: 342, y: 58, w: 36, h: 36, rx: 18, fill: palette.surface2 },
        { type: 'text', x: 360, y: 82, text: 'R', fontSize: 14, fontWeight: '700', color: palette.accent, textAnchor: 'middle' },
        // Live status bar
        { type: 'rect', x: 16, y: 112, w: 358, h: 52, rx: 10, fill: palette.surface },
        { type: 'rect', x: 16, y: 112, w: 358, h: 52, rx: 10, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'circle', cx: 40, cy: 138, r: 5, fill: palette.accent },
        { type: 'circle', cx: 40, cy: 138, r: 9, fill: 'none', stroke: palette.accent, strokeWidth: 1, opacity: 0.3 },
        { type: 'text', x: 55, y: 134, text: '3 workflows running', fontSize: 13, fontWeight: '600', color: palette.text },
        { type: 'text', x: 55, y: 150, text: '12 tasks completed today', fontSize: 11, color: palette.textMuted },
        { type: 'rect', x: 318, y: 122, w: 42, h: 24, rx: 6, fill: 'rgba(0,212,170,0.12)' },
        { type: 'text', x: 339, y: 139, text: 'LIVE', fontSize: 10, fontWeight: '700', color: palette.accent, textAnchor: 'middle', letterSpacing: 1 },
        // Section label
        { type: 'text', x: 20, y: 190, text: 'ACTIVE WORKFLOWS', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        // Workflow card 1 — running
        { type: 'rect', x: 16, y: 204, w: 358, h: 90, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 204, w: 358, h: 90, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 16, y: 204, w: 3, h: 90, rx: 2, fill: palette.accent },
        { type: 'text', x: 36, y: 228, text: 'PR Review Assistant', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 36, y: 246, text: 'github → claude → linear', fontSize: 11, color: palette.textMuted },
        { type: 'rect', x: 286, y: 218, w: 70, h: 22, rx: 11, fill: 'rgba(0,212,170,0.12)' },
        { type: 'circle', cx: 298, cy: 229, r: 3.5, fill: palette.accent },
        { type: 'text', x: 321, y: 233, text: 'Running', fontSize: 11, color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 36, y: 260, w: 54, h: 20, rx: 5, fill: 'rgba(0,212,170,0.15)' },
        { type: 'text', x: 63, y: 274, text: 'Fetch PR', fontSize: 10, color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 96, y: 260, w: 58, h: 20, rx: 5, fill: 'rgba(0,212,170,0.15)' },
        { type: 'text', x: 125, y: 274, text: 'Analyze', fontSize: 10, color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 160, y: 260, w: 50, h: 20, rx: 5, fill: palette.surface2 },
        { type: 'text', x: 185, y: 274, text: 'Post', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 330, y: 274, text: 'Step 2/3', fontSize: 11, color: palette.textMuted },
        // Workflow card 2 — queued
        { type: 'rect', x: 16, y: 306, w: 358, h: 90, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 306, w: 358, h: 90, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 16, y: 306, w: 3, h: 90, rx: 2, fill: palette.accent2 },
        { type: 'text', x: 36, y: 330, text: 'Daily Standup Summarizer', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 36, y: 348, text: 'slack → gpt-4 → notion', fontSize: 11, color: palette.textMuted },
        { type: 'rect', x: 290, y: 320, w: 62, h: 22, rx: 11, fill: 'rgba(123,97,255,0.12)' },
        { type: 'circle', cx: 302, cy: 331, r: 3.5, fill: palette.accent2 },
        { type: 'text', x: 321, y: 335, text: 'Queued', fontSize: 11, color: palette.accent2, textAnchor: 'middle' },
        { type: 'text', x: 36, y: 375, text: 'Triggers at 9:00 AM daily', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 334, y: 375, text: '~2 min', fontSize: 11, color: palette.textMuted },
        // Workflow card 3 — failed
        { type: 'rect', x: 16, y: 408, w: 358, h: 90, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 408, w: 358, h: 90, rx: 12, fill: 'none', stroke: 'rgba(255,75,110,0.3)', strokeWidth: 1 },
        { type: 'rect', x: 16, y: 408, w: 3, h: 90, rx: 2, fill: palette.danger },
        { type: 'text', x: 36, y: 432, text: 'Sentry → Jira Auto-Ticket', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 36, y: 450, text: 'sentry → claude → jira', fontSize: 11, color: palette.textMuted },
        { type: 'rect', x: 298, y: 422, w: 54, h: 22, rx: 11, fill: 'rgba(255,75,110,0.12)' },
        { type: 'circle', cx: 309, cy: 433, r: 3.5, fill: palette.danger },
        { type: 'text', x: 325, y: 437, text: 'Failed', fontSize: 11, color: palette.danger, textAnchor: 'middle' },
        { type: 'text', x: 36, y: 477, text: 'Auth error: Jira token expired', fontSize: 11, color: 'rgba(255,75,110,0.8)' },
        { type: 'text', x: 322, y: 477, text: 'Retry →', fontSize: 11, color: palette.accent },
        // Stats row
        { type: 'rect', x: 16, y: 516, w: 358, h: 72, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 516, w: 358, h: 72, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 58, y: 546, text: '98.2%', fontSize: 18, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 58, y: 562, text: 'Uptime', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'rect', x: 111, y: 528, w: 1, h: 44, fill: palette.border },
        { type: 'text', x: 195, y: 546, text: '1,240', fontSize: 18, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 562, text: 'Runs / month', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'rect', x: 278, y: 528, w: 1, h: 44, fill: palette.border },
        { type: 'text', x: 332, y: 546, text: '4.2s', fontSize: 18, fontWeight: '700', color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 332, y: 562, text: 'Avg latency', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        // Bottom nav
        { type: 'rect', x: 0, y: 756, w: 390, h: 88, fill: palette.surface },
        { type: 'rect', x: 0, y: 756, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 39, y: 784, text: 'HOME', fontSize: 9, color: palette.accent, textAnchor: 'middle', fontWeight: '700' },
        { type: 'text', x: 39, y: 800, text: 'Home', fontSize: 10, color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 27, y: 810, w: 24, h: 3, rx: 2, fill: palette.accent },
        { type: 'text', x: 117, y: 787, text: 'FEED', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 117, y: 801, text: 'Activity', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'circle', cx: 195, cy: 791, r: 24, fill: palette.accent },
        { type: 'text', x: 195, y: 800, text: '+', fontSize: 30, fontWeight: '300', color: '#0D0E12', textAnchor: 'middle' },
        { type: 'text', x: 273, y: 787, text: 'GRID', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 273, y: 801, text: 'Integrations', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 351, y: 787, text: 'COG', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 351, y: 801, text: 'Settings', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 2 ── Workflow Detail
    {
      id: 'workflow-detail',
      name: 'Workflow Detail',
      bg: palette.bg,
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 20, y: 70, text: '← PR Review Assistant', fontSize: 17, fontWeight: '700', color: palette.text },
        { type: 'rect', x: 318, y: 58, w: 56, h: 22, rx: 11, fill: 'rgba(0,212,170,0.12)' },
        { type: 'circle', cx: 330, cy: 69, r: 3.5, fill: palette.accent },
        { type: 'text', x: 348, y: 73, text: 'Live', fontSize: 11, color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 20, y: 94, text: 'github → claude → linear', fontSize: 12, color: palette.textMuted },
        // Pipeline nodes
        { type: 'text', x: 20, y: 126, text: 'PIPELINE NODES', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        // Node 1: GitHub — done
        { type: 'rect', x: 16, y: 140, w: 100, h: 72, rx: 10, fill: palette.surface },
        { type: 'rect', x: 16, y: 140, w: 100, h: 72, rx: 10, fill: 'none', stroke: palette.accent, strokeWidth: 1.5 },
        { type: 'text', x: 66, y: 168, text: 'GH', fontSize: 16, fontWeight: '800', color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 66, y: 186, text: 'GitHub', fontSize: 12, fontWeight: '600', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 66, y: 200, text: 'PR Opened', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'circle', cx: 98, cy: 147, r: 7, fill: palette.bg },
        { type: 'text', x: 98, y: 151, text: 'v', fontSize: 9, color: palette.accent, textAnchor: 'middle', fontWeight: '700' },
        // Arrow 1→2
        { type: 'rect', x: 116, y: 174, w: 28, h: 2, fill: palette.accent },
        // Node 2: Claude — running
        { type: 'rect', x: 144, y: 140, w: 100, h: 72, rx: 10, fill: 'rgba(0,212,170,0.06)' },
        { type: 'rect', x: 144, y: 140, w: 100, h: 72, rx: 10, fill: 'none', stroke: palette.accent, strokeWidth: 2 },
        { type: 'text', x: 194, y: 168, text: 'AI', fontSize: 16, fontWeight: '800', color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 194, y: 186, text: 'Claude 3.5', fontSize: 12, fontWeight: '600', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 194, y: 200, text: 'Analyzing...', fontSize: 10, color: palette.accent, textAnchor: 'middle' },
        // Arrow 2→3 dashed
        { type: 'rect', x: 244, y: 174, w: 10, h: 2, fill: palette.border },
        { type: 'rect', x: 258, y: 174, w: 10, h: 2, fill: palette.border },
        { type: 'rect', x: 272, y: 174, w: 10, h: 2, fill: palette.border },
        // Node 3: Linear — pending
        { type: 'rect', x: 274, y: 140, w: 100, h: 72, rx: 10, fill: palette.surface },
        { type: 'rect', x: 274, y: 140, w: 100, h: 72, rx: 10, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 324, y: 168, text: 'LN', fontSize: 16, fontWeight: '800', color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 324, y: 186, text: 'Linear', fontSize: 12, fontWeight: '600', color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 324, y: 200, text: 'Post comment', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        // Live output
        { type: 'text', x: 20, y: 238, text: 'LIVE OUTPUT', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        { type: 'rect', x: 16, y: 252, w: 358, h: 132, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 252, w: 358, h: 132, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 16, y: 252, w: 358, h: 30, rx: 12, fill: palette.surface2 },
        { type: 'text', x: 32, y: 271, text: 'claude-3.5-sonnet · streaming', fontSize: 11, color: palette.textMuted },
        { type: 'circle', cx: 354, cy: 267, r: 4, fill: palette.accent },
        { type: 'text', x: 32, y: 296, text: 'This PR introduces a new caching layer', fontSize: 12, color: palette.text },
        { type: 'text', x: 32, y: 314, text: 'for the API. Two potential issues found:', fontSize: 12, color: palette.text },
        { type: 'text', x: 32, y: 332, text: '1. Race condition in cache invalidation', fontSize: 12, color: 'rgba(255,75,110,0.9)' },
        { type: 'text', x: 32, y: 350, text: '2. Missing error boundary on timeout_', fontSize: 12, color: palette.textMuted },
        { type: 'rect', x: 225, y: 342, w: 2, h: 14, fill: palette.accent },
        // Run history
        { type: 'text', x: 20, y: 408, text: 'RUN HISTORY', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        ...[
          { time: '9:41 AM', label: 'Running', color: palette.accent, duration: '—', bg: 'rgba(0,212,170,0.05)', border: 'rgba(0,212,170,0.2)' },
          { time: 'Yesterday 4:22 PM', label: 'Success', color: palette.accent, duration: '3.1s', bg: palette.surface, border: palette.border },
          { time: 'Yesterday 11:04 AM', label: 'Success', color: palette.accent, duration: '2.8s', bg: palette.surface, border: palette.border },
          { time: 'Mar 24, 9:00 AM', label: 'Failed', color: palette.danger, duration: '1.2s', bg: palette.surface, border: palette.border },
        ].map((r, i) => {
          const y = 422 + i * 52;
          return [
            { type: 'rect', x: 16, y, w: 358, h: 44, rx: 8, fill: r.bg },
            { type: 'rect', x: 16, y, w: 358, h: 44, rx: 8, fill: 'none', stroke: r.border, strokeWidth: 1 },
            { type: 'circle', cx: 38, cy: y + 22, r: 5, fill: r.color },
            { type: 'text', x: 54, y: y + 18, text: r.time, fontSize: 12, fontWeight: '500', color: palette.text },
            { type: 'text', x: 54, y: y + 33, text: r.label, fontSize: 11, color: r.color },
            { type: 'text', x: 354, y: y + 26, text: r.duration, fontSize: 12, color: palette.textMuted, textAnchor: 'end' },
          ];
        }).flat(),
        // Action buttons
        { type: 'rect', x: 16, y: 642, w: 170, h: 46, rx: 12, fill: palette.accent },
        { type: 'text', x: 101, y: 670, text: 'Run Now', fontSize: 14, fontWeight: '600', color: '#0D0E12', textAnchor: 'middle' },
        { type: 'rect', x: 204, y: 642, w: 170, h: 46, rx: 12, fill: palette.surface2 },
        { type: 'rect', x: 204, y: 642, w: 170, h: 46, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 289, y: 670, text: 'Edit Workflow', fontSize: 14, fontWeight: '600', color: palette.text, textAnchor: 'middle' },
        // Nav
        { type: 'rect', x: 0, y: 756, w: 390, h: 88, fill: palette.surface },
        { type: 'rect', x: 0, y: 756, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 39, y: 792, text: 'Home', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 117, y: 787, text: 'ACT', fontSize: 10, color: palette.accent, textAnchor: 'middle', fontWeight: '700' },
        { type: 'text', x: 117, y: 801, text: 'Activity', fontSize: 10, color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 105, y: 810, w: 24, h: 3, rx: 2, fill: palette.accent },
        { type: 'circle', cx: 195, cy: 791, r: 24, fill: palette.surface2 },
        { type: 'text', x: 195, y: 800, text: '+', fontSize: 30, fontWeight: '300', color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 273, y: 792, text: 'Integrations', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 351, y: 792, text: 'Settings', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 3 ── Integrations
    {
      id: 'integrations',
      name: 'Integrations',
      bg: palette.bg,
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 20, y: 74, text: 'Integrations', fontSize: 24, fontWeight: '800', color: palette.text },
        { type: 'text', x: 20, y: 96, text: '8 connected · 3 available', fontSize: 13, color: palette.textMuted },
        // Search
        { type: 'rect', x: 16, y: 110, w: 358, h: 44, rx: 10, fill: palette.surface },
        { type: 'rect', x: 16, y: 110, w: 358, h: 44, rx: 10, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 50, y: 136, text: 'Search integrations...', fontSize: 13, color: palette.textMuted },
        // Category chips
        ...['All', 'AI Models', 'Code', 'PM', 'Comms'].map((label, i) => {
          const x = 16 + i * 74;
          const isActive = i === 0;
          return [
            { type: 'rect', x, y: 166, w: 68, h: 28, rx: 14, fill: isActive ? palette.accent : palette.surface },
            { type: 'rect', x, y: 166, w: 68, h: 28, rx: 14, fill: 'none', stroke: isActive ? 'transparent' : palette.border, strokeWidth: 1 },
            { type: 'text', x: x + 34, y: 184, text: label, fontSize: 12, fontWeight: isActive ? '600' : '400', color: isActive ? '#0D0E12' : palette.textMuted, textAnchor: 'middle' },
          ];
        }).flat(),
        // Section
        { type: 'text', x: 20, y: 218, text: 'CONNECTED', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        // 2-col grid integrations
        ...[
          { name: 'GitHub', abbr: 'GH', color: '#E8E8E8', uses: 12 },
          { name: 'Slack', abbr: 'SK', color: '#E01E5A', uses: 8 },
          { name: 'Claude 3.5', abbr: 'AI', color: '#CC9B7A', uses: 23 },
          { name: 'Linear', abbr: 'LN', color: '#5E6AD2', uses: 6 },
          { name: 'Notion', abbr: 'NT', color: '#F0F0F0', uses: 4 },
          { name: 'Sentry', abbr: 'ST', color: '#7D4CDB', uses: 3 },
          { name: 'Jira', abbr: 'JR', color: '#0052CC', uses: 2 },
          { name: 'GPT-4', abbr: 'GP', color: '#10A37F', uses: 11 },
        ].map((item, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = 16 + col * 187;
          const y = 234 + row * 96;
          return [
            { type: 'rect', x, y, w: 179, h: 84, rx: 12, fill: palette.surface },
            { type: 'rect', x, y, w: 179, h: 84, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
            { type: 'rect', x, y, w: 179, h: 3, rx: 2, fill: item.color },
            { type: 'circle', cx: x + 28, cy: y + 30, r: 16, fill: item.color + '18' },
            { type: 'text', x: x + 28, y: y + 36, text: item.abbr, fontSize: 12, fontWeight: '800', color: item.color, textAnchor: 'middle' },
            { type: 'text', x: x + 52, y: y + 27, text: item.name, fontSize: 13, fontWeight: '600', color: palette.text },
            { type: 'text', x: x + 52, y: y + 43, text: item.uses + ' workflows', fontSize: 11, color: palette.textMuted },
            { type: 'circle', cx: x + 160, cy: y + 16, r: 5, fill: palette.accent },
            { type: 'text', x: x + 20, y: y + 70, text: 'Connected', fontSize: 11, color: palette.accent },
          ];
        }).flat(),
        // Available
        { type: 'text', x: 20, y: 622, text: 'AVAILABLE', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        ...[
          { name: 'Postgres', abbr: 'PG', color: '#336791' },
          { name: 'Zapier', abbr: 'ZP', color: '#FF4A00' },
          { name: 'HuggingFace', abbr: 'HF', color: '#FFD21E' },
        ].map((item, i) => {
          const y = 638 + i * 52;
          return [
            { type: 'rect', x: 16, y, w: 358, h: 44, rx: 10, fill: palette.surface },
            { type: 'rect', x: 16, y, w: 358, h: 44, rx: 10, fill: 'none', stroke: palette.border, strokeWidth: 1 },
            { type: 'circle', cx: 42, cy: y + 22, r: 14, fill: item.color + '18' },
            { type: 'text', x: 42, y: y + 27, text: item.abbr, fontSize: 11, fontWeight: '800', color: item.color, textAnchor: 'middle' },
            { type: 'text', x: 64, y: y + 18, text: item.name, fontSize: 13, fontWeight: '500', color: palette.text },
            { type: 'text', x: 64, y: y + 32, text: 'Not connected', fontSize: 11, color: palette.textMuted },
            { type: 'rect', x: 306, y: y + 11, w: 60, h: 22, rx: 11, fill: 'rgba(0,212,170,0.12)' },
            { type: 'text', x: 336, y: y + 26, text: 'Connect', fontSize: 11, color: palette.accent, textAnchor: 'middle' },
          ];
        }).flat(),
        // Nav
        { type: 'rect', x: 0, y: 756, w: 390, h: 88, fill: palette.surface },
        { type: 'rect', x: 0, y: 756, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 39, y: 792, text: 'Home', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 117, y: 792, text: 'Activity', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'circle', cx: 195, cy: 791, r: 24, fill: palette.surface2 },
        { type: 'text', x: 195, y: 800, text: '+', fontSize: 30, fontWeight: '300', color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 273, y: 787, text: 'INTGR', fontSize: 9, color: palette.accent, textAnchor: 'middle', fontWeight: '700' },
        { type: 'text', x: 273, y: 801, text: 'Integrations', fontSize: 9, color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 261, y: 810, w: 24, h: 3, rx: 2, fill: palette.accent },
        { type: 'text', x: 351, y: 792, text: 'Settings', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 4 ── Build Workflow
    {
      id: 'build-workflow',
      name: 'Build Workflow',
      bg: palette.bg,
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 20, y: 70, text: '← New Workflow', fontSize: 17, fontWeight: '700', color: palette.text },
        { type: 'rect', x: 296, y: 56, w: 78, h: 32, rx: 10, fill: palette.accent },
        { type: 'text', x: 335, y: 77, text: 'Save', fontSize: 13, fontWeight: '600', color: '#0D0E12', textAnchor: 'middle' },
        // Name input
        { type: 'rect', x: 16, y: 96, w: 358, h: 52, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 96, w: 358, h: 52, rx: 12, fill: 'none', stroke: palette.accent, strokeWidth: 1.5 },
        { type: 'text', x: 32, y: 114, text: 'Workflow name', fontSize: 11, color: palette.accent },
        { type: 'text', x: 32, y: 132, text: 'My new workflow_', fontSize: 14, color: palette.text },
        // Trigger
        { type: 'text', x: 20, y: 172, text: 'TRIGGER', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        { type: 'rect', x: 16, y: 186, w: 358, h: 64, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 186, w: 358, h: 64, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 16, y: 186, w: 3, h: 64, rx: 2, fill: palette.accent2 },
        { type: 'circle', cx: 48, cy: 218, r: 18, fill: 'rgba(123,97,255,0.12)' },
        { type: 'text', x: 48, y: 224, text: 'SCH', fontSize: 10, fontWeight: '800', color: palette.accent2, textAnchor: 'middle' },
        { type: 'text', x: 74, y: 212, text: 'Schedule', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 74, y: 230, text: 'Every weekday at 9:00 AM', fontSize: 12, color: palette.textMuted },
        { type: 'text', x: 358, y: 222, text: '>', fontSize: 16, color: palette.textMuted, textAnchor: 'end' },
        // Steps
        { type: 'text', x: 20, y: 276, text: 'STEPS', fontSize: 11, fontWeight: '700', color: palette.textMuted, letterSpacing: 2 },
        // Step 1
        { type: 'rect', x: 16, y: 290, w: 358, h: 64, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 290, w: 358, h: 64, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 32, y: 310, text: '1', fontSize: 11, fontWeight: '700', color: palette.accent },
        { type: 'circle', cx: 58, cy: 322, r: 18, fill: 'rgba(232,232,232,0.08)' },
        { type: 'text', x: 58, y: 328, text: 'GH', fontSize: 12, fontWeight: '800', color: '#E8E8E8', textAnchor: 'middle' },
        { type: 'text', x: 86, y: 316, text: 'GitHub', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 86, y: 334, text: 'Get pull requests', fontSize: 12, color: palette.textMuted },
        { type: 'rect', x: 56, y: 354, w: 2, h: 14, fill: palette.border },
        // Step 2
        { type: 'rect', x: 16, y: 368, w: 358, h: 64, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 368, w: 358, h: 64, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 32, y: 388, text: '2', fontSize: 11, fontWeight: '700', color: palette.accent },
        { type: 'circle', cx: 58, cy: 400, r: 18, fill: 'rgba(204,155,122,0.1)' },
        { type: 'text', x: 58, y: 406, text: 'AI', fontSize: 12, fontWeight: '800', color: '#CC9B7A', textAnchor: 'middle' },
        { type: 'text', x: 86, y: 394, text: 'Claude 3.5 Sonnet', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 86, y: 412, text: 'Analyze and summarize', fontSize: 12, color: palette.textMuted },
        { type: 'rect', x: 56, y: 432, w: 2, h: 14, fill: palette.border },
        // Step 3
        { type: 'rect', x: 16, y: 446, w: 358, h: 64, rx: 12, fill: palette.surface },
        { type: 'rect', x: 16, y: 446, w: 358, h: 64, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 32, y: 466, text: '3', fontSize: 11, fontWeight: '700', color: palette.accent },
        { type: 'circle', cx: 58, cy: 478, r: 18, fill: 'rgba(94,106,210,0.1)' },
        { type: 'text', x: 58, y: 484, text: 'SK', fontSize: 12, fontWeight: '800', color: '#E01E5A', textAnchor: 'middle' },
        { type: 'text', x: 86, y: 472, text: 'Slack', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 86, y: 490, text: 'Post to #dev-updates', fontSize: 12, color: palette.textMuted },
        // Add step dashed
        { type: 'rect', x: 16, y: 524, w: 358, h: 52, rx: 12, fill: 'none', stroke: palette.border, strokeWidth: 1.5 },
        { type: 'text', x: 195, y: 544, text: '+ Add Step', fontSize: 14, fontWeight: '500', color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 562, text: 'Choose an integration or AI model', fontSize: 11, color: palette.textMuted, textAnchor: 'middle' },
        // AI Suggestion
        { type: 'rect', x: 16, y: 592, w: 358, h: 72, rx: 12, fill: 'rgba(0,212,170,0.05)' },
        { type: 'rect', x: 16, y: 592, w: 358, h: 72, rx: 12, fill: 'none', stroke: 'rgba(0,212,170,0.2)', strokeWidth: 1 },
        { type: 'text', x: 32, y: 614, text: 'AI Suggestion', fontSize: 12, fontWeight: '600', color: palette.accent },
        { type: 'text', x: 32, y: 632, text: 'Add Linear to auto-create tasks from', fontSize: 12, color: palette.text },
        { type: 'text', x: 32, y: 650, text: 'Claude output', fontSize: 12, color: palette.text },
        { type: 'text', x: 358, y: 634, text: 'Add >', fontSize: 12, color: palette.accent, textAnchor: 'end' },
        // Nav
        { type: 'rect', x: 0, y: 756, w: 390, h: 88, fill: palette.surface },
        { type: 'rect', x: 0, y: 756, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 39, y: 792, text: 'Home', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 117, y: 792, text: 'Activity', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'circle', cx: 195, cy: 791, r: 24, fill: palette.accent },
        { type: 'text', x: 195, y: 800, text: '+', fontSize: 30, fontWeight: '300', color: '#0D0E12', textAnchor: 'middle' },
        { type: 'text', x: 273, y: 792, text: 'Integrations', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 351, y: 792, text: 'Settings', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 5 ── Activity Feed
    {
      id: 'activity',
      name: 'Activity Feed',
      bg: palette.bg,
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 20, y: 74, text: 'Activity', fontSize: 24, fontWeight: '800', color: palette.text },
        // Filter chips
        ...['Today', 'Week', 'Month'].map((label, i) => {
          const x = 20 + i * 82;
          const isActive = i === 0;
          return [
            { type: 'rect', x, y: 88, w: 74, h: 28, rx: 14, fill: isActive ? palette.accent : 'transparent' },
            { type: 'rect', x, y: 88, w: 74, h: 28, rx: 14, fill: 'none', stroke: isActive ? 'transparent' : palette.border, strokeWidth: 1 },
            { type: 'text', x: x + 37, y: 106, text: label, fontSize: 12, fontWeight: isActive ? '600' : '400', color: isActive ? '#0D0E12' : palette.textMuted, textAnchor: 'middle' },
          ];
        }).flat(),
        // Timeline events
        ...[
          { time: '9:41 AM', workflow: 'PR Review Assistant', event: 'Workflow started · Step 2/3', detail: 'Analyzing pull request #142...', color: palette.accent, icon: '>' },
          { time: '9:38 AM', workflow: 'Daily Standup', event: 'Completed in 2.4s', detail: 'Posted summary to #standup', color: palette.accent, icon: 'v' },
          { time: '9:32 AM', workflow: 'Sentry → Jira', event: 'Failed at step 3', detail: 'Auth error: Jira token expired', color: palette.danger, icon: '!' },
          { time: '9:00 AM', workflow: 'Daily Standup', event: 'Scheduled trigger fired', detail: 'Collecting Slack messages...', color: palette.accent2, icon: 'T' },
          { time: '8:54 AM', workflow: 'PR Review Assistant', event: 'Completed in 3.1s', detail: 'Posted to linear/ENG-892', color: palette.accent, icon: 'v' },
          { time: '8:47 AM', workflow: 'Deploy Monitor', event: 'Completed in 0.8s', detail: 'No issues found in prod', color: palette.accent, icon: 'v' },
          { time: '8:30 AM', workflow: 'Axon System', event: 'Daily token reset', detail: 'API quotas refreshed', color: palette.textMuted, icon: 'i' },
        ].map((ev, i) => {
          const y = 132 + i * 84;
          return [
            ...(i < 6 ? [{ type: 'rect', x: 39, y: y + 32, w: 2, h: 52, fill: palette.border }] : []),
            { type: 'circle', cx: 40, cy: y + 16, r: 14, fill: ev.color + '15' },
            { type: 'text', x: 40, y: y + 21, text: ev.icon, fontSize: 12, color: ev.color, textAnchor: 'middle', fontWeight: '700' },
            { type: 'text', x: 64, y: y + 11, text: ev.workflow, fontSize: 13, fontWeight: '600', color: palette.text },
            { type: 'text', x: 354, y: y + 11, text: ev.time, fontSize: 11, color: palette.textMuted, textAnchor: 'end' },
            { type: 'text', x: 64, y: y + 26, text: ev.event, fontSize: 12, color: ev.event.includes('Failed') ? palette.danger : ev.event.includes('started') ? palette.accent : palette.textMuted },
            { type: 'text', x: 64, y: y + 41, text: ev.detail, fontSize: 11, color: palette.textMuted },
            { type: 'rect', x: 64, y: y + 77, w: 310, h: 0.5, fill: palette.border },
          ];
        }).flat(),
        // Nav
        { type: 'rect', x: 0, y: 756, w: 390, h: 88, fill: palette.surface },
        { type: 'rect', x: 0, y: 756, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 39, y: 792, text: 'Home', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 117, y: 787, text: 'ACT', fontSize: 9, color: palette.accent, textAnchor: 'middle', fontWeight: '700' },
        { type: 'text', x: 117, y: 801, text: 'Activity', fontSize: 10, color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 105, y: 810, w: 24, h: 3, rx: 2, fill: palette.accent },
        { type: 'circle', cx: 195, cy: 791, r: 24, fill: palette.surface2 },
        { type: 'text', x: 195, y: 800, text: '+', fontSize: 30, fontWeight: '300', color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 273, y: 792, text: 'Integrations', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 351, y: 792, text: 'Settings', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

  ],
};

fs.writeFileSync(`/workspace/group/design-studio/${SLUG}.pen`, JSON.stringify(pen, null, 2));
console.log(`wrote ${SLUG}.pen (${pen.screens.length} screens)`);
