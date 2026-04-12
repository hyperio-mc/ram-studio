#!/usr/bin/env node
// BRIM — AI-powered personal finance intelligence
// Dark theme: near-black #080810 + electric violet #7B5CF0 + teal #00E5B4
// Inspired by: Muradov portfolio on darkmodedesign.com — massive bold type + electric purple on pure black
// + Cecilia climate-tech (centered minimal layout, pure black, sphere elements)

const fs = require('fs');
const path = require('path');

const palette = {
  bg:      '#080810',
  surface: '#0F0F1C',
  card:    '#14142A',
  border:  '#1E1E3A',
  text:    '#F0F0FC',
  muted:   'rgba(240,240,252,0.45)',
  accent:  '#7B5CF0',
  accent2: '#00E5B4',
  warn:    '#FF6B6B',
};

function text(id, x, y, w, content, size, color, opts = {}) {
  return {
    id, type: 'TEXT', x, y, width: w, content,
    fontSize: size, color,
    fontWeight: opts.weight || 400,
    fontFamily: opts.font || 'Inter',
    letterSpacing: opts.ls || 0,
    lineHeight: opts.lh || Math.round(size * 1.3),
    align: opts.align || 'left',
    opacity: opts.opacity || 1,
  };
}

function rect(id, x, y, w, h, fill, opts = {}) {
  return { id, type: 'RECT', x, y, width: w, height: h, fill, cornerRadius: opts.r || 0, opacity: opts.opacity || 1 };
}

function statusBar(fid) {
  return [
    rect(`${fid}_sb_bg`, 0, 0, 390, 44, palette.bg),
    text(`${fid}_time`, 16, 14, 60, '9:41', 15, palette.text, { weight: 700 }),
    text(`${fid}_batt`, 310, 14, 70, '● ▶ 🔋', 13, palette.text, { align: 'right', opacity: 0.7 }),
  ];
}

function bottomNav(fid, active) {
  const tabs = [
    { id: 'home', ic: '⌂', lb: 'Home' },
    { id: 'activity', ic: '◈', lb: 'Pulse' },
    { id: 'ai', ic: '✦', lb: 'BRIM AI' },
    { id: 'goals', ic: '◎', lb: 'Goals' },
    { id: 'profile', ic: '○', lb: 'Me' },
  ];
  const nY = 764, nH = 80;
  const nodes = [
    rect(`${fid}_nv_bg`, 0, nY, 390, nH, palette.surface),
    rect(`${fid}_nv_line`, 0, nY, 390, 1, palette.border),
  ];
  tabs.forEach((t, i) => {
    const x = 8 + i * 75;
    const isA = t.id === active;
    const col = isA ? (t.id === 'ai' ? palette.accent2 : palette.accent) : palette.muted;
    nodes.push(text(`${fid}_nv_ic_${i}`, x, nY + 10, 74, t.ic, isA ? 20 : 17, col, { align: 'center', weight: isA ? 700 : 400 }));
    nodes.push(text(`${fid}_nv_lb_${i}`, x, nY + 36, 74, t.lb, 9, isA ? palette.text : palette.muted, { align: 'center', weight: isA ? 700 : 400, ls: 0.2 }));
    if (isA) nodes.push(rect(`${fid}_nv_dot_${i}`, x + 27, nY + 62, 20, 3, col, { r: 2 }));
  });
  return nodes;
}

