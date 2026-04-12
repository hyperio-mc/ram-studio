'use strict';
// prism-app.js — PRISM: Developer Code Intelligence Platform
// Inspired by:
//   1. darkmodedesign.com (Mar 24 2026): 108 Supply bento editorial grid + italic-serif
//      mixed with dark backgrounds; Cecilia bold white type on near-black.
//      Linear-style dark navy with vivid violet accent, data-forward minimal chrome.
//   2. lapa.ninja: Mobbin utility-forward dark UI with strong typographic hierarchy.
// Theme: DARK — deep space-black #080B14, electric violet #7C5CFC, teal success indicators.
// Design push: Bento-box data grid (from 108 Supply) + Linear dark SaaS confidence.
//   Monospace readouts for metrics. Data richness without visual noise.

const fs   = require('fs');
const path = require('path');

const C = {
  bg:       '#080B14',
  surface:  '#0F1320',
  surface2: '#161B2E',
  surface3: '#1D2440',
  text:     '#E8EBF0',
  muted:    'rgba(232,235,240,0.38)',
  muted2:   'rgba(232,235,240,0.15)',
  violet:   '#7C5CFC',
  teal:     '#06D6A0',
  amber:    '#F59E0B',
  red:      '#F04747',
  border:   'rgba(124,92,252,0.18)',
  borderGray: 'rgba(232,235,240,0.08)',
};

let _id = 1;
const uid  = () => `prism-${_id++}`;
const rect = (x, y, w, h, fill, r=0) => ({ id: uid(), type: 'rect', x, y, width: w, height: h, fill, ...(r>0?{cornerRadius:r}:{}) });
const text = (x, y, w, h, content, fontSize, color, weight='400', align='left', family='Inter') =>
  ({ id: uid(), type: 'text', x, y, width: w, height: h, content, fontSize, color, fontWeight: weight, textAlign: align, fontFamily: family });
const mono = (x, y, w, h, content, fontSize, color, weight='600', align='left') =>
  text(x, y, w, h, content, fontSize, color, weight, align, 'JetBrains Mono');
const frame = (x, y, w, h, fill, children) =>
  ({ id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: true, children });

const FW = 390; const FH = 844;

const NAV = ['Overview', 'PRs', 'Quality', 'Deps', 'Team'];
const NAV_ICONS = ['⬡', '⊙', '◈', '⊕', '⊛'];

function navBar(active) {
  const els = [];
  NAV.forEach((label, i) => {
    const nx = Math.round(i * (FW / NAV.length));
    const nw = Math.round(FW / NAV.length);
    const isActive = i === active;
    if (isActive) els.push(rect(nx + 10, FH - 64, nw - 20, 2, C.violet, 1));
    els.push(text(nx, FH - 48, nw, 14, NAV_ICONS[i], 14, isActive ? C.violet : C.muted, '400', 'center'));
    els.push(text(nx, FH - 30, nw, 16, label, 9, isActive ? C.violet : C.muted, isActive ? '600' : '400', 'center'));
  });
  return els;
}

function header(repoName, branch, status) {
  return [
    rect(0, 0, FW, 70, C.bg),
    mono(20, 14, 200, 22, 'PRISM', 16, C.violet, '700'),
    text(20, 38, 200, 18, repoName, 11, C.muted, '400'),
    rect(FW - 90, 16, 70, 22, status === 'healthy' ? 'rgba(6,214,160,0.15)' : 'rgba(240,71,71,0.15)', 11),
    mono(FW - 90, 18, 70, 18, status === 'healthy' ? '● HEALTHY' : '⚠ ISSUES', 9, status === 'healthy' ? C.teal : C.amber, '700', 'center'),
    rect(FW - 90, 42, 70, 16, C.surface2, 8),
    mono(FW - 88, 43, 66, 14, branch, 9, C.muted, '400', 'center'),
    rect(0, 70, FW, 1, C.borderGray),
  ];
}

function qualityBar(x, y, w, label, value, max, color) {
  const filled = Math.round(w * value / max);
  return [
    text(x, y, 140, 16, label, 11, C.text, '500'),
    mono(x + w - 40, y, 40, 16, value + '%', 11, color, '700', 'right'),
    rect(x, y + 20, w, 6, C.surface3, 3),
    rect(x, y + 20, filled, 6, color, 3),
  ];
}

