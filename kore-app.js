// KORE — AI Business Command Center
// Dark terminal-meets-SaaS aesthetic
// Inspired by midday.ai (darkmodedesign.com) + traffic.productions editorial type (godly.website)
// Theme: DARK — near-black graphite, electric teal accent, amber signal

const fs = require('fs');

const SLUG = 'kore';
const APP_NAME = 'KORE';
const TAGLINE = 'Your business signal, live';

const BG       = '#0B0C10';
const SURFACE  = '#13151C';
const SURFACE2 = '#1C1F2A';
const TEXT      = '#E8EAF0';
const MUTED     = 'rgba(232,234,240,0.45)';
const ACCENT    = '#00E5CC';
const ACCENT2   = '#FFB800';
const DANGER    = '#FF4D6A';
const SUCCESS   = '#00C896';

function text(x, y, w, h, content, style = {}) {
  return { type: 'text', x, y, width: w, height: h, content, style };
}
function rect(x, y, w, h, style = {}) {
  return { type: 'rectangle', x, y, width: w, height: h, style };
}
function line(x1, y1, x2, y2, color = ACCENT, opacity = 0.3) {
  return { type: 'line', x1, y1, x2, y2, style: { stroke: color, strokeWidth: 1, opacity } };
}
function makeScreen(id, label, elements) {
  return { id, label, background: BG, elements };
}