// ── S1: Dashboard ────────────────────────────────────────────────────────────
function screen1() {
  const n = [...statusBar('s1')];

  // Greeting + avatar
  n.push(text('s1_hi', 16, 54, 260, 'Good morning, Alex ✦', 13, palette.muted, { weight: 500 }));
  n.push(rect('s1_av_bg', 348, 52, 32, 32, palette.accent, { r: 16, opacity: 0.2 }));
  n.push(text('s1_av', 348, 60, 32, 'AK', 10, palette.accent, { weight: 900, align: 'center' }));

  // Hero net worth — massive editorial number
  n.push(text('s1_nw_lbl', 16, 98, 358, 'NET WORTH', 9, palette.muted, { weight: 700, ls: 3 }));
  n.push(text('s1_nw_val', 14, 114, 340, '$284,391', 52, palette.text, { weight: 900, ls: -2 }));

  // Change badge
  n.push(rect('s1_chg_bg', 16, 174, 112, 24, 'rgba(0,229,180,0.15)', { r: 12 }));
  n.push(text('s1_chg_t', 16, 179, 112, '↑ +$3,241  +1.2%', 9, palette.accent2, { weight: 700, align: 'center' }));
  n.push(text('s1_chg_sub', 136, 180, 120, 'vs last month', 9, palette.muted));

  // Sparkline background
  n.push(rect('s1_sp_bg', 16, 206, 358, 56, palette.surface, { r: 14 }));
  // Sparkline segments (hand-crafted upward trend)
  const sparkPts = [52, 46, 50, 38, 34, 28, 32, 22, 18, 12, 16, 8];
  const sW = 330 / (sparkPts.length - 1);
  sparkPts.forEach((p, i) => {
    if (i < sparkPts.length - 1) {
      const y1 = 214 + p * 0.44;
      const y2 = 214 + sparkPts[i+1] * 0.44;
      const minY = Math.min(y1, y2);
      n.push(rect(`s1_sp_seg_${i}`, 24 + i * sW, minY, sW + 1, Math.max(Math.abs(y2 - y1), 2), palette.accent2, { r: 1 }));
    }
  });
  n.push(rect('s1_sp_fill', 24, 214 + sparkPts[sparkPts.length-1] * 0.44, 330, 56 - sparkPts[sparkPts.length-1] * 0.44, palette.accent2, { r: 0, opacity: 0.06 }));

  // 3 stat chips
  const stats = [
    { lbl: 'CASH', val: '$24.1K', chg: '+1.2%', up: true },
    { lbl: 'INVEST', val: '$198K', chg: '+5.7%', up: true },
    { lbl: 'DEBT', val: '$62K', chg: '-0.8%', up: false },
  ];
  stats.forEach((s, i) => {
    const x = 16 + i * 124;
    n.push(rect(`s1_st_${i}`, x, 274, 116, 70, palette.surface, { r: 14 }));
    n.push(text(`s1_st_lbl_${i}`, x + 10, 286, 96, s.lbl, 8, palette.muted, { weight: 700, ls: 1.5 }));
    n.push(text(`s1_st_val_${i}`, x + 10, 300, 96, s.val, 18, palette.text, { weight: 800 }));
    const cc = s.up ? palette.accent2 : palette.warn;
    n.push(text(`s1_st_chg_${i}`, x + 10, 324, 96, s.chg, 9, cc, { weight: 600 }));
  });

  // Upcoming bills
  n.push(text('s1_bill_hd', 16, 358, 200, 'Upcoming Bills', 15, palette.text, { weight: 700 }));
  n.push(text('s1_bill_see', 240, 360, 134, 'See all →', 12, palette.accent, { weight: 600, align: 'right' }));
  const bills = [
    { name: 'Rent', due: 'Apr 3', amt: '$2,200', ic: '🏠' },
    { name: 'Netflix', due: 'Apr 1', amt: '$15.99', ic: '🎬' },
    { name: 'Gym', due: 'Apr 5', amt: '$45.00', ic: '💪' },
  ];
  bills.forEach((b, i) => {
    const y = 386 + i * 58;
    n.push(rect(`s1_b_${i}`, 16, y, 358, 50, palette.surface, { r: 14 }));
    n.push(text(`s1_b_ic_${i}`, 24, y + 13, 28, b.ic, 18, palette.text, { align: 'center' }));
    n.push(text(`s1_b_nm_${i}`, 60, y + 10, 180, b.name, 13, palette.text, { weight: 600 }));
    n.push(text(`s1_b_du_${i}`, 60, y + 28, 180, `Due ${b.due}`, 10, palette.muted));
    n.push(text(`s1_b_am_${i}`, 198, y + 16, 162, b.amt, 14, palette.text, { weight: 700, align: 'right' }));
  });

  // AI insight strip
  n.push(rect('s1_ai_bg', 16, 564, 358, 74, palette.accent, { r: 16, opacity: 0.1 }));
  n.push(rect('s1_ai_border', 16, 564, 4, 74, palette.accent, { r: 2 }));
  n.push(text('s1_ai_lbl', 28, 574, 200, '✦ BRIM AI INSIGHT', 8, palette.accent, { weight: 800, ls: 2 }));
  n.push(text('s1_ai_msg', 28, 590, 318, 'Move $2K from savings to your index fund — beats your current 1.2% yield by 3.6%.', 11, palette.text, { weight: 500, lh: 17 }));
  n.push(text('s1_ai_act', 28, 624, 200, 'Act on this →', 11, palette.accent, { weight: 700 }));

  return { id: 's1', label: 'Dashboard — Command Centre', type: 'FRAME', width: 390, height: 844, background: palette.bg, children: n };
}