function screenOverview() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('acme/platform', 'main', 'healthy'),
    text(20, 82, FW - 40, 20, 'HEALTH SCORE', 10, C.muted, '700'),
    rect(FW/2 - 54, 108, 108, 108, C.surface2, 54),
    rect(FW/2 - 46, 116, 92, 92, C.surface, 46),
    rect(FW/2 - 38, 124, 76, 76, 'rgba(124,92,252,0.12)', 38),
    mono(FW/2 - 24, 148, 48, 28, '94', 26, C.text, '700', 'center'),
    text(FW/2 - 20, 178, 40, 14, '/100', 11, C.muted, '400', 'center'),
    rect(FW/2 - 32, 200, 64, 20, 'rgba(6,214,160,0.15)', 10),
    text(FW/2 - 32, 202, 64, 16, '▲ +3 this week', 10, C.teal, '600', 'center'),
    rect(20, 232, FW - 40, 1, C.borderGray),
    // Bento 2x2
    rect(20, 244, 162, 80, C.surface, 8),
    text(30, 256, 142, 14, 'OPEN PRS', 9, C.muted, '700'),
    mono(30, 274, 142, 30, '12', 24, C.text, '700'),
    text(30, 306, 142, 14, '3 need review', 10, C.amber, '500'),
    rect(208, 244, 162, 80, C.surface, 8),
    text(218, 256, 142, 14, 'COVERAGE', 9, C.muted, '700'),
    mono(218, 274, 142, 30, '87.4%', 24, C.teal, '700'),
    text(218, 306, 142, 14, '▲ 1.2% since last PR', 10, C.muted, '500'),
    rect(20, 336, 162, 80, C.surface, 8),
    text(30, 348, 142, 14, 'BUILD TIME', 9, C.muted, '700'),
    mono(30, 366, 142, 30, '3m 42s', 20, C.text, '700'),
    text(30, 398, 142, 14, '▼ 18s faster', 10, C.teal, '500'),
    rect(208, 336, 162, 80, C.surface, 8),
    text(218, 348, 142, 14, 'INCIDENTS', 9, C.muted, '700'),
    mono(218, 366, 142, 30, '0', 24, C.teal, '700'),
    text(218, 398, 142, 14, '30-day streak', 10, C.muted, '500'),
    rect(20, 428, FW - 40, 1, C.borderGray),
    text(20, 440, 200, 16, 'COMMIT ACTIVITY', 10, C.muted, '700'),
    text(FW - 100, 440, 80, 16, 'last 14 days', 9, C.muted, '400', 'right'),
    ...[4,7,5,11,8,3,9,14,6,10,12,8,15,11].map((h, i) => {
      const barH = Math.round((h / 15) * 36);
      return rect(20 + i * 25, 484 + (36 - barH), 16, barH, i === 13 ? C.violet : 'rgba(124,92,252,0.35)', 2);
    }),
    rect(20, 532, FW - 40, 1, C.borderGray),
    text(20, 544, 200, 16, 'RECENT DEPLOYS', 10, C.muted, '700'),
    rect(20, 562, FW - 40, 46, C.surface, 8),
    rect(20, 562, 3, 46, C.teal),
    mono(30, 574, 200, 14, 'v2.14.1', 12, C.text, '600'),
    text(30, 590, 200, 14, 'prod — 12 min ago', 10, C.muted, '400'),
    rect(FW - 88, 574, 58, 18, 'rgba(6,214,160,0.15)', 9),
    text(FW - 88, 576, 58, 14, '✓ LIVE', 9, C.teal, '700', 'center'),
    rect(20, 616, FW - 40, 46, C.surface, 8),
    rect(20, 616, 3, 46, C.violet),
    mono(30, 628, 200, 14, 'v2.14.0', 12, C.text, '600'),
    text(30, 644, 200, 14, 'staging — 2h ago', 10, C.muted, '400'),
    rect(FW - 88, 628, 58, 18, 'rgba(124,92,252,0.15)', 9),
    text(FW - 88, 630, 58, 14, '✓ DONE', 9, C.violet, '700', 'center'),
    rect(20, 670, FW - 40, 46, C.surface, 8),
    rect(20, 670, 3, 46, C.amber),
    mono(30, 682, 200, 14, 'v2.13.9', 12, C.text, '600'),
    text(30, 698, 200, 14, 'hotfix/auth-race — 5h ago', 10, C.muted, '400'),
    rect(FW - 102, 682, 72, 18, 'rgba(245,158,11,0.15)', 9),
    text(FW - 102, 684, 72, 14, '⟳ ROLLING', 9, C.amber, '700', 'center'),
    rect(0, FH - 64, FW, 64, C.bg),
    rect(0, FH - 64, FW, 1, C.borderGray),
    ...navBar(0),
  ];
  return frame(0, 0, FW, FH, C.bg, children);
}