const screens = [

  // ── SCREEN 1: Command Dashboard ─────────────────────────────
  makeScreen('command', 'Command', [
    rect(0, 0, 390, 48, { fill: SURFACE }),
    text(20, 13, 120, 22, 'KORE', { fontSize: 18, fontWeight: 800, color: ACCENT, letterSpacing: 6, fontFamily: 'monospace' }),
    rect(280, 12, 90, 24, { fill: SUCCESS, borderRadius: 6, opacity: 0.12 }),
    text(290, 16, 70, 18, '● LIVE', { fontSize: 11, fontWeight: 700, color: SUCCESS, letterSpacing: 2, fontFamily: 'monospace' }),

    text(20, 60, 200, 16, 'FRI 28 MAR 2025', { fontSize: 10, fontWeight: 500, color: MUTED, letterSpacing: 3, fontFamily: 'monospace' }),
    text(280, 60, 90, 16, '14:32:07', { fontSize: 10, fontWeight: 600, color: ACCENT, letterSpacing: 1, fontFamily: 'monospace' }),
    line(20, 82, 370, 82, ACCENT, 0.18),

    // Hero metric card
    rect(20, 94, 350, 106, { fill: SURFACE, borderRadius: 14 }),
    rect(20, 94, 350, 106, { fill: ACCENT, borderRadius: 14, opacity: 0.04 }),
    text(36, 110, 220, 16, 'NET CASH TODAY', { fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 3.5, fontFamily: 'monospace' }),
    text(36, 132, 280, 44, '+$48,320', { fontSize: 38, fontWeight: 900, color: TEXT, letterSpacing: -1.5 }),
    rect(36, 180, 8, 8, { fill: SUCCESS, borderRadius: 2 }),
    text(48, 178, 200, 16, '↑ 12.4% vs yesterday', { fontSize: 11, fontWeight: 500, color: SUCCESS }),

    // Three KPI tiles
    rect(20, 212, 108, 74, { fill: SURFACE2, borderRadius: 10 }),
    text(32, 222, 84, 14, 'REVENUE', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2.5, fontFamily: 'monospace' }),
    text(32, 240, 84, 28, '$61.2K', { fontSize: 21, fontWeight: 800, color: TEXT }),
    text(32, 272, 84, 14, '↑ 8.1%', { fontSize: 11, fontWeight: 600, color: SUCCESS }),

    rect(142, 212, 108, 74, { fill: SURFACE2, borderRadius: 10 }),
    text(154, 222, 84, 14, 'EXPENSES', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2.5, fontFamily: 'monospace' }),
    text(154, 240, 84, 28, '$12.9K', { fontSize: 21, fontWeight: 800, color: TEXT }),
    text(154, 272, 84, 14, '↑ 2.3%', { fontSize: 11, fontWeight: 600, color: ACCENT2 }),

    rect(264, 212, 106, 74, { fill: SURFACE2, borderRadius: 10 }),
    text(276, 222, 82, 14, 'RUNWAY', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2.5, fontFamily: 'monospace' }),
    text(276, 240, 82, 28, '14 mo', { fontSize: 21, fontWeight: 800, color: TEXT }),
    text(276, 272, 82, 14, 'stable', { fontSize: 11, fontWeight: 600, color: MUTED }),

    // Signal feed
    line(20, 300, 370, 300, ACCENT, 0.14),
    text(20, 308, 140, 16, 'SIGNAL FEED', { fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 3, fontFamily: 'monospace' }),
    text(298, 308, 72, 16, 'SEE ALL →', { fontSize: 10, fontWeight: 600, color: ACCENT, letterSpacing: 1, fontFamily: 'monospace' }),

    rect(20, 330, 350, 54, { fill: SURFACE, borderRadius: 8 }),
    rect(20, 330, 4, 54, { fill: SUCCESS, borderRadius: 3 }),
    text(36, 339, 230, 15, 'Stripe payout received', { fontSize: 13, fontWeight: 600, color: TEXT }),
    text(36, 358, 200, 14, '$22,400 · 2 min ago', { fontSize: 11, color: MUTED, fontFamily: 'monospace' }),
    text(306, 343, 54, 26, '+$22.4K', { fontSize: 12, fontWeight: 700, color: SUCCESS }),

    rect(20, 392, 350, 54, { fill: SURFACE, borderRadius: 8 }),
    rect(20, 392, 4, 54, { fill: ACCENT2, borderRadius: 3 }),
    text(36, 401, 230, 15, 'AWS invoice due in 3 days', { fontSize: 13, fontWeight: 600, color: TEXT }),
    text(36, 420, 200, 14, '$3,840 · automated', { fontSize: 11, color: MUTED, fontFamily: 'monospace' }),
    text(306, 405, 54, 26, '-$3.8K', { fontSize: 12, fontWeight: 700, color: ACCENT2 }),

    rect(20, 454, 350, 54, { fill: SURFACE, borderRadius: 8 }),
    rect(20, 454, 4, 54, { fill: DANGER, borderRadius: 3 }),
    text(36, 463, 230, 15, 'AI anomaly detected', { fontSize: 13, fontWeight: 600, color: TEXT }),
    text(36, 482, 230, 14, 'Ad spend +340% vs avg · review', { fontSize: 11, color: MUTED, fontFamily: 'monospace' }),
    rect(316, 460, 40, 24, { fill: DANGER, borderRadius: 5, opacity: 0.18 }),
    text(320, 464, 32, 16, '!', { fontSize: 14, fontWeight: 800, color: DANGER, textAlign: 'center' }),

    // Bottom nav
    rect(0, 790, 390, 74, { fill: SURFACE }),
    line(0, 790, 390, 790, ACCENT, 0.1),
    text(24, 802, 72, 42, '⌂\nHome', { fontSize: 10, fontWeight: 600, color: ACCENT, textAlign: 'center' }),
    text(120, 802, 60, 42, '⟆\nCash', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(208, 802, 60, 42, '◈\nSignals', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(296, 802, 60, 42, '⊡\nRunway', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
  ]),

  // ── SCREEN 2: Cash Flow ──────────────────────────────────────
  makeScreen('cashflow', 'Cash Flow', [
    rect(0, 0, 390, 48, { fill: SURFACE }),
    text(20, 13, 200, 22, 'CASH FLOW', { fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: 4, fontFamily: 'monospace' }),
    text(272, 13, 98, 22, 'MAR 2025', { fontSize: 12, fontWeight: 600, color: ACCENT, letterSpacing: 1, fontFamily: 'monospace' }),

    // Period tabs
    rect(20, 60, 350, 36, { fill: SURFACE2, borderRadius: 8 }),
    rect(22, 62, 82, 32, { fill: ACCENT, borderRadius: 6, opacity: 0.14 }),
    text(26, 70, 74, 18, '7 DAYS', { fontSize: 11, fontWeight: 700, color: ACCENT, textAlign: 'center', letterSpacing: 1 }),
    text(110, 70, 60, 18, '30D', { fontSize: 11, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(196, 70, 60, 18, '90D', { fontSize: 11, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(282, 70, 60, 18, '1Y', { fontSize: 11, fontWeight: 500, color: MUTED, textAlign: 'center' }),

    // Chart
    rect(20, 110, 350, 180, { fill: SURFACE, borderRadius: 12 }),
    // grid
    line(56, 132, 360, 132, MUTED, 0.1),
    line(56, 160, 360, 160, MUTED, 0.1),
    line(56, 188, 360, 188, MUTED, 0.1),
    line(56, 216, 360, 216, MUTED, 0.1),
    line(56, 244, 360, 244, MUTED, 0.1),
    // y labels
    text(22, 126, 32, 12, '80K', { fontSize: 8, color: MUTED, fontFamily: 'monospace' }),
    text(22, 154, 32, 12, '60K', { fontSize: 8, color: MUTED, fontFamily: 'monospace' }),
    text(22, 182, 32, 12, '40K', { fontSize: 8, color: MUTED, fontFamily: 'monospace' }),
    text(22, 210, 32, 12, '20K', { fontSize: 8, color: MUTED, fontFamily: 'monospace' }),
    // Revenue bars (teal)
    rect(60, 188, 22, 56, { fill: ACCENT, borderRadius: 3, opacity: 0.75 }),
    rect(104, 164, 22, 80, { fill: ACCENT, borderRadius: 3, opacity: 0.75 }),
    rect(148, 176, 22, 68, { fill: ACCENT, borderRadius: 3, opacity: 0.75 }),
    rect(192, 148, 22, 96, { fill: ACCENT, borderRadius: 3, opacity: 0.75 }),
    rect(236, 136, 22, 108, { fill: ACCENT, borderRadius: 3, opacity: 0.75 }),
    rect(280, 148, 22, 96, { fill: ACCENT, borderRadius: 3, opacity: 0.75 }),
    rect(320, 130, 22, 114, { fill: ACCENT, borderRadius: 3, opacity: 0.9 }),
    // Expense bars (amber/red)
    rect(60, 222, 22, 22, { fill: DANGER, borderRadius: 3, opacity: 0.55 }),
    rect(104, 218, 22, 26, { fill: DANGER, borderRadius: 3, opacity: 0.55 }),
    rect(148, 224, 22, 20, { fill: DANGER, borderRadius: 3, opacity: 0.55 }),
    rect(192, 220, 22, 24, { fill: DANGER, borderRadius: 3, opacity: 0.55 }),
    rect(236, 216, 22, 28, { fill: DANGER, borderRadius: 3, opacity: 0.55 }),
    rect(280, 218, 22, 26, { fill: DANGER, borderRadius: 3, opacity: 0.55 }),
    rect(320, 212, 22, 32, { fill: DANGER, borderRadius: 3, opacity: 0.55 }),
    // x labels
    text(56, 254, 28, 12, 'M', { fontSize: 8, color: MUTED, textAlign: 'center', fontFamily: 'monospace' }),
    text(100, 254, 28, 12, 'T', { fontSize: 8, color: MUTED, textAlign: 'center', fontFamily: 'monospace' }),
    text(144, 254, 28, 12, 'W', { fontSize: 8, color: MUTED, textAlign: 'center', fontFamily: 'monospace' }),
    text(188, 254, 28, 12, 'T', { fontSize: 8, color: MUTED, textAlign: 'center', fontFamily: 'monospace' }),
    text(232, 254, 28, 12, 'F', { fontSize: 8, color: MUTED, textAlign: 'center', fontFamily: 'monospace' }),
    text(276, 254, 28, 12, 'S', { fontSize: 8, color: MUTED, textAlign: 'center', fontFamily: 'monospace' }),
    text(316, 254, 28, 12, 'S', { fontSize: 8, color: MUTED, textAlign: 'center', fontFamily: 'monospace' }),
    // legend
    rect(56, 272, 10, 10, { fill: ACCENT, borderRadius: 2 }),
    text(70, 270, 60, 14, 'Revenue', { fontSize: 9, color: MUTED }),
    rect(140, 272, 10, 10, { fill: DANGER, borderRadius: 2, opacity: 0.6 }),
    text(154, 270, 60, 14, 'Expenses', { fontSize: 9, color: MUTED }),

    // Summary
    rect(20, 304, 350, 54, { fill: SURFACE2, borderRadius: 10 }),
    text(36, 316, 140, 15, 'WEEK NET', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 3, fontFamily: 'monospace' }),
    text(36, 334, 140, 18, '+$48,320', { fontSize: 16, fontWeight: 800, color: SUCCESS }),
    text(216, 316, 120, 15, 'BURN RATE', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 3, fontFamily: 'monospace' }),
    text(216, 334, 120, 18, '$1,842/day', { fontSize: 16, fontWeight: 800, color: TEXT }),

    // Transactions
    line(20, 372, 370, 372, ACCENT, 0.12),
    text(20, 380, 180, 16, 'RECENT TRANSACTIONS', { fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 2, fontFamily: 'monospace' }),

    rect(20, 402, 350, 50, { fill: SURFACE, borderRadius: 8 }),
    text(32, 412, 210, 15, 'Stripe — Customer payout', { fontSize: 12, fontWeight: 600, color: TEXT }),
    text(32, 430, 180, 13, 'Ops · 13:42 today', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    text(306, 416, 54, 22, '+$22.4K', { fontSize: 12, fontWeight: 700, color: SUCCESS }),

    rect(20, 460, 350, 50, { fill: SURFACE, borderRadius: 8 }),
    text(32, 470, 210, 15, 'Vercel Pro — Hosting', { fontSize: 12, fontWeight: 600, color: TEXT }),
    text(32, 488, 180, 13, 'Infra · 10:15 today', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    text(306, 474, 54, 22, '-$480', { fontSize: 12, fontWeight: 700, color: DANGER }),

    rect(20, 518, 350, 50, { fill: SURFACE, borderRadius: 8 }),
    text(32, 528, 210, 15, 'Google Ads — Campaign', { fontSize: 12, fontWeight: 600, color: TEXT }),
    text(32, 546, 180, 13, 'Growth · 09:00 today', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    text(306, 532, 54, 22, '-$2.1K', { fontSize: 12, fontWeight: 700, color: DANGER }),

    rect(0, 790, 390, 74, { fill: SURFACE }),
    line(0, 790, 390, 790, ACCENT, 0.1),
    text(24, 802, 72, 42, '⌂\nHome', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(120, 802, 60, 42, '⟆\nCash', { fontSize: 10, fontWeight: 600, color: ACCENT, textAlign: 'center' }),
    text(208, 802, 60, 42, '◈\nSignals', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(296, 802, 60, 42, '⊡\nRunway', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
  ]),

  // ── SCREEN 3: AI Signals ─────────────────────────────────────
  makeScreen('signals', 'AI Signals', [
    rect(0, 0, 390, 48, { fill: SURFACE }),
    text(20, 13, 200, 22, 'AI SIGNALS', { fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: 4, fontFamily: 'monospace' }),
    rect(278, 11, 92, 26, { fill: ACCENT, borderRadius: 6, opacity: 0.1 }),
    text(284, 15, 80, 18, '● 3 NEW', { fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: 2, fontFamily: 'monospace' }),

    text(20, 58, 350, 30, 'KORE monitors 24 live streams and surfaces anomalies before they become problems.', { fontSize: 11, fontWeight: 400, color: MUTED }),

    // Critical card
    rect(20, 100, 350, 100, { fill: '#160A0D', borderRadius: 12 }),
    rect(20, 100, 350, 3, { fill: DANGER, borderRadius: 3 }),
    text(32, 114, 240, 15, 'AD SPEND ANOMALY', { fontSize: 10, fontWeight: 700, color: DANGER, letterSpacing: 3, fontFamily: 'monospace' }),
    rect(336, 110, 24, 24, { fill: DANGER, borderRadius: 6, opacity: 0.15 }),
    text(342, 114, 16, 18, '!', { fontSize: 14, fontWeight: 800, color: DANGER, textAlign: 'center' }),
    text(32, 132, 316, 40, 'Google Ads spend +340% vs 7-day avg. $4.2K burned this morning. Immediate review recommended.', { fontSize: 11, color: TEXT }),
    text(32, 178, 100, 15, 'ACTION NEEDED', { fontSize: 9, fontWeight: 700, color: DANGER, letterSpacing: 2, fontFamily: 'monospace' }),
    text(264, 178, 96, 15, '08:44 today', { fontSize: 9, color: MUTED, fontFamily: 'monospace' }),

    // Warning card
    rect(20, 212, 350, 96, { fill: '#14100A', borderRadius: 12 }),
    rect(20, 212, 350, 3, { fill: ACCENT2, borderRadius: 3 }),
    text(32, 226, 240, 15, 'MRR GROWTH SLOWING', { fontSize: 10, fontWeight: 700, color: ACCENT2, letterSpacing: 3, fontFamily: 'monospace' }),
    text(32, 244, 316, 36, 'New MRR grew +2.1% this week vs +6.8% monthly avg. 3 trial conversions still pending.', { fontSize: 11, color: TEXT }),
    text(32, 286, 100, 15, 'MONITOR', { fontSize: 9, fontWeight: 700, color: ACCENT2, letterSpacing: 2, fontFamily: 'monospace' }),
    text(264, 286, 96, 15, 'Yesterday', { fontSize: 9, color: MUTED, fontFamily: 'monospace' }),

    // Positive card
    rect(20, 320, 350, 96, { fill: '#08140F', borderRadius: 12 }),
    rect(20, 320, 350, 3, { fill: SUCCESS, borderRadius: 3 }),
    text(32, 334, 240, 15, 'PAYMENT VELOCITY UP', { fontSize: 10, fontWeight: 700, color: SUCCESS, letterSpacing: 3, fontFamily: 'monospace' }),
    text(32, 352, 316, 36, 'Avg invoice settlement now 4.2 days — best in 6 months. $18K cash release projected next week.', { fontSize: 11, color: TEXT }),
    text(32, 394, 100, 15, 'INSIGHT', { fontSize: 9, fontWeight: 700, color: SUCCESS, letterSpacing: 2, fontFamily: 'monospace' }),
    text(264, 394, 96, 15, '2 days ago', { fontSize: 9, color: MUTED, fontFamily: 'monospace' }),

    // Info card
    rect(20, 428, 350, 88, { fill: SURFACE, borderRadius: 12 }),
    rect(20, 428, 350, 3, { fill: ACCENT, borderRadius: 3, opacity: 0.5 }),
    text(32, 442, 240, 15, 'SEASONAL PATTERN', { fontSize: 10, fontWeight: 700, color: ACCENT, letterSpacing: 3, fontFamily: 'monospace', opacity: 0.7 }),
    text(32, 460, 316, 32, 'Q1 typically shows -12% enterprise deal velocity. Current pipeline tracking on benchmark.', { fontSize: 11, color: TEXT }),
    text(32, 500, 100, 15, 'INFO', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2, fontFamily: 'monospace' }),
    text(264, 500, 96, 15, '3 days ago', { fontSize: 9, color: MUTED, fontFamily: 'monospace' }),

    rect(0, 790, 390, 74, { fill: SURFACE }),
    line(0, 790, 390, 790, ACCENT, 0.1),
    text(24, 802, 72, 42, '⌂\nHome', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(120, 802, 60, 42, '⟆\nCash', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(208, 802, 60, 42, '◈\nSignals', { fontSize: 10, fontWeight: 600, color: ACCENT, textAlign: 'center' }),
    text(296, 802, 60, 42, '⊡\nRunway', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
  ]),

  // ── SCREEN 4: Runway Scenarios ───────────────────────────────
  makeScreen('runway', 'Runway', [
    rect(0, 0, 390, 48, { fill: SURFACE }),
    text(20, 13, 200, 22, 'RUNWAY', { fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: 4, fontFamily: 'monospace' }),
    text(256, 13, 114, 22, '14.2 MONTHS', { fontSize: 12, fontWeight: 700, color: SUCCESS, fontFamily: 'monospace' }),

    // Gauge card
    rect(20, 58, 350, 124, { fill: SURFACE, borderRadius: 14 }),
    text(36, 74, 280, 15, 'PROJECTED RUNWAY', { fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 3.5, fontFamily: 'monospace' }),
    text(36, 94, 200, 44, '14.2 mo', { fontSize: 34, fontWeight: 900, color: TEXT, letterSpacing: -1 }),
    text(36, 140, 290, 15, 'Based on $1,842/day avg burn · Safe zone', { fontSize: 11, color: MUTED, fontFamily: 'monospace' }),
    // progress track
    rect(36, 164, 318, 8, { fill: SURFACE2, borderRadius: 4 }),
    rect(36, 164, 202, 8, { fill: SUCCESS, borderRadius: 4 }),
    rect(234, 160, 2, 16, { fill: ACCENT2, borderRadius: 1 }),
    text(228, 178, 30, 12, '12mo', { fontSize: 8, color: ACCENT2, fontFamily: 'monospace' }),

    text(20, 200, 120, 16, 'SCENARIOS', { fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 3, fontFamily: 'monospace' }),

    rect(20, 222, 350, 72, { fill: SURFACE2, borderRadius: 10 }),
    rect(20, 222, 4, 72, { fill: SUCCESS, borderRadius: 3 }),
    text(36, 234, 200, 14, 'BASE CASE', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2, fontFamily: 'monospace' }),
    text(36, 252, 200, 22, '14.2 months', { fontSize: 17, fontWeight: 800, color: TEXT }),
    text(36, 278, 200, 14, 'Flat burn · $1,842/day', { fontSize: 11, color: MUTED, fontFamily: 'monospace' }),
    text(292, 252, 68, 22, 'JUN 2026', { fontSize: 11, fontWeight: 700, color: SUCCESS, fontFamily: 'monospace' }),

    rect(20, 302, 350, 72, { fill: SURFACE2, borderRadius: 10 }),
    rect(20, 302, 4, 72, { fill: ACCENT2, borderRadius: 3 }),
    text(36, 314, 200, 14, 'GROWTH PUSH', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2, fontFamily: 'monospace' }),
    text(36, 332, 200, 22, '9.8 months', { fontSize: 17, fontWeight: 800, color: TEXT }),
    text(36, 358, 200, 14, 'Burn +40% · growth hires', { fontSize: 11, color: MUTED, fontFamily: 'monospace' }),
    text(292, 332, 68, 22, 'JAN 2026', { fontSize: 11, fontWeight: 700, color: ACCENT2, fontFamily: 'monospace' }),

    rect(20, 382, 350, 72, { fill: SURFACE2, borderRadius: 10 }),
    rect(20, 382, 4, 72, { fill: DANGER, borderRadius: 3 }),
    text(36, 394, 200, 14, 'WORST CASE', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2, fontFamily: 'monospace' }),
    text(36, 412, 200, 22, '7.1 months', { fontSize: 17, fontWeight: 800, color: TEXT }),
    text(36, 438, 200, 14, '+15% churn · +20% burn', { fontSize: 11, color: MUTED, fontFamily: 'monospace' }),
    text(292, 412, 68, 22, 'OCT 2025', { fontSize: 11, fontWeight: 700, color: DANGER, fontFamily: 'monospace' }),

    // Monthly burn
    line(20, 468, 370, 468, ACCENT, 0.12),
    text(20, 476, 200, 15, 'MONTHLY BURN BREAKDOWN', { fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 2, fontFamily: 'monospace' }),

    rect(20, 496, 350, 46, { fill: SURFACE, borderRadius: 8 }),
    text(32, 506, 150, 14, 'Payroll', { fontSize: 12, fontWeight: 600, color: TEXT }),
    text(32, 524, 110, 13, '68% of burn', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    rect(196, 510, 106, 5, { fill: SURFACE2, borderRadius: 2 }),
    rect(196, 510, 72, 5, { fill: DANGER, borderRadius: 2, opacity: 0.7 }),
    text(310, 504, 50, 24, '$37.5K', { fontSize: 12, fontWeight: 700, color: TEXT }),

    rect(20, 550, 350, 46, { fill: SURFACE, borderRadius: 8 }),
    text(32, 560, 150, 14, 'Infrastructure', { fontSize: 12, fontWeight: 600, color: TEXT }),
    text(32, 578, 110, 13, '15% of burn', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    rect(196, 564, 106, 5, { fill: SURFACE2, borderRadius: 2 }),
    rect(196, 564, 16, 5, { fill: ACCENT2, borderRadius: 2, opacity: 0.7 }),
    text(310, 558, 50, 24, '$8.3K', { fontSize: 12, fontWeight: 700, color: TEXT }),

    rect(0, 790, 390, 74, { fill: SURFACE }),
    line(0, 790, 390, 790, ACCENT, 0.1),
    text(24, 802, 72, 42, '⌂\nHome', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(120, 802, 60, 42, '⟆\nCash', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(208, 802, 60, 42, '◈\nSignals', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(296, 802, 60, 42, '⊡\nRunway', { fontSize: 10, fontWeight: 600, color: ACCENT, textAlign: 'center' }),
  ]),

  // ── SCREEN 5: Integrations ───────────────────────────────────
  makeScreen('connect', 'Connect', [
    rect(0, 0, 390, 48, { fill: SURFACE }),
    text(20, 13, 200, 22, 'CONNECT', { fontSize: 16, fontWeight: 800, color: TEXT, letterSpacing: 4, fontFamily: 'monospace' }),

    text(20, 58, 350, 30, 'Connect your stack. KORE ingests all your tools into one unified live feed.', { fontSize: 12, color: MUTED }),

    text(20, 102, 150, 15, 'CONNECTED', { fontSize: 10, fontWeight: 700, color: SUCCESS, letterSpacing: 3, fontFamily: 'monospace' }),

    rect(20, 122, 350, 62, { fill: SURFACE, borderRadius: 10 }),
    rect(20, 122, 4, 62, { fill: SUCCESS, borderRadius: 3 }),
    rect(32, 131, 42, 42, { fill: '#5851EA', borderRadius: 8, opacity: 0.2 }),
    text(46, 143, 18, 18, 'S', { fontSize: 17, fontWeight: 900, color: '#635BFF', textAlign: 'center' }),
    text(88, 130, 180, 15, 'Stripe', { fontSize: 14, fontWeight: 700, color: TEXT }),
    text(88, 150, 220, 13, 'Payments · Active · synced 2m ago', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    text(336, 138, 14, 28, '●', { fontSize: 14, color: SUCCESS }),

    rect(20, 192, 350, 62, { fill: SURFACE, borderRadius: 10 }),
    rect(20, 192, 4, 62, { fill: SUCCESS, borderRadius: 3 }),
    rect(32, 201, 42, 42, { fill: '#0066FF', borderRadius: 8, opacity: 0.2 }),
    text(46, 213, 18, 18, 'M', { fontSize: 17, fontWeight: 900, color: '#0066FF', textAlign: 'center' }),
    text(88, 200, 180, 15, 'Mercury Bank', { fontSize: 14, fontWeight: 700, color: TEXT }),
    text(88, 220, 220, 13, 'Banking · Active · synced 5m ago', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    text(336, 208, 14, 28, '●', { fontSize: 14, color: SUCCESS }),

    text(20, 270, 180, 15, 'NOT CONNECTED', { fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 3, fontFamily: 'monospace' }),

    rect(20, 290, 350, 60, { fill: SURFACE2, borderRadius: 10 }),
    rect(32, 299, 42, 42, { fill: '#2CA01C', borderRadius: 8, opacity: 0.15 }),
    text(46, 311, 18, 18, 'Q', { fontSize: 17, fontWeight: 900, color: '#2CA01C', textAlign: 'center' }),
    text(88, 298, 180, 15, 'QuickBooks', { fontSize: 14, fontWeight: 700, color: TEXT }),
    text(88, 318, 200, 13, 'Accounting · tap to link', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    rect(308, 305, 52, 28, { fill: ACCENT, borderRadius: 6, opacity: 0.1 }),
    text(316, 312, 36, 15, 'Link', { fontSize: 12, fontWeight: 700, color: ACCENT }),

    rect(20, 358, 350, 60, { fill: SURFACE2, borderRadius: 10 }),
    rect(32, 367, 42, 42, { fill: '#FBBC05', borderRadius: 8, opacity: 0.15 }),
    text(46, 379, 18, 18, 'G', { fontSize: 17, fontWeight: 900, color: '#FBBC05', textAlign: 'center' }),
    text(88, 366, 180, 15, 'Google Ads', { fontSize: 14, fontWeight: 700, color: TEXT }),
    text(88, 386, 200, 13, 'Marketing · tap to link', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    rect(308, 373, 52, 28, { fill: ACCENT, borderRadius: 6, opacity: 0.1 }),
    text(316, 380, 36, 15, 'Link', { fontSize: 12, fontWeight: 700, color: ACCENT }),

    rect(20, 426, 350, 60, { fill: SURFACE2, borderRadius: 10 }),
    rect(32, 435, 42, 42, { fill: '#FF7A59', borderRadius: 8, opacity: 0.15 }),
    text(46, 447, 18, 18, 'H', { fontSize: 17, fontWeight: 900, color: '#FF7A59', textAlign: 'center' }),
    text(88, 434, 180, 15, 'HubSpot CRM', { fontSize: 14, fontWeight: 700, color: TEXT }),
    text(88, 454, 200, 13, 'Pipeline · tap to link', { fontSize: 10, color: MUTED, fontFamily: 'monospace' }),
    rect(308, 441, 52, 28, { fill: ACCENT, borderRadius: 6, opacity: 0.1 }),
    text(316, 448, 36, 15, 'Link', { fontSize: 12, fontWeight: 700, color: ACCENT }),

    rect(20, 502, 350, 48, { fill: SURFACE, borderRadius: 10 }),
    line(20, 502, 370, 502, ACCENT, 0.2),
    text(36, 516, 290, 20, '+ Connect another data source', { fontSize: 13, fontWeight: 600, color: ACCENT }),

    rect(0, 790, 390, 74, { fill: SURFACE }),
    line(0, 790, 390, 790, ACCENT, 0.1),
    text(24, 802, 72, 42, '⌂\nHome', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(120, 802, 60, 42, '⟆\nCash', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(208, 802, 60, 42, '◈\nSignals', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
    text(296, 802, 60, 42, '⊡\nRunway', { fontSize: 10, fontWeight: 500, color: MUTED, textAlign: 'center' }),
  ]),
];

const pen = {
  version: '2.8',
  name: APP_NAME,
  tagline: TAGLINE,
  archetype: 'ai-business-command-center',
  theme: 'dark',
  screens,
  metadata: {
    createdAt: new Date().toISOString(),
    slug: SLUG,
    colors: { bg: BG, surface: SURFACE, text: TEXT, accent: ACCENT, accent2: ACCENT2 },
    designer: 'RAM Design Heartbeat',
    inspiration: 'midday.ai (darkmodedesign.com) · traffic.productions (godly.website)',
    challenge: 'Dark AI business command center — terminal aesthetics merged with modern SaaS finance tool',
  }
};

fs.writeFileSync('kore.pen', JSON.stringify(pen, null, 2));
console.log('✓ kore.pen written —', screens.length, 'screens');
console.log('  Slug:', SLUG, '| Theme: DARK');
console.log('  BG:', BG, '| Accent:', ACCENT, '| Amber:', ACCENT2);