// ── S2: Spending Pulse ───────────────────────────────────────────────────────
function screen2() {
  const n = [...statusBar('s2')];

  n.push(text('s2_back', 16, 56, 30, '←', 22, palette.muted));
  n.push(text('s2_title', 16, 54, 358, 'Spending Pulse', 20, palette.text, { weight: 800, align: 'center' }));

  // Period pills
  ['Week', 'Month', 'Year'].forEach((p, i) => {
    const x = 68 + i * 90;
    const a = p === 'Month';
    n.push(rect(`s2_per_${i}`, x, 90, 82, 28, a ? palette.accent : palette.surface, { r: 14 }));
    n.push(text(`s2_per_t_${i}`, x, 98, 82, p, 12, a ? '#fff' : palette.muted, { align: 'center', weight: a ? 700 : 400 }));
  });

  // Hero spend number
  n.push(text('s2_sp_lbl', 16, 134, 358, 'SPENT THIS MONTH', 9, palette.muted, { weight: 700, ls: 2.5, align: 'center' }));
  n.push(text('s2_sp_val', 16, 152, 358, '$3,847', 50, palette.text, { weight: 900, align: 'center', ls: -2 }));
  // Budget bar
  n.push(rect('s2_bgt_bg', 32, 212, 326, 6, palette.border, { r: 3 }));
  n.push(rect('s2_bgt_bar', 32, 212, 220, 6, palette.warn, { r: 3 }));
  n.push(text('s2_bgt_l', 32, 224, 180, 'of $5,000 budget', 10, palette.muted));
  n.push(text('s2_bgt_pct', 220, 224, 138, '77% used', 10, palette.warn, { weight: 600, align: 'right' }));

  // Category list
  n.push(text('s2_cat_hd', 16, 250, 200, 'By Category', 15, palette.text, { weight: 700 }));
  const cats = [
    { name: 'Housing', ic: '🏠', amt: '$2,200', pct: 57, col: palette.accent },
    { name: 'Food & Dining', ic: '🍜', amt: '$640', pct: 17, col: palette.accent2 },
    { name: 'Transport', ic: '🚗', amt: '$380', pct: 10, col: '#FFB800' },
    { name: 'Entertainment', ic: '🎮', amt: '$290', pct: 8, col: '#FF6B9D' },
    { name: 'Health', ic: '💊', amt: '$180', pct: 5, col: '#4DD8E0' },
    { name: 'Other', ic: '·', amt: '$157', pct: 3, col: palette.muted },
  ];
  cats.forEach((c, i) => {
    const y = 278 + i * 58;
    n.push(rect(`s2_c_${i}`, 16, y, 358, 50, palette.surface, { r: 14 }));
    n.push(rect(`s2_c_ic_bg_${i}`, 24, y + 12, 26, 26, c.col, { r: 8, opacity: 0.18 }));
    n.push(text(`s2_c_ic_${i}`, 24, y + 16, 26, c.ic, 14, palette.text, { align: 'center' }));
    n.push(text(`s2_c_nm_${i}`, 60, y + 10, 150, c.name, 13, palette.text, { weight: 600 }));
    n.push(rect(`s2_c_bar_bg_${i}`, 60, y + 30, 170, 4, palette.border, { r: 2 }));
    n.push(rect(`s2_c_bar_${i}`, 60, y + 30, Math.round(170 * c.pct / 100), 4, c.col, { r: 2 }));
    n.push(text(`s2_c_pct_${i}`, 236, y + 28, 36, `${c.pct}%`, 9, c.col, { weight: 700 }));
    n.push(text(`s2_c_amt_${i}`, 272, y + 10, 82, c.amt, 13, palette.text, { weight: 700, align: 'right' }));
  });

  return { id: 's2', label: 'Spending Pulse', type: 'FRAME', width: 390, height: 844, background: palette.bg, children: n };
}