function screenPRs() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('acme/platform', 'main', 'healthy'),
    text(20, 80, 200, 20, 'Pull Requests', 18, C.text, '700'),
    text(20, 103, 200, 16, '12 open · 3 require your review', 12, C.muted, '400'),
    rect(20, 124, 56, 24, C.surface3, 12),
    text(20, 127, 56, 18, 'All (12)', 10, C.violet, '600', 'center'),
    rect(84, 124, 72, 24, C.surface, 12),
    text(84, 127, 72, 18, 'Review (3)', 10, C.muted, '400', 'center'),
    rect(164, 124, 64, 24, C.surface, 12),
    text(164, 127, 64, 18, 'Draft (2)', 10, C.muted, '400', 'center'),
    rect(236, 124, 60, 24, C.surface, 12),
    text(236, 127, 60, 18, 'Mine (5)', 10, C.muted, '400', 'center'),
    rect(20, 158, FW - 40, 1, C.borderGray),
    // PR 1
    rect(20, 166, FW - 40, 90, C.surface2, 10),
    rect(20, 166, FW - 40, 90, 'rgba(124,92,252,0.08)', 10),
    rect(20, 166, 3, 90, C.violet),
    text(32, 178, FW - 90, 16, 'feat: add AI-powered PR summaries', 14, C.text, '600'),
    mono(32, 196, FW - 90, 14, '#1842 · feat/ai-summaries', 10, C.muted, '400'),
    text(32, 212, FW - 90, 14, 'jsmith · 4h ago · +312 −48', 10, C.muted, '400'),
    rect(FW - 96, 180, 68, 18, 'rgba(124,92,252,0.20)', 9),
    text(FW - 96, 182, 68, 14, '⏳ REVIEW', 9, C.violet, '700', 'center'),
    text(32, 228, FW - 90, 18, '2 comments · CI passing · 1 approval needed', 10, C.muted, '400'),
    rect(20, 255, FW - 40, 1, C.borderGray),
    // PR 2
    rect(20, 263, FW - 40, 82, C.surface, 8),
    rect(20, 263, 3, 82, C.teal),
    text(32, 274, FW - 90, 16, 'fix: resolve race condition in auth flow', 13, C.text, '600'),
    mono(32, 293, FW - 90, 14, '#1841 · fix/auth-race', 10, C.muted, '400'),
    text(32, 309, FW - 90, 14, 'mchen · 6h ago · +24 −9', 10, C.muted, '400'),
    rect(FW - 96, 276, 68, 18, 'rgba(6,214,160,0.15)', 9),
    text(FW - 96, 278, 68, 14, '✓ APPROVED', 9, C.teal, '700', 'center'),
    rect(20, 344, FW - 40, 1, C.borderGray),
    // PR 3
    rect(20, 352, FW - 40, 82, C.surface, 8),
    rect(20, 352, 3, 82, C.amber),
    text(32, 362, FW - 90, 16, 'refactor: migrate billing to Stripe v3', 13, C.text, '600'),
    mono(32, 381, FW - 90, 14, '#1840 · refactor/stripe-v3', 10, C.muted, '400'),
    text(32, 397, FW - 90, 14, 'alopez · 1d ago · +891 −774', 10, C.muted, '400'),
    rect(FW - 88, 364, 60, 18, 'rgba(245,158,11,0.15)', 9),
    text(FW - 88, 366, 60, 14, '⚠ CHANGES', 9, C.amber, '700', 'center'),
    rect(20, 433, FW - 40, 1, C.borderGray),
    // PR 4
    rect(20, 441, FW - 40, 82, C.surface, 8),
    rect(20, 441, 3, 82, 'rgba(232,235,240,0.20)'),
    text(32, 451, FW - 90, 16, 'chore: bump webpack to 5.91.0', 13, C.text, '500'),
    mono(32, 470, FW - 90, 14, '#1839 · chore/webpack-bump', 10, C.muted, '400'),
    text(32, 486, FW - 90, 14, 'bot · 2d ago · +6 −4', 10, C.muted, '400'),
    rect(FW - 84, 453, 56, 18, 'rgba(232,235,240,0.08)', 9),
    text(FW - 84, 455, 56, 14, '◎ DRAFT', 9, C.muted, '600', 'center'),
    rect(20, 522, FW - 40, 1, C.borderGray),
    // PR 5
    rect(20, 530, FW - 40, 82, C.surface, 8),
    rect(20, 530, 3, 82, C.red),
    text(32, 540, FW - 90, 16, 'security: patch CVE-2025-31172', 13, C.text, '600'),
    mono(32, 559, FW - 90, 14, '#1838 · security/cve-2025-31172', 10, C.muted, '400'),
    text(32, 575, FW - 90, 14, 'security-bot · 3d ago · +18 −3', 10, C.muted, '400'),
    rect(FW - 96, 542, 68, 18, 'rgba(240,71,71,0.18)', 9),
    text(FW - 96, 544, 68, 14, '🔴 CRITICAL', 9, C.red, '700', 'center'),
    rect(20, 621, FW - 40, 1, C.borderGray),
    rect(20, 629, FW - 40, 56, C.surface, 10),
    text(32, 641, 160, 14, 'Avg review time', 11, C.muted, '400'),
    mono(32, 657, 160, 18, '18.4 hrs', 15, C.text, '700'),
    text(FW/2 + 8, 641, 120, 14, 'Merge rate', 11, C.muted, '400'),
    mono(FW/2 + 8, 657, 120, 18, '83%', 15, C.teal, '700'),
    rect(0, FH - 64, FW, 64, C.bg),
    rect(0, FH - 64, FW, 1, C.borderGray),
    ...navBar(1),
  ];
  return frame(390, 0, FW, FH, C.bg, children);
}

