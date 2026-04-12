#!/usr/bin/env node
// dune-app.js — DUNE personal finance clarity app
// Theme: DARK — deep warm charcoal + amber gold accent
// Inspired by:
//   Midday (featured on darkmodedesign.com) — dark expense/time tracker, clean data viz on deep black
//   Neon.tech (darkmodedesign.com) — glowing accent on near-black, bold metric typography
//   Dawn "evidence-based AI" (lapa.ninja) — AI insight chips, calm evidence-forward copy tone
//   Finance category (minimal.gallery/saas) — negative space, single accent discipline
// Concept: AI-powered personal finance clarity. See your money as it really is —
//   net worth pulse, AI-categorized spending, savings milestones, investment health.
//   Design challenge: create a dark luxury fintech UI that feels calm & trustworthy,
//   NOT cold/sterile — achieved through warm amber on warm charcoal (not blue-black).

'use strict';
const fs = require('fs');
const path = require('path');

const W = 390, H = 844, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// ── Palette (DARK — warm charcoal + amber) ──────────────────────────────────
const BG      = '#0C0B09';  // deep warm charcoal (warmer than blue-black)
const SURFACE = '#171512';  // lifted surface
const CARD    = '#1F1C18';  // card background
const CARD2   = '#252118';  // slightly lighter card
const AMBER   = '#E8B467';  // warm amber — primary accent (Midday-inspired warmth)
const AMBER2  = '#F0C882';  // lighter amber for glows
const BLUE    = '#5B9BD5';  // cool counterpoint (spending indicator)
const GREEN   = '#6BBF8A';  // positive/gain green
const RED     = '#C46B6B';  // negative/loss red
const TEXT    = '#F5F0E8';  // warm cream text
const MUTED   = 'rgba(245,240,232,0.38)';
const DIM     = 'rgba(245,240,232,0.08)';
const DIM2    = 'rgba(245,240,232,0.12)';
const AMBER_DIM = 'rgba(232,180,103,0.14)';
const AMBER_MED = 'rgba(232,180,103,0.28)';

let nodes = [];
let id = 1;

function rect(name, x, y, w, h, fill, opts = {}) {
  nodes.push({
    type: 'RECTANGLE', id: `n${id++}`, name,
    x, y, width: w, height: h, fill,
    cornerRadius: opts.cr || 0,
    opacity: opts.op || 1,
    stroke: opts.stroke || null,
    strokeWidth: opts.sw || 0,
  });
}

function text(name, x, y, w, content, size, color, opts = {}) {
  nodes.push({
    type: 'TEXT', id: `n${id++}`, name,
    x, y, width: w, content,
    fontSize: size, color,
    font: opts.font || 'Inter',
    weight: opts.weight || 400,
    align: opts.align || 'left',
    lh: opts.lh || 1.4,
    ls: opts.ls || 0,
  });
}

function sans(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color, { font: 'Inter', ...opts });
}
function mono(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color, { font: 'JetBrains Mono', ls: 0.02, ...opts });
}

function statusBar(sx) {
  rect(`sb-${sx}`, sx, 0, W, 44, BG);
  mono(`sb-time-${sx}`, sx + 16, 14, 60, '9:41', 11, MUTED, { weight: 400 });
  mono(`sb-bat-${sx}`, sx + W - 60, 14, 50, '◉ ◉ ◉', 7, MUTED, { align: 'right' });
}

// Bottom nav — 5 tabs
function bottomNav(sx, active) {
  rect(`nav-bg-${sx}`, sx, H - 80, W, 80, BG);
  rect(`nav-top-${sx}`, sx, H - 80, W, 1, DIM2);
  const tabs = [
    { label: 'PULSE',    icon: '◈' },
    { label: 'SPEND',    icon: '↙' },
    { label: 'SAVE',     icon: '◎' },
    { label: 'INVEST',   icon: '↗' },
    { label: 'MIND',     icon: '✦' },
  ];
  const tw = Math.floor(W / tabs.length);
  tabs.forEach((tab, i) => {
    const tx = sx + i * tw;
    const isActive = i === active;
    const col = isActive ? AMBER : MUTED;
    mono(`nav-icon-${sx}-${i}`, tx, H - 62, tw, tab.icon, 14, col, { align: 'center' });
    mono(`nav-lbl-${sx}-${i}`, tx, H - 42, tw, tab.label, 6, col, { align: 'center', ls: 0.08 });
    if (isActive) {
      rect(`nav-pip-${sx}-${i}`, sx + i * tw + Math.floor(tw / 2) - 12, H - 76, 24, 2, AMBER, { cr: 1 });
    }
  });
}