// ── S3: Portfolio ─────────────────────────────────────────────────────────────
function screen3() {
  const n = [...statusBar('s3')];

  n.push(text('s3_title', 16, 56, 250, 'Portfolio', 26, palette.text, { weight: 900 }));
  n.push(text('s3_sub', 16, 86, 358, 'Live · Updated 2 min ago', 11, palette.muted));

  // Hero card
  n.push(rect('s3_hero', 16, 108, 358, 116, palette.surface, { r: 20 }));
  n.push(text('s3_h_lbl', 32, 122, 200, 'TOTAL VALUE', 9, palette.muted, { weight: 700, ls: 2 }));
  n.push(text('s3_h_val', 32, 140, 240, '$198,420', 36, palette.text, { weight: 900, ls: -1 }));
  n.push(rect('s3_h_badge_bg', 32, 182, 104, 22, 'rgba(0,229,180,0.15)', { r: 11 }));
  n.push(text('s3_h_badge', 32, 186, 104, '▲ 5.7% all-time', 9, palette.accent2, { weight: 700, align: 'center' }));
  // Mini sparkline
  const sp2 = [60, 52, 56, 44, 36, 28, 24, 18, 14, 8];
  const sw2 = 90 / (sp2.length - 1);
  sp2.forEach((p, i) => {
    if (i < sp2.length - 1) {
      const y1 = 128 + p * 0.6;
      const y2 = 128 + sp2[i+1] * 0.6;
      n.push(rect(`s3_sp_${i}`, 254 + i * sw2, Math.min(y1,y2), sw2+1, Math.max(Math.abs(y2-y1), 2), palette.accent2, { r: 1 }));
    }
  });

  // Allocation visual — simplified donut via colored blocks
  n.push(text('s3_alloc_hd', 16, 240, 200, 'Allocation', 15, palette.text, { weight: 700 }));
  const allocItems = [
    { name: 'Equities', pct: 62, col: palette.accent },
    { name: 'Crypto', pct: 18, col: palette.accent2 },
    { name: 'Bonds', pct: 12, col: '#FFB800' },
    { name: 'Cash', pct: 8, col: palette.muted },
  ];
  let xOff = 16;
  allocItems.forEach(a => {
    const barW = Math.round(358 * a.pct / 100) - 4;
    n.push(rect(`s3_alloc_bar_${a.name}`, xOff, 266, barW, 12, a.col, { r: 4 }));
    xOff += barW + 4;
  });
  allocItems.forEach((a, i) => {
    const x = 16 + i * 92;
    n.push(rect(`s3_al_dot_${i}`, x, 286, 8, 8, a.col, { r: 4 }));
    n.push(text(`s3_al_lb_${i}`, x + 12, 285, 76, `${a.name} ${a.pct}%`, 9, palette.muted));
  });

  // Holdings
  n.push(text('s3_hld_hd', 16, 312, 200, 'Holdings', 15, palette.text, { weight: 700 }));
  const holdings = [
    { sym: 'VTI', name: 'Vanguard Total', alloc: '38%', val: '$75.2K', chg: '+1.8%', up: true },
    { sym: 'AAPL', name: 'Apple Inc.', alloc: '24%', val: '$47.6K', chg: '+0.4%', up: true },
    { sym: 'BTC', name: 'Bitcoin', alloc: '18%', val: '$35.7K', chg: '-2.1%', up: false },
    { sym: 'QQQ', name: 'Invesco QQQ', alloc: '14%', val: '$27.8K', chg: '+3.2%', up: true },
    { sym: 'CASH', name: 'High-yield Savings', alloc: '6%', val: '$11.9K', chg: '+4.8%', up: true },
  ];
  holdings.forEach((h, i) => {
    const y = 338 + i * 58;
    n.push(rect(`s3_h_${i}`, 16, y, 358, 50, palette.surface, { r: 14 }));
    n.push(rect(`s3_h_sym_bg_${i}`, 24, y + 10, 36, 30, palette.accent, { r: 8, opacity: 0.12 }));
    n.push(text(`s3_h_sym_${i}`, 24, y + 18, 36, h.sym, 8, palette.accent, { weight: 900, align: 'center' }));
    n.push(text(`s3_h_nm_${i}`, 70, y + 9, 160, h.name, 12, palette.text, { weight: 600 }));
    n.push(text(`s3_h_alloc_${i}`, 70, y + 27, 100, `${h.alloc} of portfolio`, 9, palette.muted));
    n.push(text(`s3_h_val_${i}`, 240, y + 9, 110, h.val, 13, palette.text, { weight: 700, align: 'right' }));
    const cc = h.up ? palette.accent2 : palette.warn;
    n.push(text(`s3_h_chg_${i}`, 258, y + 28, 92, h.chg, 10, cc, { weight: 600, align: 'right' }));
  });

  return { id: 's3', label: 'Portfolio Intelligence', type: 'FRAME', width: 390, height: 844, background: palette.bg, children: n };
}