function screenQuality() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('acme/platform', 'main', 'healthy'),
    text(20, 80, 200, 20, 'Code Quality', 18, C.text, '700'),
    text(20, 103, FW - 40, 16, 'Snapshot from last CI run · 3m 42s', 12, C.muted, '400'),
    rect(FW - 60, 80, 40, 40, 'rgba(124,92,252,0.20)', 20),
    mono(FW - 60, 90, 40, 20, 'A+', 16, C.violet, '700', 'center'),
    rect(20, 128, FW - 40, 1, C.borderGray),
    text(20, 140, 200, 16, 'TEST COVERAGE', 10, C.muted, '700'),
    ...qualityBar(20, 162, FW - 40, 'Statements', 87, 100, C.teal),
    ...qualityBar(20, 200, FW - 40, 'Branches', 81, 100, C.teal),
    ...qualityBar(20, 238, FW - 40, 'Functions', 92, 100, C.violet),
    ...qualityBar(20, 276, FW - 40, 'Lines', 88, 100, C.teal),
    rect(20, 314, FW - 40, 1, C.borderGray),
    text(20, 326, 200, 16, 'TECH DEBT', 10, C.muted, '700'),
    mono(FW - 80, 326, 60, 16, '4.2 hrs', 10, C.amber, '700', 'right'),
    rect(20, 346, FW - 40, 50, C.surface, 8),
    rect(20, 346, 3, 50, C.amber),
    text(32, 356, FW - 90, 16, 'Duplicated code blocks', 13, C.text, '500'),
    text(32, 374, FW - 90, 14, '14 instances across 6 files · 1.8 hrs', 10, C.muted, '400'),
    text(FW - 72, 360, 52, 16, '+1.8 hrs', 10, C.amber, '600', 'right'),
    rect(20, 404, FW - 40, 50, C.surface, 8),
    rect(20, 404, 3, 50, C.amber),
    text(32, 414, FW - 90, 16, 'Complex methods (cyclomatic > 10)', 13, C.text, '500'),
    text(32, 432, FW - 90, 14, '8 methods · est. 2.4 hrs to refactor', 10, C.muted, '400'),
    text(FW - 72, 418, 52, 16, '+2.4 hrs', 10, C.amber, '600', 'right'),
    rect(20, 462, FW - 40, 1, C.borderGray),
    text(20, 474, 200, 16, 'LINT & STYLE', 10, C.muted, '700'),
    rect(20, 494, 78, 60, C.surface, 8),
    mono(20, 508, 78, 24, '0', 20, C.teal, '700', 'center'),
    text(20, 534, 78, 14, 'errors', 10, C.muted, '400', 'center'),
    rect(106, 494, 78, 60, C.surface, 8),
    mono(106, 508, 78, 24, '12', 20, C.amber, '700', 'center'),
    text(106, 534, 78, 14, 'warnings', 10, C.muted, '400', 'center'),
    rect(192, 494, 78, 60, C.surface, 8),
    mono(192, 508, 78, 24, '4', 20, C.violet, '700', 'center'),
    text(192, 534, 78, 14, 'fixable', 10, C.muted, '400', 'center'),
    rect(278, 494, 92, 60, C.surface, 8),
    mono(278, 508, 92, 24, '99.1%', 16, C.teal, '700', 'center'),
    text(278, 534, 92, 14, 'format ok', 10, C.muted, '400', 'center'),
    rect(20, 564, FW - 40, 1, C.borderGray),
    text(20, 576, 200, 16, 'COVERAGE TREND', 10, C.muted, '700'),
    mono(FW - 100, 576, 80, 16, '87.4%  ▲', 10, C.teal, '700', 'right'),
    ...[74,76,75,79,80,78,82,83,81,85,84,86,87,87].map((v, i) => {
      const barH = Math.round((v - 70) / 18 * 40);
      return rect(20 + i * 25, 618 + (40 - barH), 16, barH, i === 13 ? C.violet : 'rgba(124,92,252,0.35)', 2);
    }),
    rect(0, FH - 64, FW, 64, C.bg),
    rect(0, FH - 64, FW, 1, C.borderGray),
    ...navBar(2),
  ];
  return frame(780, 0, FW, FH, C.bg, children);
}