// AI insight chip
function insightChip(sx, y, txt, color) {
  color = color || AMBER;
  const chipBg = color === AMBER ? AMBER_DIM : 'rgba(107,191,138,0.12)';
  rect(`chip-bg-${sx}-${y}`, sx + 16, y, W - 32, 32, chipBg, { cr: 8 });
  rect(`chip-l-${sx}-${y}`, sx + 16, y, 2, 32, color, { cr: 1 });
  sans(`chip-txt-${sx}-${y}`, sx + 26, y + 9, W - 52, txt, 10, color, { weight: 500, lh: 1.3 });
  mono(`chip-ai-${sx}-${y}`, sx + W - 42, y + 12, 28, 'AI ✦', 7, color, { weight: 700, ls: 0.06, align: 'right' });
}

// ── SCREEN 0 — PULSE (home / net worth) ─────────────────────────────────────
function screenPulse(sx) {
  rect(`s0-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  // Header
  sans(`s0-hey`, sx + 20, 54, 200, 'Good morning, Alex.', 13, MUTED, { weight: 400 });
  sans(`s0-title`, sx + 20, 72, 260, 'Your financial\npulse', 28, TEXT, { weight: 700, lh: 1.1 });
  // Date chip
  rect(`s0-date-bg`, sx + W - 100, 78, 84, 20, DIM, { cr: 10 });
  mono(`s0-date`, sx + W - 100, 82, 84, 'APR 05, 2026', 7, MUTED, { align: 'center', ls: 0.06 });

  // ── Net worth hero block ────────────────────────────────────────────────
  rect(`s0-nw-card`, sx + 16, 120, W - 32, 160, SURFACE, { cr: 16 });
  rect(`s0-nw-glow`, sx + 16, 120, W - 32, 4, AMBER, { cr: 2, op: 0.9 });

  sans(`s0-nw-label`, sx + 28, 136, 160, 'NET WORTH', 8, MUTED, { weight: 700, ls: 0.10 });
  mono(`s0-nw-val`, sx + 28, 152, W - 56, '$147,832', 38, TEXT, { weight: 700, lh: 1.0 });
  // Delta
  rect(`s0-delta-bg`, sx + 28, 196, 90, 22, 'rgba(107,191,138,0.14)', { cr: 11 });
  sans(`s0-delta`, sx + 36, 201, 74, '▲ +$2,341 this month', 9, GREEN, { weight: 600 });

  // Mini sparkline — simple rect bars
  const bars = [28, 42, 35, 55, 48, 62, 58, 70, 65, 78, 72, 80];
  const barW = 14, barGap = 4;
  const sparkX = sx + W - (bars.length * (barW + barGap)) - 16;
  bars.forEach((h, i) => {
    const isLast = i === bars.length - 1;
    const barH = Math.round(h * 0.5);
    rect(`s0-spark-${i}`, sparkX + i * (barW + barGap), 248 - barH, barW, barH,
      isLast ? AMBER : DIM2, { cr: 2 });
  });
  mono(`s0-spark-lbl`, sx + 28, 238, 80, '12 months', 7, MUTED, { ls: 0.04 });

  // ── Weekly snapshot row ────────────────────────────────────────────────
  const snapItems = [
    { label: 'SPENT', value: '$1,240', delta: '↑ 8%', col: RED },
    { label: 'SAVED', value: '$680',   delta: '↑ 12%', col: GREEN },
    { label: 'RATE',  value: '35%',    delta: 'savings', col: AMBER },
  ];
  const snapW = Math.floor((W - 32 - 24) / 3);
  snapItems.forEach((item, i) => {
    const ix = sx + 16 + i * (snapW + 12);
    rect(`s0-snap-${i}`, ix, 296, snapW, 72, CARD, { cr: 12 });
    mono(`s0-snap-lbl-${i}`, ix + 10, 308, snapW - 20, item.label, 6, MUTED, { ls: 0.08 });
    sans(`s0-snap-val-${i}`, ix + 10, 320, snapW - 20, item.value, 16, TEXT, { weight: 700 });
    sans(`s0-snap-d-${i}`, ix + 10, 342, snapW - 20, item.delta, 9, item.col, { weight: 500 });
  });

  // ── Recent activity ────────────────────────────────────────────────────
  sans(`s0-recent-hdr`, sx + 20, 384, 200, 'RECENT', 8, MUTED, { weight: 700, ls: 0.10 });
  const txns = [
    { icon: '◈', name: 'Spotify', cat: 'Subscriptions', amt: '-$9.99', col: RED },
    { icon: '◎', name: 'Salary Credit', cat: 'Income', amt: '+$4,200', col: GREEN },
    { icon: '↗', name: 'VTSAX',   cat: 'Investment', amt: '-$500', col: AMBER },
  ];
  txns.forEach((t, i) => {
    const ty = 402 + i * 56;
    rect(`s0-tx-bg-${i}`, sx + 16, ty, W - 32, 48, CARD, { cr: 10 });
    rect(`s0-tx-icon-bg-${i}`, sx + 26, ty + 10, 28, 28, DIM2, { cr: 8 });
    mono(`s0-tx-icon-${i}`, sx + 26, ty + 16, 28, t.icon, 10, MUTED, { align: 'center' });
    sans(`s0-tx-name-${i}`, sx + 64, ty + 12, 160, t.name, 12, TEXT, { weight: 600 });
    sans(`s0-tx-cat-${i}`, sx + 64, ty + 28, 160, t.cat, 9, MUTED);
    sans(`s0-tx-amt-${i}`, sx + W - 80, ty + 18, 68, t.amt, 13, t.col, { weight: 700, align: 'right' });
  });

  // AI insight
  insightChip(sx, 572, 'Your savings rate is 6% above your 3-month average. Keep it up.', GREEN);

  bottomNav(sx, 0);
}

// ── SCREEN 1 — SPEND (weekly breakdown) ─────────────────────────────────────
function screenSpend(sx) {
  rect(`s1-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  sans(`s1-eyebrow`, sx + 20, 54, W - 40, 'SPENDING', 8, MUTED, { weight: 700, ls: 0.10 });
  sans(`s1-title`, sx + 20, 68, W - 40, 'This week', 26, TEXT, { weight: 700, lh: 1.1 });
  mono(`s1-total`, sx + W - 100, 72, 84, '$348.20', 14, AMBER, { weight: 700, align: 'right' });

  // Day-of-week bar chart
  const days = [
    { d: 'M', v: 45 }, { d: 'T', v: 82 }, { d: 'W', v: 28 },
    { d: 'T', v: 120 }, { d: 'F', v: 66 }, { d: 'S', v: 55 }, { d: 'S', v: 0 },
  ];
  const maxV = 120;
  const barH = 80, chartY = 108;
  const bw = 34, bg2 = 6;
  const chartX = sx + (W - days.length * (bw + bg2)) / 2;
  days.forEach((d, i) => {
    const bh = d.v > 0 ? Math.round((d.v / maxV) * barH) : 2;
    const isToday = i === 3;
    const bx = chartX + i * (bw + bg2);
    rect(`s1-bar-bg-${i}`, bx, chartY, bw, barH, DIM, { cr: 4 });
    rect(`s1-bar-${i}`, bx, chartY + barH - bh, bw, bh, isToday ? AMBER : DIM2, { cr: 4 });
    mono(`s1-bar-lbl-${i}`, bx, chartY + barH + 6, bw, d.d, 8, isToday ? AMBER : MUTED, { align: 'center' });
    if (isToday) {
      mono(`s1-bar-val-${i}`, bx, chartY - 18, bw, '$120', 8, AMBER, { align: 'center', weight: 700 });
    }
  });

  // Category breakdown
  sans(`s1-cat-hdr`, sx + 20, 220, 200, 'BY CATEGORY', 8, MUTED, { weight: 700, ls: 0.10 });
  const cats = [
    { icon: '◈', label: 'Food & Drink',   amt: 142, pct: 41, col: AMBER },
    { icon: '◎', label: 'Transport',       amt: 68,  pct: 20, col: BLUE },
    { icon: '↗', label: 'Subscriptions',   amt: 55,  pct: 16, col: '#9B8BD5' },
    { icon: '◇', label: 'Health',          amt: 48,  pct: 14, col: GREEN },
    { icon: '✦', label: 'Shopping',        amt: 35,  pct: 10, col: MUTED },
  ];
  cats.forEach((c, i) => {
    const cy = 238 + i * 60;
    rect(`s1-cat-bg-${i}`, sx + 16, cy, W - 32, 52, CARD, { cr: 10 });
    rect(`s1-cat-icon-bg-${i}`, sx + 24, cy + 12, 28, 28, DIM2, { cr: 8 });
    mono(`s1-cat-icon-${i}`, sx + 24, cy + 18, 28, c.icon, 10, c.col, { align: 'center' });
    sans(`s1-cat-lbl-${i}`, sx + 62, cy + 14, 160, c.label, 12, TEXT, { weight: 500 });
    // progress bar
    rect(`s1-cat-bar-bg-${i}`, sx + 62, cy + 32, 160, 4, DIM2, { cr: 2 });
    rect(`s1-cat-bar-${i}`, sx + 62, cy + 32, Math.round(160 * c.pct / 100), 4, c.col, { cr: 2 });
    sans(`s1-cat-amt-${i}`, sx + W - 80, cy + 18, 64, `$${c.amt}`, 13, TEXT, { weight: 700, align: 'right' });
    mono(`s1-cat-pct-${i}`, sx + W - 80, cy + 34, 64, `${c.pct}%`, 9, MUTED, { align: 'right' });
  });

  // AI insight
  insightChip(sx, 548, 'Spending on food is 18% higher vs last week — 3 restaurant visits detected.');

  // Budget status
  rect(`s1-budget-card`, sx + 16, 590, W - 32, 56, SURFACE, { cr: 12 });
  sans(`s1-budget-lbl`, sx + 28, 602, 200, 'Weekly budget', 10, MUTED);
  sans(`s1-budget-amt`, sx + 28, 618, 200, '$348 of $500 used', 12, TEXT, { weight: 600 });
  rect(`s1-budget-bar-bg`, sx + W - 128, 614, 112, 6, DIM2, { cr: 3 });
  rect(`s1-budget-bar`, sx + W - 128, 614, Math.round(112 * 0.696), 6, AMBER, { cr: 3 });

  bottomNav(sx, 1);
}

// ── SCREEN 2 — SAVE (goals tracker) ─────────────────────────────────────────
function screenSave(sx) {
  rect(`s2-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  sans(`s2-eyebrow`, sx + 20, 54, W - 40, 'SAVINGS', 8, MUTED, { weight: 700, ls: 0.10 });
  sans(`s2-title`, sx + 20, 68, W - 40, 'Your goals', 26, TEXT, { weight: 700, lh: 1.1 });
  mono(`s2-sub`, sx + 20, 100, W - 40, 'Total saved: $18,400 of $42,000 target', 9, MUTED);

  // Overall savings arc — simplified as a large bordered circle
  const arcX = sx + W / 2 - 56, arcY = 118;
  rect(`s2-arc-outer`, arcX, arcY, 112, 112, BG, { cr: 56, stroke: DIM2, sw: 2 });
  rect(`s2-arc-inner`, arcX + 8, arcY + 8, 96, 96, SURFACE, { cr: 48 });
  mono(`s2-arc-pct`, arcX, arcY + 36, 112, '43%', 28, AMBER, { weight: 700, align: 'center' });
  sans(`s2-arc-lbl`, arcX, arcY + 68, 112, 'saved', 9, MUTED, { align: 'center' });
  // Arc fill indicator (top bar as visual proxy)
  rect(`s2-arc-fill`, arcX, arcY, 112, 4, AMBER, { cr: 2, op: 0.9 });

  // Individual goals
  sans(`s2-goals-hdr`, sx + 20, 248, 200, 'ACTIVE GOALS', 8, MUTED, { weight: 700, ls: 0.10 });
  const goals = [
    { icon: '◈', label: 'Emergency Fund',     target: 12000, saved: 8400, col: AMBER, deadline: 'Jun 2026' },
    { icon: '◎', label: 'Japan Trip',          target: 6000,  saved: 2800, col: BLUE,  deadline: 'Dec 2026' },
    { icon: '◇', label: 'New MacBook Pro',     target: 4000,  saved: 3200, col: GREEN, deadline: 'May 2026' },
    { icon: '✦', label: 'Investment Seed',     target: 20000, saved: 4000, col: '#9B8BD5', deadline: 'Jan 2027' },
  ];
  goals.forEach((g, i) => {
    const gy = 266 + i * 74;
    const pct = Math.round(g.saved / g.target * 100);
    rect(`s2-goal-bg-${i}`, sx + 16, gy, W - 32, 66, CARD, { cr: 12 });
    rect(`s2-goal-icon-bg-${i}`, sx + 24, gy + 14, 32, 32, DIM, { cr: 10 });
    mono(`s2-goal-icon-${i}`, sx + 24, gy + 21, 32, g.icon, 12, g.col, { align: 'center' });
    sans(`s2-goal-lbl-${i}`, sx + 66, gy + 14, 160, g.label, 11, TEXT, { weight: 600 });
    mono(`s2-goal-dl-${i}`, sx + 66, gy + 30, 160, `Target: ${g.deadline}`, 8, MUTED);
    // progress
    rect(`s2-goal-bar-bg-${i}`, sx + 66, gy + 46, W - 102, 4, DIM2, { cr: 2 });
    rect(`s2-goal-bar-${i}`, sx + 66, gy + 46, Math.round((W - 102) * pct / 100), 4, g.col, { cr: 2 });
    sans(`s2-goal-pct-${i}`, sx + W - 64, gy + 14, 48, `${pct}%`, 16, g.col, { weight: 700, align: 'right' });
    sans(`s2-goal-saved-${i}`, sx + W - 64, gy + 34, 48, `$${g.saved.toLocaleString()}`, 8, MUTED, { align: 'right' });
  });

  // AI insight
  insightChip(sx, 572, 'MacBook goal is 80% done — on track to complete 2 weeks early.', GREEN);

  bottomNav(sx, 2);
}

// ── SCREEN 3 — INVEST (portfolio performance) ────────────────────────────────
function screenInvest(sx) {
  rect(`s3-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  sans(`s3-eyebrow`, sx + 20, 54, W - 40, 'INVESTMENTS', 8, MUTED, { weight: 700, ls: 0.10 });
  sans(`s3-title`, sx + 20, 68, W - 40, 'Portfolio', 26, TEXT, { weight: 700, lh: 1.1 });

  // Portfolio total hero
  rect(`s3-hero`, sx + 16, 108, W - 32, 100, SURFACE, { cr: 16 });
  rect(`s3-hero-glow`, sx + 16, 108, W - 32, 3, AMBER, { cr: 2 });
  sans(`s3-hero-lbl`, sx + 28, 122, 200, 'TOTAL PORTFOLIO VALUE', 7, MUTED, { weight: 700, ls: 0.10 });
  mono(`s3-hero-val`, sx + 28, 136, W - 56, '$68,240', 30, TEXT, { weight: 700, lh: 1.0 });
  rect(`s3-gain-bg`, sx + 28, 174, 110, 20, 'rgba(107,191,138,0.14)', { cr: 10 });
  sans(`s3-gain`, sx + 36, 179, 94, '▲ +$4,820 (7.6%) all-time', 9, GREEN, { weight: 600 });
  mono(`s3-ytd`, sx + W - 90, 179, 74, 'YTD +12.4%', 9, AMBER, { align: 'right', weight: 600 });

  // Allocation breakdown
  sans(`s3-alloc-hdr`, sx + 20, 224, 200, 'ALLOCATION', 8, MUTED, { weight: 700, ls: 0.10 });
  const allocs = [
    { label: 'US Index (VTSAX)', pct: 45, val: 30708, col: AMBER },
    { label: 'Intl ETF (VXUS)', pct: 20, val: 13648, col: BLUE },
    { label: 'Bonds (BND)',      pct: 15, val: 10236, col: GREEN },
    { label: 'Crypto (BTC/ETH)', pct: 12, val: 8189,  col: '#9B8BD5' },
    { label: 'Cash / HYSA',      pct: 8,  val: 5459,  col: MUTED },
  ];
  // Segmented bar
  let barOffset = sx + 16;
  const totalBarW = W - 32;
  allocs.forEach((a, i) => {
    const segW = Math.round(totalBarW * a.pct / 100);
    rect(`s3-seg-${i}`, barOffset, 242, segW - 2, 8, a.col, { cr: i === 0 ? 2 : i === allocs.length - 1 ? 2 : 0 });
    barOffset += segW;
  });
  allocs.forEach((a, i) => {
    const ay = 262 + i * 52;
    rect(`s3-a-bg-${i}`, sx + 16, ay, W - 32, 44, CARD, { cr: 10 });
    rect(`s3-a-dot-${i}`, sx + 24, ay + 16, 10, 10, a.col, { cr: 5 });
    sans(`s3-a-lbl-${i}`, sx + 42, ay + 14, 180, a.label, 11, TEXT, { weight: 500 });
    sans(`s3-a-pct-${i}`, sx + 42, ay + 28, 80, `${a.pct}%`, 9, a.col, { weight: 600 });
    sans(`s3-a-val-${i}`, sx + W - 80, ay + 18, 64, `$${a.val.toLocaleString()}`, 12, TEXT, { weight: 600, align: 'right' });
  });

  // AI insight
  insightChip(sx, 544, 'Your crypto allocation drifted +2% this month — consider rebalancing.');

  bottomNav(sx, 3);
}

// ── SCREEN 4 — INSIGHTS (AI intelligence feed) ───────────────────────────────
function screenInsights(sx) {
  rect(`s4-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  sans(`s4-eyebrow`, sx + 20, 54, W - 40, 'AI INSIGHTS', 8, AMBER, { weight: 700, ls: 0.10 });
  sans(`s4-title`, sx + 20, 68, W - 40, 'Your weekly\nintelligence', 26, TEXT, { weight: 700, lh: 1.1 });
  mono(`s4-week`, sx + 20, 110, W - 40, 'Week of March 30 — April 5, 2026', 9, MUTED);

  // Score card
  rect(`s4-score-card`, sx + 16, 128, W - 32, 80, SURFACE, { cr: 16 });
  rect(`s4-score-glow`, sx + 16, 128, W - 32, 3, AMBER, { cr: 2 });
  sans(`s4-score-lbl`, sx + 28, 142, 200, 'FINANCIAL HEALTH SCORE', 7, MUTED, { weight: 700, ls: 0.10 });
  mono(`s4-score-val`, sx + 28, 156, 100, '78', 36, AMBER, { weight: 700, lh: 1.0 });
  mono(`s4-score-max`, sx + 82, 178, 40, '/ 100', 10, MUTED);
  sans(`s4-score-trend`, sx + 28, 194, 200, '▲ +3 from last week', 9, GREEN, { weight: 500 });
  // Score breakdown mini
  const dims = [
    { l: 'Saving', v: 82 }, { l: 'Spending', v: 71 }, { l: 'Investing', v: 79 },
  ];
  dims.forEach((d, i) => {
    const dx = sx + W - 120 + i * 0;
    // stack vertically on right
    const dy = 142 + i * 20;
    rect(`s4-dim-bar-bg-${i}`, sx + W - 102, dy, 86, 6, DIM, { cr: 3 });
    rect(`s4-dim-bar-${i}`, sx + W - 102, dy, Math.round(86 * d.v / 100), 6, AMBER, { cr: 3, op: 0.6 + i * 0.1 });
    mono(`s4-dim-lbl-${i}`, sx + W - 102, dy - 10, 86, `${d.l}  ${d.v}`, 7, MUTED, { weight: 500 });
  });

  // Insight cards
  const insights = [
    {
      type: 'PATTERN', icon: '◈', col: AMBER,
      title: 'Recurring spend spike on Thursdays',
      body: 'You spend 2.4× your daily average on Thursdays. Likely lunch + after-work. Consider a $40 weekly cap.',
    },
    {
      type: 'OPPORTUNITY', icon: '↗', col: GREEN,
      title: 'Move idle cash to HYSA',
      body: '$2,100 sitting in checking for 14 days. At 4.8% APY that\'s ~$8.50/mo in lost interest.',
    },
    {
      type: 'ALERT', icon: '✦', col: RED,
      title: 'Subscription creep detected',
      body: '3 new recurring charges this month (+$34.97/mo). Review: Notion AI, Apple iCloud 2TB, Duolingo Max.',
    },
    {
      type: 'WIN', icon: '◎', col: GREEN,
      title: 'Savings streak: 6 weeks straight',
      body: 'You\'ve hit your weekly savings target for 6 consecutive weeks — your best streak yet.',
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 224 + i * 84;
    rect(`s4-ins-bg-${i}`, sx + 16, iy, W - 32, 76, CARD, { cr: 12 });
    rect(`s4-ins-l-${i}`, sx + 16, iy, 3, 76, ins.col, { cr: 1 });
    // type badge
    rect(`s4-ins-badge-bg-${i}`, sx + 28, iy + 10, 70, 16, DIM, { cr: 8 });
    mono(`s4-ins-badge-${i}`, sx + 28, iy + 13, 70, ins.type, 6, ins.col, { ls: 0.08, weight: 700, align: 'center' });
    mono(`s4-ins-icon-${i}`, sx + W - 40, iy + 12, 24, ins.icon, 12, ins.col, { align: 'center', op: 0.6 });
    sans(`s4-ins-title-${i}`, sx + 28, iy + 32, W - 60, ins.title, 11, TEXT, { weight: 600, lh: 1.2 });
    sans(`s4-ins-body-${i}`, sx + 28, iy + 48, W - 60, ins.body, 9, MUTED, { lh: 1.4 });
  });

  bottomNav(sx, 4);
}

// ── COMPOSE ALL SCREENS ──────────────────────────────────────────────────────
const screens = [
  { id: 'screen1', label: 'Pulse',    fn: screenPulse  },
  { id: 'screen2', label: 'Spend',    fn: screenSpend  },
  { id: 'screen3', label: 'Save',     fn: screenSave   },
  { id: 'screen4', label: 'Invest',   fn: screenInvest },
  { id: 'screen5', label: 'Insights', fn: screenInsights },
];

screens.forEach((s, i) => {
  const sx = GAP + i * (W + GAP);
  s.fn(sx);
});

const doc = {
  version: '2.8',
  name: 'DUNE',
  description: 'AI-powered personal finance clarity. Dark warm charcoal + amber gold. Inspired by Midday (darkmodedesign.com) and evidence-based AI products on lapa.ninja.',
  canvas: { width: canvas_w, height: H + GAP * 2, background: '#07060504' },
  screens: screens.map((s, i) => {
    const sx = GAP + i * (W + GAP);
    return {
      id: s.id,
      label: s.label,
      width: W,
      height: H,
      x: sx,
      y: GAP,
      elements: nodes.filter(n => n.x >= sx && n.x < sx + W + 50),
    };
  }),
};

const out = path.join(__dirname, 'dune.pen');
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log(`✓ dune.pen written — ${screens.length} screens, ${nodes.length} nodes`);