// ── S4: BRIM AI ──────────────────────────────────────────────────────────────
function screen4() {
  const n = [...statusBar('s4')];

  // Header glow haze
  n.push(rect('s4_glow', 0, 44, 390, 220, palette.accent, { r: 0, opacity: 0.05 }));

  n.push(text('s4_badge', 16, 60, 200, '✦  BRIM  AI', 10, palette.accent, { weight: 800, ls: 4 }));
  n.push(text('s4_title', 14, 78, 320, 'Your\nFinancial\nIntelligence', 38, palette.text, { weight: 900, ls: -1.5, lh: 42 }));
  n.push(text('s4_sub', 16, 208, 280, 'Personalised insights from your full financial picture — updated daily.', 13, palette.muted, { lh: 19 }));

  // Health score
  n.push(rect('s4_score', 16, 248, 358, 80, palette.surface, { r: 18 }));
  n.push(rect('s4_score_acc', 16, 248, 5, 80, palette.accent, { r: 3 }));
  n.push(text('s4_score_lbl', 34, 260, 200, 'FINANCIAL HEALTH SCORE', 8, palette.muted, { weight: 700, ls: 1.5 }));
  n.push(text('s4_score_val', 34, 276, 120, '84 / 100', 28, palette.text, { weight: 900 }));
  n.push(text('s4_score_sub', 34, 308, 200, 'Excellent · Top 14% of users', 10, palette.accent2, { weight: 600 }));
  // Ring visual
  n.push(rect('s4_ring_bg', 296, 262, 60, 60, palette.border, { r: 30 }));
  n.push(rect('s4_ring_fg', 300, 266, 52, 52, palette.accent, { r: 26, opacity: 0.85 }));
  n.push(rect('s4_ring_in', 308, 274, 36, 36, palette.surface, { r: 18 }));
  n.push(text('s4_ring_t', 308, 284, 36, '84%', 9, palette.accent, { weight: 900, align: 'center' }));

  // Insight cards
  const insights = [
    { ic: '↑', badge: 'OPPORTUNITY', col: palette.accent2, urgent: false,
      hd: 'Earn 4.8% APY instead of 1.2%',
      body: 'Moving $15K to a high-yield savings account would net an extra $540/yr.' },
    { ic: '⚠', badge: 'ALERT', col: palette.warn, urgent: true,
      hd: 'Dining spend up 34% this month',
      body: '3 Uber Eats orders account for $180 of your $428 dining spend so far.' },
    { ic: '◈', badge: 'REBALANCE', col: palette.accent, urgent: false,
      hd: 'Portfolio drift: crypto overweight',
      body: 'BTC is 22% of portfolio vs your 15% target. Consider trimming $2.4K.' },
  ];
  insights.forEach((ins, i) => {
    const y = 346 + i * 126;
    n.push(rect(`s4_i_${i}`, 16, y, 358, 114, palette.surface, { r: 18 }));
    if (ins.urgent) n.push(rect(`s4_i_urg_${i}`, 16, y, 358, 114, ins.col, { r: 18, opacity: 0.1 }));
    n.push(rect(`s4_i_acc_${i}`, 16, y, 4, 114, ins.col, { r: 2 }));
    n.push(rect(`s4_i_badge_bg_${i}`, 30, y + 14, 78, 18, ins.col, { r: 9, opacity: 0.15 }));
    n.push(text(`s4_i_badge_t_${i}`, 30, y + 17, 78, `${ins.ic} ${ins.badge}`, 8, ins.col, { weight: 800, ls: 1, align: 'center' }));
    n.push(text(`s4_i_hd_${i}`, 30, y + 38, 318, ins.hd, 13, palette.text, { weight: 700 }));
    n.push(text(`s4_i_body_${i}`, 30, y + 57, 316, ins.body, 11, palette.muted, { lh: 16 }));
    n.push(text(`s4_i_act_${i}`, 30, y + 94, 200, 'Act on this →', 11, ins.col, { weight: 700 }));
  });

  return { id: 's4', label: 'BRIM AI Insights', type: 'FRAME', width: 390, height: 844, background: palette.bg, children: n };
}