function screenDeps() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('acme/platform', 'main', 'healthy'),
    text(20, 80, 200, 20, 'Dependencies', 18, C.text, '700'),
    text(20, 103, FW - 40, 16, '312 packages · last scan 18 min ago', 12, C.muted, '400'),
    rect(20, 128, 84, 64, C.surface, 8),
    mono(20, 142, 84, 26, '1', 22, C.red, '700', 'center'),
    text(20, 170, 84, 14, 'critical', 10, C.muted, '400', 'center'),
    rect(112, 128, 84, 64, C.surface, 8),
    mono(112, 142, 84, 26, '3', 22, C.amber, '700', 'center'),
    text(112, 170, 84, 14, 'high', 10, C.muted, '400', 'center'),
    rect(204, 128, 84, 64, C.surface, 8),
    mono(204, 142, 84, 26, '11', 22, C.muted, '700', 'center'),
    text(204, 170, 84, 14, 'medium', 10, C.muted, '400', 'center'),
    rect(296, 128, 74, 64, C.surface, 8),
    mono(296, 142, 74, 26, '293', 18, C.teal, '700', 'center'),
    text(296, 170, 74, 14, 'clean', 10, C.muted, '400', 'center'),
    rect(20, 202, FW - 40, 1, C.borderGray),
    text(20, 214, 200, 16, 'VULNERABILITIES', 10, C.muted, '700'),
    rect(20, 232, FW - 40, 86, C.surface, 10),
    rect(20, 232, FW - 40, 86, 'rgba(240,71,71,0.06)', 10),
    rect(20, 232, 3, 86, C.red),
    mono(30, 244, 240, 14, 'axios@1.6.2', 12, C.text, '700'),
    rect(FW - 90, 244, 62, 18, 'rgba(240,71,71,0.20)', 9),
    text(FW - 90, 246, 62, 14, '🔴 CRITICAL', 8, C.red, '700', 'center'),
    text(30, 261, FW - 60, 14, 'CVE-2025-31172: SSRF via redirect', 11, C.muted, '400'),
    text(30, 277, FW - 60, 14, 'Fix: upgrade to axios@1.7.4', 11, C.teal, '500'),
    rect(30, 298, 80, 16, 'rgba(6,214,160,0.15)', 8),
    text(30, 300, 80, 12, '↑ Auto-fix PR', 9, C.teal, '600', 'center'),
    text(FW - 90, 298, 62, 12, 'CVSS 9.8', 9, C.red, '600', 'right'),
    rect(20, 326, FW - 40, 1, C.borderGray),
    rect(20, 334, FW - 40, 72, C.surface, 8),
    rect(20, 334, 3, 72, C.amber),
    mono(30, 346, 240, 14, 'lodash@4.17.19', 12, C.text, '700'),
    rect(FW - 76, 346, 48, 18, 'rgba(245,158,11,0.18)', 9),
    text(FW - 76, 348, 48, 14, '⚠ HIGH', 8, C.amber, '700', 'center'),
    text(30, 363, FW - 60, 14, 'Prototype pollution — CVE-2020-8203', 11, C.muted, '400'),
    text(30, 379, FW - 60, 14, 'Fix: 4.17.21 · 0 breaking changes', 11, C.muted, '400'),
    text(FW - 90, 390, 62, 12, 'CVSS 7.4', 9, C.amber, '600', 'right'),
    rect(20, 414, FW - 40, 72, C.surface, 8),
    rect(20, 414, 3, 72, C.amber),
    mono(30, 426, 240, 14, 'semver@5.7.1', 12, C.text, '700'),
    rect(FW - 76, 426, 48, 18, 'rgba(245,158,11,0.18)', 9),
    text(FW - 76, 428, 48, 14, '⚠ HIGH', 8, C.amber, '700', 'center'),
    text(30, 443, FW - 60, 14, 'ReDoS via malicious input · CVE-2022-25883', 11, C.muted, '400'),
    text(30, 459, FW - 60, 14, 'Fix: 5.7.2', 11, C.muted, '400'),
    text(FW - 90, 470, 62, 12, 'CVSS 7.5', 9, C.amber, '600', 'right'),
    rect(20, 494, FW - 40, 1, C.borderGray),
    text(20, 506, 200, 16, 'OUTDATED PACKAGES', 10, C.muted, '700'),
    mono(FW - 80, 506, 60, 16, '47 total', 10, C.muted, '600', 'right'),
    ...qualityBar(20, 526, FW - 40, 'Major updates', 5, 50, C.red),
    ...qualityBar(20, 562, FW - 40, 'Minor updates', 19, 50, C.amber),
    ...qualityBar(20, 598, FW - 40, 'Patch updates', 23, 50, C.teal),
    rect(20, 638, FW - 40, 32, C.surface, 8),
    text(30, 646, FW - 60, 16, '💡  Batch-update patches with 1 PR → saves ~2.3 hrs', 11, C.violet, '500'),
    rect(0, FH - 64, FW, 64, C.bg),
    rect(0, FH - 64, FW, 1, C.borderGray),
    ...navBar(3),
  ];
  return frame(1170, 0, FW, FH, C.bg, children);
}