// ── S5: Goals ────────────────────────────────────────────────────────────────
function screen5() {
  const n = [...statusBar('s5')];

  n.push(text('s5_title', 16, 56, 220, 'Goals', 28, palette.text, { weight: 900 }));
  // Add button
  n.push(rect('s5_add_bg', 294, 60, 82, 30, palette.accent, { r: 15 }));
  n.push(text('s5_add_t', 294, 68, 82, '+ Add goal', 11, '#fff', { weight: 700, align: 'center' }));

  // Summary strip
  n.push(rect('s5_sum', 16, 98, 358, 68, palette.surface, { r: 16 }));
  n.push(rect('s5_sum_acc', 16, 98, 358, 68, palette.accent, { r: 16, opacity: 0.06 }));
  n.push(text('s5_sum_lbl', 34, 110, 120, 'ON TRACK', 8, palette.accent2, { weight: 700, ls: 2 }));
  n.push(text('s5_sum_val', 34, 124, 140, '3 of 4 goals', 18, palette.text, { weight: 800 }));
  n.push(text('s5_sum_lbl2', 210, 110, 140, 'TOTAL SAVED', 8, palette.muted, { weight: 700, ls: 2 }));
  n.push(text('s5_sum_val2', 210, 124, 140, '$41,200', 18, palette.text, { weight: 800 }));

  // Goal cards
  const goals = [
    { name: 'Emergency Fund', ic: '🛡', target: '$15,000', saved: '$12,400', pct: 83, status: 'On track', sc: palette.accent2, col: palette.accent2 },
    { name: 'House Down Payment', ic: '🏡', target: '$80,000', saved: '$22,800', pct: 29, status: 'Behind', sc: palette.warn, col: palette.warn },
    { name: 'Dream Vacation', ic: '✈', target: '$6,000', saved: '$5,100', pct: 85, status: 'On track', sc: palette.accent2, col: palette.accent },
    { name: 'Early Retirement', ic: '🌴', target: '$1.5M', saved: '$198K', pct: 13, status: 'Long-term', sc: palette.accent, col: palette.accent },
  ];
  goals.forEach((g, i) => {
    const y = 180 + i * 132;
    n.push(rect(`s5_g_${i}`, 16, y, 358, 120, palette.surface, { r: 18 }));
    n.push(text(`s5_g_ic_${i}`, 24, y + 16, 36, g.ic, 22, palette.text, { align: 'center' }));
    n.push(text(`s5_g_nm_${i}`, 68, y + 14, 200, g.name, 14, palette.text, { weight: 700 }));
    n.push(rect(`s5_g_st_bg_${i}`, 68, y + 34, 66, 18, g.col, { r: 9, opacity: 0.15 }));
    n.push(text(`s5_g_st_t_${i}`, 68, y + 37, 66, g.status, 9, g.sc, { weight: 700, align: 'center' }));
    n.push(text(`s5_g_saved_${i}`, 200, y + 14, 154, g.saved, 15, palette.text, { weight: 800, align: 'right' }));
    n.push(text(`s5_g_target_${i}`, 200, y + 32, 154, `of ${g.target}`, 9, palette.muted, { align: 'right' }));
    // Progress bar
    n.push(rect(`s5_g_bar_bg_${i}`, 24, y + 66, 322, 8, palette.border, { r: 4 }));
    n.push(rect(`s5_g_bar_${i}`, 24, y + 66, Math.round(322 * g.pct / 100), 8, g.col, { r: 4 }));
    n.push(text(`s5_g_pct_${i}`, 24, y + 82, 120, `${g.pct}% complete`, 10, palette.muted));
    const proj = i === 1 ? '⚠ Needs $280/mo more' : i === 3 ? '~18 yrs at current pace' : 'On target ✓';
    n.push(text(`s5_g_proj_${i}`, 180, y + 82, 162, proj, 10, g.sc, { weight: 600, align: 'right' }));
  });

  return { id: 's5', label: 'Goals Tracker', type: 'FRAME', width: 390, height: 844, background: palette.bg, children: n };
}

// ── Assemble & write pen ─────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'BRIM — AI Financial Intelligence',
  description: 'Dark personal finance app. Near-black (#080810) base with electric violet (#7B5CF0) and teal mint (#00E5B4). Massive editorial number typography. Inspired by Muradov portfolio on darkmodedesign.com and Cecilia climate-tech layout.',
  metadata: {
    theme: 'dark',
    archetype: 'fintech-ai',
    slug: 'brim',
    palette: { primary: '#7B5CF0', secondary: '#00E5B4', bg: '#080810', surface: '#0F0F1C', text: '#F0F0FC' },
    inspiration: 'darkmodedesign.com — Muradov (electric purple on near-black, bold condensed type, 3D device mockups); Cecilia (minimal centered layout, pure black, sphere elements)',
    createdAt: new Date().toISOString(),
  },
  frames: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

const out = path.join(__dirname, 'brim.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
const kb = Math.round(fs.statSync(out).size / 1024);
console.log(`✅ brim.pen written (${kb}KB)`);
pen.frames.forEach(f => console.log(`   · ${f.label} — ${f.children.length} nodes`));