function screenTeam() {
  function cRow(x, y, w, name, handle, commits, prs, additions, color) {
    return [
      rect(x, y, w, 68, C.surface, 8),
      rect(x, y, 3, 68, color),
      rect(x + 14, y + 16, 36, 36, color + '33', 18),
      text(x + 14, y + 22, 36, 24, name[0], 16, color, '700', 'center'),
      text(x + 58, y + 16, 140, 18, name, 13, C.text, '600'),
      mono(x + 58, y + 36, 140, 14, handle, 10, C.muted, '400'),
      mono(x + w - 96, y + 14, 80, 14, commits + ' commits', 9, C.muted, '500', 'right'),
      mono(x + w - 96, y + 30, 80, 14, prs + ' PRs merged', 9, C.muted, '400', 'right'),
      mono(x + w - 96, y + 46, 80, 14, '+' + additions, 9, C.teal, '500', 'right'),
    ];
  }
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('acme/platform', 'main', 'healthy'),
    text(20, 80, 200, 20, 'Team', 18, C.text, '700'),
    text(20, 103, FW - 40, 16, '8 contributors · sprint 24', 12, C.muted, '400'),
    rect(20, 128, FW - 40, 68, C.surface2, 10),
    rect(20, 128, FW - 40, 2, C.violet),
    text(32, 142, 200, 16, 'SPRINT VELOCITY', 10, C.muted, '700'),
    mono(32, 160, 100, 24, '84 pts', 20, C.text, '700'),
    text(32, 186, 160, 14, 'Target: 80 pts · ▲ 5% over goal', 10, C.teal, '500'),
    ...[20,18,16,14,12,10,8,6,4,2,0].map((remaining, i) => {
      const barH = Math.round((remaining / 20) * 36);
      return rect(FW - 160 + i * 13, 158 + (36 - barH), 9, barH, i === 10 ? C.violet : 'rgba(124,92,252,0.40)', 2);
    }),
    rect(20, 206, FW - 40, 1, C.borderGray),
    text(20, 212, 200, 16, 'CONTRIBUTORS', 10, C.muted, '700'),
    ...cRow(20, 230, FW - 40, 'Jordan Smith', '@jsmith', 47, 8, '3.2k', C.violet),
    rect(20, 298, FW - 40, 1, C.borderGray),
    ...cRow(20, 306, FW - 40, 'Ming Chen', '@mchen', 38, 6, '1.8k', C.teal),
    rect(20, 374, FW - 40, 1, C.borderGray),
    ...cRow(20, 382, FW - 40, 'Ana Lopez', '@alopez', 29, 5, '4.1k', C.amber),
    rect(20, 450, FW - 40, 1, C.borderGray),
    ...cRow(20, 458, FW - 40, 'Dev Patel', '@dpatel', 21, 4, '892', C.violet),
    rect(20, 526, FW - 40, 1, C.borderGray),
    text(20, 538, 200, 16, 'COMMIT HEATMAP · 7 DAYS', 10, C.muted, '700'),
    ...(()=>{
      const cells = [];
      const data = [
        [2,0,4,3,1,0,0],[5,3,7,4,2,1,0],[1,0,2,6,3,0,0],[3,2,5,3,4,1,0],
        [0,1,3,2,1,0,0],[4,3,6,5,3,2,0],[2,1,4,3,2,1,0],[3,0,5,4,1,0,0],
      ];
      ['M','T','W','T','F','S','S'].forEach((d, di) => {
        cells.push(text(28 + di * 50, 556, 40, 12, d, 8, C.muted, '400', 'center'));
      });
      data.forEach((row, ri) => {
        row.forEach((val, di) => {
          const alpha = val === 0 ? 0.05 : val / 7;
          cells.push(rect(28 + di * 50, 570 + ri * 22, 36, 16,
            val === 0 ? C.surface2 : 'rgba(124,92,252,' + alpha.toFixed(2) + ')', 3));
        });
      });
      return cells;
    })(),
    rect(0, FH - 64, FW, 64, C.bg),
    rect(0, FH - 64, FW, 1, C.borderGray),
    ...navBar(4),
  ];
  return frame(1560, 0, FW, FH, C.bg, children);
}

const doc = {
  version: '2.8',
  title: 'PRISM — Developer Code Intelligence',
  width: 1950,
  height: 844,
  background: C.bg,
  frames: [
    screenOverview(),
    screenPRs(),
    screenQuality(),
    screenDeps(),
    screenTeam(),
  ],
};

const outPath = path.join(__dirname, 'prism-design.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('Written', outPath, '-', doc.frames.length, 'frames');
