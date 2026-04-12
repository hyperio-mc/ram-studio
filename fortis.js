#!/usr/bin/env node
// FORTIS — Funded Trader Challenge Platform
// Heartbeat design challenge — research-first process applied
//
// What I found while researching:
//   - Dribbble trending: "Prop Firm Challenge Progress UI" (Serhii Antoniuk) — dark bg, green progress bars,
//     high-density data, trading terminal aesthetic. 56 likes, 2.9k views.
//   - Godly: Haptic app — dark #2B2B2B off-black, massive display type, single-page editorial.
//     Confirmed dark + large type is the dominant direction for serious tool marketing sites.
//   - Dribbble: "Agenix AI Multi-Agent Workspace" (#1 in product design) — purple/indigo gradient
//     on near-black. AI workspace aesthetic taking over SaaS design.
//
// Market research — Prop Trading / Funded Trader industry:
//   FTMO (ftmo.com) — market leader since 2015, Czech Republic. Up to $200K capital, 2-step + 1-step
//     challenges. Has paid out $1B+ to traders globally. "Account Metrix" analytics tool.
//   Apex Trader Funding — US futures specialist, very popular for NQ/ES traders
//   TopstepTrader — US-focused futures, longest standing competitor
//   The Funded Trader — multi-asset, "Royal" accounts for elite traders
//   MyFundedFX — forex-focused, lower fees, growing fast
//   True Forex Funds — European competitor, aggressive pricing
//
// Market gap found: No competitor has a clean mobile-first dashboard for challenge progress.
//   All existing trader dashboards are dense desktop tables. No visual gauge system.
//   No "morning check-in" mobile view optimized for the trader's daily anxiety loop.
//
// Domain research — Funded Trading:
//   Actors:
//     Challenge Trader — retail trader at desk w/ TradingView/MT4/MT5 open simultaneously.
//       Morning anxiety: "Where am I vs. daily loss limit before markets open?"
//       Intraday anxiety: "How close am I to blowing the day?"
//       Evening habit: review all trades, check challenge progress, plan next day.
//     Funded Trader — same person post-challenge. Higher stakes, real payout implications.
//       Primary goal: protect funded status, maximize payout.
//
//   Domain concepts with no generic equivalent:
//     Max Drawdown — maximum allowed loss from account high-water mark (usually 10%).
//       BINARY rule: breach = instant account termination. Not a soft limit.
//     Daily Loss Limit — max loss allowed in a single calendar day (usually 5%).
//       Resets each day. The most common challenge-killer.
//     High-Water Mark — account's highest ever balance. Drawdown calculated from this.
//     Profit Target — % gain needed to pass phase (Phase 1: 8–10%, Phase 2: 5%).
//     Minimum Trading Days — must trade on at least N calendar days (prevents "lucky day" passing).
//     Consistency Rule — no single day's profit > 30% of total profit (some firms).
//     Challenge Phase — Phase 1 → Phase 2 → Funded. Each phase has its own targets.
//
//   UI implications:
//     Primary object: the ACCOUNT (not the trade, not the position — the account state).
//     Visual hierarchy: Risk status FIRST (are you safe?) → Profit progress → Trade detail.
//     Gauges/meters > tables for risk. You need to FEEL how close to the edge you are.
//     Color coding binary: green = safe, amber = caution zone (within 30% of limit), red = breach imminent.
//     Mobile = morning check device. Desktop = trading day device.
//     Primary UI paradigm: Dashboard + Gauge/Meter (instrument cluster) — NOT nav+list+card.
//
//   Structural decision:
//     NOT nav+list+card. NOT mission control.
//     Primary skeleton: Gauge cluster (risk instruments) + progress bars + trade list.
//     Inspired by car instrument cluster + Bloomberg terminal density.
//     The gauge is the primary UI primitive, not the card or the table row.

const https = require('https');
const fs    = require('fs');

// ─── PALETTE — dark financial terminal ────────────────────────────────────────
const P = {
  bg:      '#0A0C11',   // near-black, terminal void
  panel:   '#0F1218',   // panel surface
  panel2:  '#141922',   // raised panel
  panel3:  '#1A2230',   // elevated
  border:  '#1C2535',   // separator
  border2: '#263347',   // stronger border
  text:    '#E2E8F4',   // primary
  sub:     '#7A8EA8',   // secondary
  dim:     '#374455',   // tertiary
  // States
  profit:  '#00D68F',   // terminal green — safe / profit
  profBg:  '#061A12',
  loss:    '#FF4444',   // red — loss / danger
  lossBg:  '#1A0808',
  warn:    '#FFB020',   // amber — caution zone
  warnBg:  '#1A1006',
  blue:    '#3B82F6',   // blue — neutral info
  blueBg:  '#081530',
  // Accent
  neon:    '#00FFB2',   // neon mint — top metric highlight
};

const MW = 375, MH = 812;
const PW = 1440, PH = 900;

let idC = 1;
const uid = () => `f${idC++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, children = [], opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h, fill,
  cornerRadius: opts.r || 0, opacity: opts.op !== undefined ? opts.op : 1,
  children: children.filter(Boolean),
});
const R  = (x, y, w, h, fill, opts = {}) => F(x, y, w, h, fill, [], opts);
const E  = (x, y, w, h, fill, op = 1)   => ({ id: uid(), type: 'ellipse', x, y, width: w, height: h, fill, opacity: op });
const T  = (text, x, y, w, h, size, color, bold = false, align = 'left', op = 1, ls = 0) => ({
  id: uid(), type: 'text', x, y, width: w, height: h, text,
  fontSize: size, fill: color, fontWeight: bold ? 700 : 400,
  textAlign: align, opacity: op, letterSpacing: ls,
});
const Ln = (x, y, w, fill, op = 1) => R(x, y, w, 1, fill, { op });

// ─── DOMAIN HELPERS ───────────────────────────────────────────────────────────

// Risk gauge — simulated circular gauge using concentric ellipses
// pct: 0–1 current usage (0 = no risk, 1 = at limit)
// type: 'profit' | 'drawdown' | 'daily'
function RiskGauge(cx, cy, r, pct, value, label, type) {
  const col    = type === 'profit'
    ? (pct >= 1 ? P.neon : pct >= 0.6 ? P.profit : P.blue)
    : (pct <= 0.5 ? P.profit : pct <= 0.75 ? P.warn : P.loss);
  const glow   = Math.min(pct + 0.15, 0.85);
  const inner  = Math.round(r * 0.62);
  return F(cx - r, cy - r, r * 2, r * 2, 'transparent', [
    // outer ring bg
    E(0, 0, r * 2, r * 2, P.border, 0.5),
    // colored ring (opacity = pct for profit, pct for risk)
    E(0, 0, r * 2, r * 2, col, glow * 0.6),
    // inner cutout
    E(r - inner, r - inner, inner * 2, inner * 2, P.panel2),
    // center value
    T(value, 0, r - 14, r * 2, 26, 20, col, true, 'center'),
    T(label, 0, r + 14, r * 2, 12, 7, P.sub, false, 'center', 1, 0.6),
  ]);
}

// Progress bar with threshold marker
function RiskBar(x, y, w, pct, col, label, value, limit) {
  const barH = 8;
  const threshX = Math.round(w * 0.75); // warn at 75%
  return F(x, y, w, 40, 'transparent', [
    T(label, 0, 0, w - 80, 12, 8, P.sub, false, 'left', 1, 0.5),
    T(value, w - 76, 0, 76, 12, 9, col, true, 'right'),
    // Track
    R(0, 18, w, barH, P.border, { r: 4 }),
    // Fill
    R(0, 18, Math.round(w * Math.min(pct, 1)), barH, col, { r: 4 }),
    // Limit marker
    R(threshX, 14, 2, barH + 8, P.warn, { op: 0.6 }),
    T(limit, threshX - 8, 28, 40, 12, 7, P.dim, false, 'center'),
  ]);
}

// P&L chip — green or red
function PnLChip(x, y, value, positive) {
  const col = positive ? P.profit : P.loss;
  const bg  = positive ? P.profBg : P.lossBg;
  const w   = value.length * 7.5 + 20;
  return F(x, y, w, 22, bg, [
    R(0, 0, w, 22, col, { op: 0.15, r: 4 }),
    T(value, 0, 4, w, 14, 9, col, true, 'center'),
  ], { r: 4 });
}

// Challenge phase stepper
function PhaseStepper(x, y, w, currentPhase) {
  // currentPhase: 0 = P1, 1 = P2, 2 = Funded
  const phases = ['Phase 1', 'Phase 2', 'Funded'];
  const stepW  = Math.round((w - 40) / 3);
  return F(x, y, w, 32, 'transparent', [
    ...phases.map((label, i) => {
      const done    = i < currentPhase;
      const active  = i === currentPhase;
      const col     = done ? P.profit : active ? P.neon : P.dim;
      const bgCol   = done ? P.profBg : active ? P.panel3 : P.panel;
      const sx      = i * (stepW + 20);
      return F(sx, 0, stepW, 32, bgCol, [
        done   ? R(0, 0, stepW, 2, P.profit)  : null,
        active ? R(0, 0, stepW, 2, P.neon)    : null,
        T(label, 0, 10, stepW, 14, 9, col, active || done, 'center', 1, 0.3),
      ].filter(Boolean), { r: 4 });
    }),
    // connectors
    R(stepW, 14, 20, 2, P.profit),
    R(2 * stepW + 20, 14, 20, 2, currentPhase >= 2 ? P.profit : P.border),
  ]);
}

// Trade row — compact journal row
function TradeRow(x, y, w, rowH, trade) {
  const pnlPos = parseFloat(trade.pnl) > 0;
  const pnlCol = pnlPos ? P.profit : P.loss;
  return F(x, y, w, rowH, P.panel, [
    R(0, 0, 3, rowH, pnlCol),
    T(trade.symbol, 12, Math.round((rowH - 16) / 2), 60, 16, 11, P.text, true),
    T(trade.dir, 78, Math.round((rowH - 12) / 2), 32, 12, 8, trade.dir === 'BUY' ? P.profit : P.loss, true),
    T(trade.time, 116, Math.round((rowH - 12) / 2), 80, 12, 9, P.sub),
    T(trade.lots, 200, Math.round((rowH - 12) / 2), 40, 12, 9, P.sub),
    PnLChip(w - 80, Math.round((rowH - 22) / 2), trade.pnl, pnlPos),
    Ln(0, rowH - 1, w, P.border),
  ]);
}

// ─── MOBILE SCREEN 1 — CHALLENGE OVERVIEW ────────────────────────────────────
function mobileChallengeOverview() {
  const trades = [
    { symbol: 'EURUSD', dir: 'BUY',  time: '09:32', lots: '0.50', pnl: '+$420' },
    { symbol: 'GBPUSD', dir: 'SELL', time: '10:14', lots: '0.25', pnl: '-$180' },
    { symbol: 'XAUUSD', dir: 'BUY',  time: '11:05', lots: '0.10', pnl: '+$310' },
    { symbol: 'NAS100', dir: 'SELL', time: '13:22', lots: '1.00', pnl: '+$640' },
  ];

  return F(0, 0, MW, MH, P.bg, [
    // Status bar
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('FORTIS', MW/2 - 28, 14, 56, 16, 9, P.sub, true, 'center', 1, 1.5),
    T('$50K CHALLENGE', MW - 108, 14, 92, 16, 8, P.dim, false, 'right', 1, 0.3),
    Ln(0, 43, MW, P.border),

    // Phase stepper
    F(16, 52, MW - 32, 32, 'transparent', [PhaseStepper(0, 0, MW - 32, 0)]),

    // Account value hero
    F(0, 96, MW, 88, P.panel2, [
      Ln(0, 0, MW, P.border),
      T('ACCOUNT BALANCE', 0, 12, MW, 12, 8, P.sub, false, 'center', 1, 0.8),
      T('$51,190.40', 0, 28, MW, 40, 32, P.neon, true, 'center'),
      T('+$1,190.40  (+2.38%)', 0, 70, MW, 16, 10, P.profit, false, 'center'),
      Ln(0, 87, MW, P.border),
    ]),

    // Risk gauges — 3 compact horizontal bars
    F(16, 196, MW - 32, 148, P.panel2, [
      T('CHALLENGE LIMITS', 0, 12, MW - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      // Profit target
      F(0, 32, MW - 32, 34, 'transparent', [
        T('PROFIT TARGET', 0, 0, 140, 12, 8, P.sub, false, 'left', 1, 0.5),
        T('$1,190 of $4,000', MW - 32 - 120, 0, 120, 12, 9, P.profit, true, 'right'),
        R(0, 18, MW - 32, 8, P.border, { r: 4 }),
        R(0, 18, Math.round((MW - 32) * 0.298), 8, P.profit, { r: 4 }),
        T('29.8%', Math.round((MW - 32) * 0.298) - 16, 28, 40, 10, 7, P.profit, true),
      ]),
      // Max drawdown
      F(0, 74, MW - 32, 34, 'transparent', [
        T('MAX DRAWDOWN', 0, 0, 140, 12, 8, P.sub, false, 'left', 1, 0.5),
        T('$810 of $5,000 limit', MW - 32 - 140, 0, 140, 12, 9, P.profit, true, 'right'),
        R(0, 18, MW - 32, 8, P.border, { r: 4 }),
        R(0, 18, Math.round((MW - 32) * 0.162), 8, P.profit, { r: 4 }),
        // Warn marker at 75%
        R(Math.round((MW - 32) * 0.75), 14, 2, 16, P.warn, { op: 0.7 }),
        T('16.2%', Math.round((MW - 32) * 0.162) - 12, 28, 40, 10, 7, P.profit, true),
      ]),
      // Daily loss
      F(0, 116, MW - 32, 34, 'transparent', [
        T('DAILY LOSS LIMIT', 0, 0, 140, 12, 8, P.sub, false, 'left', 1, 0.5),
        T('$350 of $2,500 limit', MW - 32 - 140, 0, 140, 12, 9, P.profit, true, 'right'),
        R(0, 18, MW - 32, 8, P.border, { r: 4 }),
        R(0, 18, Math.round((MW - 32) * 0.14), 8, P.profit, { r: 4 }),
        R(Math.round((MW - 32) * 0.75), 14, 2, 16, P.warn, { op: 0.7 }),
        T('14%', Math.round((MW - 32) * 0.14) - 8, 28, 36, 10, 7, P.profit, true),
      ]),
    ], { r: 8 }),

    // Stat row
    F(0, 360, MW, 60, P.panel, [
      Ln(0, 0, MW, P.border),
      ...[
        { l: 'TRADING DAYS', v: '6 / 4 min', c: P.profit },
        { l: 'WIN RATE',     v: '68%',       c: P.profit },
        { l: 'TODAY P&L',    v: '+$1,190',   c: P.profit },
      ].map(({ l, v, c }, i) => {
        const tw = MW / 3;
        return F(i * tw, 0, tw, 60, 'transparent', [
          T(l, 0, 10, tw, 12, 7, P.sub, false, 'center', 1, 0.5),
          T(v, 0, 26, tw, 20, 13, c, true, 'center'),
          i < 2 ? R(tw - 1, 14, 1, 32, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 59, MW, P.border),
    ]),

    // Today's trades header
    F(0, 420, MW, 28, P.panel, [
      T('TODAY\'S TRADES', 16, 8, 160, 14, 8, P.sub, true, 'left', 1, 0.8),
      T(`${trades.length} trades`, MW - 72, 8, 56, 14, 8, P.dim, false, 'right'),
      Ln(0, 27, MW, P.border),
    ]),

    // Trade list
    F(0, 448, MW, trades.length * 48, P.bg,
      trades.map((tr, i) => TradeRow(0, i * 48, MW, 46, tr))
    ),

    // Bottom nav
    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['◎ Overview', '↑ Trades', '≈ Analytics', '⚙ Rules'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 0;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.neon : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.neon, { r: 1 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── MOBILE SCREEN 2 — LIVE SESSION ──────────────────────────────────────────
function mobileLiveSession() {
  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('LIVE SESSION', MW/2 - 52, 14, 104, 16, 9, P.text, true, 'center', 1, 0.8),
    E(MW - 28, 19, 8, 8, P.loss),
    T('LIVE', MW - 52, 15, 30, 14, 7, P.loss, true, 'right', 1, 0.8),
    Ln(0, 43, MW, P.border),

    // Live P&L hero
    F(0, 44, MW, 120, P.panel2, [
      Ln(0, 0, MW, P.border),
      T('SESSION P&L', 0, 16, MW, 12, 8, P.sub, false, 'center', 1, 0.8),
      T('+$1,190.40', 0, 36, MW, 52, 42, P.profit, true, 'center'),
      // Spark line simulation
      F(40, 96, MW - 80, 12, 'transparent', [
        ...[0.2, 0.35, 0.28, 0.45, 0.4, 0.6, 0.55, 0.72, 0.65, 0.80, 0.75, 0.90].map((h, i) =>
          R(i * ((MW - 80) / 12), 12 - Math.round(h * 12), Math.round((MW - 80) / 12) - 2, Math.round(h * 12), P.profit, { op: 0.3 + h * 0.4 })
        ),
      ]),
      Ln(0, 119, MW, P.border),
    ]),

    // Risk meters — compact gauges
    T('LIVE RISK METERS', 16, 176, MW - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
    F(0, 196, MW, 140, P.panel, [
      Ln(0, 0, MW, P.border),
      // Three gauge circles
      ...[
        { label: 'PROFIT', val: '29.8%', pct: 0.298, type: 'profit', cx: Math.round(MW / 6) },
        { label: 'DRAWDOWN', val: '16.2%', pct: 0.162, type: 'risk', cx: Math.round(MW / 2) },
        { label: 'DAILY LOSS', val: '14.0%', pct: 0.140, type: 'risk', cx: Math.round(MW * 5 / 6) },
      ].map(({ label, val, pct, type, cx }) => {
        const col = type === 'profit' ? P.blue : P.profit;
        const r   = 44;
        return F(cx - r, 12, r * 2, r * 2 + 20, 'transparent', [
          E(0, 0, r * 2, r * 2, P.border, 0.4),
          E(0, 0, r * 2, r * 2, col, pct * 0.8),
          E(r - 28, r - 28, 56, 56, P.panel),
          T(val, 0, r - 10, r * 2, 20, 12, col, true, 'center'),
          T(label, 0, r * 2 + 4, r * 2, 12, 7, P.sub, false, 'center', 1, 0.5),
        ]);
      }),
      Ln(0, 139, MW, P.border),
    ]),

    // Open positions
    T('OPEN POSITIONS', 16, 348, 140, 14, 8, P.sub, true, 'left', 1, 0.8),
    F(MW - 72, 344, 60, 16, P.panel3, [
      R(0, 0, 60, 16, P.loss, { op: 0.15, r: 3 }),
      T('2 OPEN', 0, 3, 60, 10, 7, P.loss, true, 'center'),
    ], { r: 3 }),

    F(0, 368, MW, 200, P.bg, [
      ...[
        { sym: 'EURUSD', dir: 'BUY',  lots: '0.50', open: '1.08420', curr: '1.08641', pnl: '+$221', col: P.profit },
        { sym: 'XAUUSD', dir: 'BUY',  lots: '0.10', open: '2312.40', curr: '2315.80', pnl: '+$34',  col: P.profit },
      ].map(({ sym, dir, lots, open, curr, pnl, col }, i) =>
        F(0, i * 88, MW, 84, P.panel, [
          R(0, 0, 3, 84, col),
          T(sym, 12, 10, 80, 18, 14, P.text, true),
          T(dir, 12, 32, 36, 14, 9, col, true),
          T(`${lots} lots`, 52, 32, 60, 14, 9, P.sub),
          T('Open', MW - 160, 10, 60, 12, 8, P.dim),
          T(open, MW - 96, 10, 80, 14, 10, P.sub, false, 'right'),
          T('Current', MW - 160, 28, 60, 12, 8, P.dim),
          T(curr, MW - 96, 28, 80, 14, 10, P.text, true, 'right'),
          PnLChip(MW - 80, 52, pnl, true),
          F(12, 56, 80, 22, P.lossBg, [
            R(0, 0, 80, 22, P.loss, { op: 0.15, r: 4 }),
            T('Close', 0, 5, 80, 12, 9, P.loss, true, 'center'),
          ], { r: 4 }),
          Ln(0, 83, MW, P.border),
        ])
      ),
    ]),

    // Danger zone alert — approaching daily loss
    F(0, MH - 116, MW, 60, P.warnBg, [
      R(0, 0, MW, 60, P.warn, { op: 0.08 }),
      Ln(0, 0, MW, P.warn, 0.4),
      E(16, 24, 10, 10, P.warn),
      T('CAUTION — APPROACHING DAILY LIMIT', 34, 8, MW - 50, 14, 8, P.warn, true, 'left', 1, 0.6),
      T('$350 used of $2,500 daily limit. Stop trading if loss reaches $1,875.', 16, 26, MW - 32, 28, 9, P.sub),
    ]),

    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['◎ Overview', '↑ Trades', '≈ Analytics', '⚙ Rules'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 1;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.neon : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.neon, { r: 1 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── MOBILE SCREEN 3 — TRADE JOURNAL ─────────────────────────────────────────
function mobileTradeJournal() {
  const trades = [
    { symbol: 'EURUSD', dir: 'BUY',  time: '09:32–09:58', lots: '0.50', pnl: '+$420', rr: '2.1R' },
    { symbol: 'GBPUSD', dir: 'SELL', time: '10:14–10:31', lots: '0.25', pnl: '-$180', rr: '-0.9R' },
    { symbol: 'XAUUSD', dir: 'BUY',  time: '11:05–12:20', lots: '0.10', pnl: '+$310', rr: '1.6R' },
    { symbol: 'NAS100', dir: 'SELL', time: '13:22–14:05', lots: '1.00', pnl: '+$640', rr: '3.2R' },
    { symbol: 'EURUSD', dir: 'SELL', time: '14:40–15:02', lots: '0.50', pnl: '-$95',  rr: '-0.5R' },
    { symbol: 'GBPJPY', dir: 'BUY',  time: '15:15–15:44', lots: '0.30', pnl: '+$95',  rr: '0.5R' },
  ];

  const pnlTotal = '+$1,190';
  const wins     = trades.filter(t => t.pnl.startsWith('+')).length;

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('Trade Journal', MW/2 - 56, 14, 112, 16, 11, P.text, true, 'center'),
    Ln(0, 43, MW, P.border),

    // Stat summary strip
    F(0, 44, MW, 60, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...[
        { l: 'NET P&L',    v: pnlTotal, c: P.profit },
        { l: 'WIN RATE',   v: `${wins}/${trades.length}`, c: P.profit },
        { l: 'AVG R:R',    v: '1.67R',  c: P.blue   },
        { l: 'TRADES',     v: `${trades.length}`,   c: P.text   },
      ].map(({ l, v, c }, i) => {
        const tw = MW / 4;
        return F(i * tw, 0, tw, 60, 'transparent', [
          T(l, 0, 8, tw, 12, 7, P.sub, false, 'center', 1, 0.5),
          T(v, 0, 24, tw, 22, 14, c, true, 'center'),
          i < 3 ? R(tw - 1, 10, 1, 40, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 59, MW, P.border),
    ]),

    // Date selector
    F(0, 104, MW, 36, P.panel, [
      T('← Mar 15', 16, 10, 80, 16, 9, P.sub),
      T('Today — Mar 16, 2026', 0, 10, MW, 16, 10, P.text, true, 'center'),
      T('Mar 17 →', MW - 72, 10, 60, 16, 9, P.dim, false, 'right'),
      Ln(0, 35, MW, P.border),
    ]),

    // Trade list
    F(0, 140, MW, MH - 140 - 56, P.bg,
      trades.map((tr, i) => {
        const pos = tr.pnl.startsWith('+');
        const col = pos ? P.profit : P.loss;
        return F(0, i * 68, MW, 64, P.panel, [
          R(0, 0, 3, 64, col),
          T(tr.symbol, 12, 10, 70, 18, 13, P.text, true),
          T(tr.dir, 12, 32, 36, 14, 9, col, true),
          T(tr.lots + ' lots', 52, 32, 60, 14, 9, P.sub),
          T(tr.time, 120, 10, MW - 200, 14, 9, P.sub),
          PnLChip(MW - 80, 10, tr.pnl, pos),
          T(tr.rr, MW - 80, 34, 64, 14, 9, pos ? P.profit : P.loss, true, 'right'),
          Ln(0, 63, MW, P.border),
        ]);
      })
    ),

    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['◎ Overview', '↑ Trades', '≈ Analytics', '⚙ Rules'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 1;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.neon : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.neon, { r: 1 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── MOBILE SCREEN 4 — RULES & COMPLIANCE ────────────────────────────────────
function mobileRules() {
  const rules = [
    { name: 'Profit Target',     req: '$4,000 (8%)',  curr: '$1,190 (2.38%)', status: 'active',  col: P.blue   },
    { name: 'Max Drawdown',      req: 'Max $5,000',   curr: '$810 used',      status: 'pass',    col: P.profit },
    { name: 'Daily Loss Limit',  req: 'Max $2,500',   curr: '$350 today',     status: 'pass',    col: P.profit },
    { name: 'Min Trading Days',  req: '4 days',       curr: '6 days',         status: 'pass',    col: P.profit },
    { name: 'Weekend Positions', req: 'Not allowed',  curr: 'No open positions at close', status: 'pass', col: P.profit },
    { name: 'Consistency Rule',  req: 'No day > 30%', curr: 'Best day: 22%',  status: 'pass',    col: P.profit },
  ];

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('Rules & Compliance', MW/2 - 72, 14, 144, 16, 11, P.text, true, 'center'),
    Ln(0, 43, MW, P.border),

    // Overall status
    F(0, 44, MW, 64, P.profBg, [
      R(0, 0, MW, 64, P.profit, { op: 0.08 }),
      Ln(0, 0, MW, P.profit, 0.3),
      E(20, 26, 14, 14, P.profit),
      T('ALL RULES COMPLIANT', 44, 12, MW - 60, 16, 10, P.profit, true),
      T('Phase 1 · Day 6 of challenge · On track to pass', 44, 30, MW - 60, 28, 9, P.sub),
      Ln(0, 63, MW, P.border),
    ]),

    // Rule cards
    F(0, 108, MW, rules.length * 72, P.bg,
      rules.map(({ name, req, curr, status, col }, i) => {
        const statusLabel = status === 'pass' ? 'PASS' : status === 'active' ? 'IN PROGRESS' : 'FAIL';
        const statusCol   = status === 'pass' ? P.profit : status === 'active' ? P.blue : P.loss;
        return F(0, i * 72, MW, 68, P.panel, [
          R(0, 0, 3, 68, statusCol),
          T(name, 12, 8, MW - 100, 16, 11, P.text, true),
          F(MW - 100, 10, 88, 18, 'transparent', [
            R(0, 0, 88, 18, statusCol, { op: 0.15, r: 4 }),
            T(statusLabel, 0, 3, 88, 12, 7, statusCol, true, 'center', 1, 0.6),
          ], { r: 4 }),
          T(`Required: ${req}`, 12, 28, MW - 24, 14, 9, P.sub),
          T(`Current: ${curr}`, 12, 44, MW - 24, 14, 9, col, true),
          Ln(0, 67, MW, P.border),
        ]);
      })
    ),

    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['◎ Overview', '↑ Trades', '≈ Analytics', '⚙ Rules'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 3;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.neon : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.neon, { r: 1 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── MOBILE SCREEN 5 — PERFORMANCE ANALYTICS ─────────────────────────────────
function mobileAnalytics() {
  // Calendar heatmap — 5 weeks × 5 days (Mon–Fri)
  const calData = [
    [0, 180, -95, 240, 420],
    [-180, 310, 640, -95, 95],
    [280, -140, 520, 190, -60],
    [0, 0, 0, 0, 0],   // future
    [0, 0, 0, 0, 0],
  ];
  const dayLabels = ['M', 'T', 'W', 'T', 'F'];
  const calW = MW - 32;
  const cellW = Math.floor(calW / 5) - 4;
  const cellH = 28;

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('Analytics', MW/2 - 44, 14, 88, 16, 11, P.text, true, 'center'),
    Ln(0, 43, MW, P.border),

    // Stats strip
    F(0, 44, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...[
        { l: 'PROFIT FACTOR', v: '2.34',  c: P.profit },
        { l: 'BEST DAY',      v: '+$640', c: P.profit },
        { l: 'WORST DAY',     v: '-$180', c: P.loss   },
      ].map(({ l, v, c }, i) => {
        const tw = MW / 3;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(l, 0, 8, tw, 12, 7, P.sub, false, 'center', 1, 0.5),
          T(v, 0, 24, tw, 22, 14, c, true, 'center'),
          i < 2 ? R(tw - 1, 10, 1, 40, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 55, MW, P.border),
    ]),

    // P&L calendar heatmap
    T('P&L CALENDAR — MARCH 2026', 16, 112, MW - 32, 12, 8, P.sub, true, 'left', 1, 0.8),

    // Day labels
    F(16, 130, calW, 16, 'transparent',
      dayLabels.map((d, i) =>
        T(d, i * (cellW + 4), 0, cellW, 14, 8, P.dim, false, 'center')
      )
    ),

    // Calendar cells
    F(16, 148, calW, 5 * (cellH + 4), 'transparent',
      calData.flatMap((week, wi) =>
        week.map((val, di) => {
          const col = val > 200 ? P.profit : val > 0 ? P.blue : val < -100 ? P.loss : val < 0 ? P.warn : P.border;
          const op  = val === 0 ? 0.2 : Math.min(Math.abs(val) / 700 + 0.3, 0.9);
          return R(di * (cellW + 4), wi * (cellH + 4), cellW, cellH, col, { op, r: 3 });
        })
      )
    ),

    // Win/loss breakdown
    T('WIN / LOSS BREAKDOWN', 16, 340, MW - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
    F(16, 360, MW - 32, 80, P.panel2, [
      T('Winning trades', 16, 14, 160, 16, 11, P.text),
      T('14  (68%)', MW - 80, 14, 64, 16, 11, P.profit, true, 'right'),
      T('Losing trades', 16, 36, 160, 16, 11, P.text),
      T('7  (32%)', MW - 80, 36, 64, 16, 11, P.loss, true, 'right'),
      // Win rate bar
      R(16, 58, MW - 64, 12, P.border, { r: 4 }),
      R(16, 58, Math.round((MW - 64) * 0.68), 12, P.profit, { r: 4 }),
    ], { r: 6 }),

    // Avg win / avg loss
    F(16, 456, MW - 32, 60, P.panel2, [
      T('Avg win', 16, 14, 100, 16, 11, P.text),
      T('+$312', MW - 80, 14, 64, 16, 13, P.profit, true, 'right'),
      T('Avg loss', 16, 36, 100, 16, 11, P.text),
      T('-$123', MW - 80, 36, 64, 16, 13, P.loss, true, 'right'),
    ], { r: 6 }),

    // Equity curve (simulated bar chart)
    T('EQUITY CURVE', 16, 532, MW - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
    F(16, 552, MW - 32, 80, P.panel2, [
      ...[50, 46, 50.8, 51.5, 49.8, 51.2, 50.4, 52.1, 51.8, 53.0, 52.2, 51.19].map((v, i) => {
        const base = 48;
        const h    = Math.round((v - base) / 6 * 60 + 10);
        const barW2 = Math.floor((MW - 64) / 12) - 2;
        return R(i * (barW2 + 2), 70 - h, barW2, h, v > 50 ? P.profit : P.loss, { op: 0.6, r: 1 });
      }),
    ], { r: 4 }),

    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['◎ Overview', '↑ Trades', '≈ Analytics', '⚙ Rules'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 2;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.neon : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.neon, { r: 1 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 1 — CHALLENGE DASHBOARD ──────────────────────────────────
function desktopChallengeDashboard() {
  const SIDE = 300;
  const trades = [
    { symbol: 'EURUSD', dir: 'BUY',  time: '09:32', lots: '0.50', pnl: '+$420', rr: '2.1R' },
    { symbol: 'GBPUSD', dir: 'SELL', time: '10:14', lots: '0.25', pnl: '-$180', rr: '-0.9R'},
    { symbol: 'XAUUSD', dir: 'BUY',  time: '11:05', lots: '0.10', pnl: '+$310', rr: '1.6R' },
    { symbol: 'NAS100', dir: 'SELL', time: '13:22', lots: '1.00', pnl: '+$640', rr: '3.2R' },
    { symbol: 'EURUSD', dir: 'SELL', time: '14:40', lots: '0.50', pnl: '-$95',  rr: '-0.5R'},
    { symbol: 'GBPJPY', dir: 'BUY',  time: '15:15', lots: '0.30', pnl: '+$95',  rr: '0.5R' },
  ];
  const ROW_H = 40;

  return F(0, 0, PW, PH, P.bg, [
    // Top nav
    F(0, 0, PW, 40, P.panel, [
      T('FORTIS', 24, 12, 60, 16, 10, P.neon, true, 'left', 1, 1.5),
      T('Funded Trader Platform', 92, 14, 200, 14, 9, P.sub),
      ...['Dashboard', 'Instruments', 'Journal', 'Analytics', 'Accounts'].map((tab, i) =>
        F(PW - 500 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 0 ? P.text : P.sub, i === 0, 'center'),
          i === 0 ? R(30, 37, 40, 2, P.neon, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Left sidebar — account info + phase stepper
    F(0, 40, SIDE, PH - 40, P.panel, [
      // Account selector
      F(16, 16, SIDE - 32, 56, P.panel2, [
        T('$50K CHALLENGE', 12, 8, 160, 14, 9, P.sub, true, 'left', 1, 0.6),
        T('Phase 1  ·  Day 6', 12, 24, 200, 18, 11, P.text, true),
        F(SIDE - 72, 18, 48, 20, P.profBg, [
          R(0, 0, 48, 20, P.profit, { op: 0.2, r: 4 }),
          T('ACTIVE', 0, 4, 48, 12, 7, P.profit, true, 'center', 1, 0.6),
        ], { r: 4 }),
      ], { r: 6 }),

      // Phase stepper vertical
      T('CHALLENGE PROGRESS', 16, 88, SIDE - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      F(16, 108, SIDE - 32, 120, P.panel2, [
        // Phase 1 — active
        F(0, 0, SIDE - 32, 36, P.panel3, [
          R(0, 0, 3, 36, P.neon),
          T('PHASE 1', 12, 6, 80, 12, 8, P.neon, true, 'left', 1, 0.6),
          T('IN PROGRESS', SIDE - 100, 6, 84, 12, 7, P.blue, true, 'right'),
          T('Profit: $1,190 / $4,000', 12, 20, 200, 14, 9, P.text),
        ], { r: 4 }),
        // Phase 2 — locked
        F(0, 42, SIDE - 32, 36, P.panel, [
          R(0, 0, 3, 36, P.border),
          T('PHASE 2', 12, 6, 80, 12, 8, P.dim, true, 'left', 1, 0.6),
          T('LOCKED', SIDE - 100, 6, 84, 12, 7, P.dim, false, 'right'),
          T('Target: $2,500 (5%)', 12, 20, 200, 14, 9, P.dim),
        ], { r: 4 }),
        // Funded — locked
        F(0, 84, SIDE - 32, 36, P.panel, [
          R(0, 0, 3, 36, P.border),
          T('FUNDED', 12, 6, 80, 12, 8, P.dim, true, 'left', 1, 0.6),
          T('LOCKED', SIDE - 100, 6, 84, 12, 7, P.dim, false, 'right'),
          T('80% profit share', 12, 20, 200, 14, 9, P.dim),
        ], { r: 4 }),
      ], { r: 6 }),

      // Account balance
      T('ACCOUNT BALANCE', 16, 244, SIDE - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      F(16, 262, SIDE - 32, 64, P.panel2, [
        T('$51,190.40', 0, 10, SIDE - 32, 32, 26, P.neon, true, 'center'),
        T('+$1,190.40  (+2.38%)', 0, 44, SIDE - 32, 16, 9, P.profit, false, 'center'),
      ], { r: 6 }),

      // Risk limits
      T('CHALLENGE LIMITS', 16, 344, SIDE - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      ...[
        { l: 'Profit Target',    v: '$1,190 / $4,000', pct: 0.298, col: P.blue   },
        { l: 'Max Drawdown',     v: '$810 / $5,000',   pct: 0.162, col: P.profit },
        { l: 'Daily Loss',       v: '$350 / $2,500',   pct: 0.140, col: P.profit },
      ].map(({ l, v, pct, col }, i) =>
        F(16, 364 + i * 60, SIDE - 32, 52, P.panel2, [
          T(l, 12, 8, SIDE - 80, 14, 9, P.sub),
          T(v, 12, 24, SIDE - 56, 16, 10, col, true),
          R(12, 42, SIDE - 56, 5, P.border, { r: 3 }),
          R(12, 42, Math.round((SIDE - 56) * pct), 5, col, { r: 3 }),
        ], { r: 4 })
      ),

      // Quick stats
      T('TODAY\'S PERFORMANCE', 16, 548, SIDE - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      F(16, 566, SIDE - 32, 100, P.panel2, [
        ...[
          { l: 'Trades',      v: '6'      },
          { l: 'Win rate',    v: '68%'    },
          { l: 'Avg win',     v: '+$312'  },
          { l: 'Avg loss',    v: '-$123'  },
          { l: 'Profit factor', v: '2.34' },
        ].map(({ l, v }, i) =>
          F(0, i * 18, SIDE - 32, 16, 'transparent', [
            T(l, 12, 2, 140, 12, 9, P.sub),
            T(v, SIDE - 80, 2, 64, 12, 10, P.text, true, 'right'),
          ])
        ),
      ], { r: 4 }),

      Ln(SIDE - 1, 0, 1, PH - 40, P.border),
    ]),

    // Main area — gauges + trade table
    F(SIDE, 40, PW - SIDE, PH - 40, P.bg, [

      // Three large risk gauges
      F(0, 0, PW - SIDE, 240, P.panel2, [
        Ln(0, 0, PW - SIDE, P.border),
        T('RISK INSTRUMENTS — LIVE', 32, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        E(300, 20, 7, 7, P.loss),
        T('LIVE', 314, 17, 36, 12, 7, P.loss, true),

        // Gauge 1 — Profit Target
        ...((() => {
          const cx = 140, cy = 140, r = 80, pct = 0.298;
          return [
            E(cx - r, cy - r, r*2, r*2, P.border, 0.35),
            E(cx - r, cy - r, r*2, r*2, P.blue, pct * 0.75),
            E(cx - 52, cy - 52, 104, 104, P.panel2),
            T('29.8%', cx - r, cy - 14, r*2, 26, 20, P.blue, true, 'center'),
            T('PROFIT TARGET', cx - r, cy + 16, r*2, 12, 7, P.sub, false, 'center', 1, 0.6),
            T('$1,190 of $4,000', cx - 70, cy + 32, 140, 12, 8, P.dim, false, 'center'),
          ];
        })()),

        // Gauge 2 — Max Drawdown
        ...((() => {
          const cx = Math.round((PW - SIDE) / 2), cy = 140, r = 80, pct = 0.162;
          return [
            E(cx - r, cy - r, r*2, r*2, P.border, 0.35),
            E(cx - r, cy - r, r*2, r*2, P.profit, pct * 0.75),
            E(cx - 52, cy - 52, 104, 104, P.panel2),
            T('16.2%', cx - r, cy - 14, r*2, 26, 20, P.profit, true, 'center'),
            T('MAX DRAWDOWN', cx - r, cy + 16, r*2, 12, 7, P.sub, false, 'center', 1, 0.6),
            T('$810 used of $5,000', cx - 70, cy + 32, 140, 12, 8, P.dim, false, 'center'),
          ];
        })()),

        // Gauge 3 — Daily Loss
        ...((() => {
          const cx = PW - SIDE - 140, cy = 140, r = 80, pct = 0.14;
          return [
            E(cx - r, cy - r, r*2, r*2, P.border, 0.35),
            E(cx - r, cy - r, r*2, r*2, P.profit, pct * 0.75),
            E(cx - 52, cy - 52, 104, 104, P.panel2),
            T('14.0%', cx - r, cy - 14, r*2, 26, 20, P.profit, true, 'center'),
            T('DAILY LOSS LIMIT', cx - r, cy + 16, r*2, 12, 7, P.sub, false, 'center', 1, 0.6),
            T('$350 used of $2,500', cx - 70, cy + 32, 140, 12, 8, P.dim, false, 'center'),
          ];
        })()),

        Ln(0, 239, PW - SIDE, P.border),
      ]),

      // Trade journal table
      F(0, 240, PW - SIDE, 36, P.panel, [
        T('TODAY\'S TRADES', 24, 11, 200, 14, 8, P.sub, true, 'left', 1, 0.8),
        T('6 trades  ·  Net +$1,190', 220, 11, 260, 14, 9, P.profit),
        Ln(0, 35, PW - SIDE, P.border),
      ]),

      // Table header
      F(0, 276, PW - SIDE, 28, P.panel2, [
        T('SYMBOL', 24, 8, 80, 12, 7, P.dim, true, 'left', 1, 0.8),
        T('DIR', 110, 8, 40, 12, 7, P.dim, true, 'left', 1, 0.8),
        T('TIME', 160, 8, 80, 12, 7, P.dim, true, 'left', 1, 0.8),
        T('LOTS', 250, 8, 60, 12, 7, P.dim, true, 'left', 1, 0.8),
        T('R:R', 320, 8, 60, 12, 7, P.dim, true, 'left', 1, 0.8),
        T('P&L', PW - SIDE - 100, 8, 80, 12, 7, P.dim, true, 'right', 1, 0.8),
        Ln(0, 27, PW - SIDE, P.border),
      ]),

      // Trade rows
      F(0, 304, PW - SIDE, trades.length * (ROW_H + 1), P.bg,
        trades.map(({ symbol, dir, time, lots, pnl, rr }, i) => {
          const pos = pnl.startsWith('+');
          const col = pos ? P.profit : P.loss;
          return F(0, i * (ROW_H + 1), PW - SIDE, ROW_H, P.panel, [
            R(0, 0, 3, ROW_H, col),
            T(symbol, 24, Math.round((ROW_H-14)/2), 80, 14, 11, P.text, true),
            T(dir, 110, Math.round((ROW_H-12)/2), 40, 12, 9, col, true),
            T(time, 160, Math.round((ROW_H-12)/2), 80, 12, 10, P.sub),
            T(lots, 250, Math.round((ROW_H-12)/2), 60, 12, 10, P.sub),
            T(rr, 320, Math.round((ROW_H-12)/2), 60, 12, 10, pos ? P.profit : P.loss),
            PnLChip(PW - SIDE - 96, Math.round((ROW_H-22)/2), pnl, pos),
            Ln(0, ROW_H - 1, PW - SIDE, P.border),
          ]);
        })
      ),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 2 — INSTRUMENT CLUSTER (Risk Panel) ──────────────────────
// Inspired by car dashboard + Bloomberg terminal — completely different skeleton
function desktopInstrumentCluster() {
  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 40, P.panel, [
      T('FORTIS', 24, 12, 60, 16, 10, P.neon, true, 'left', 1, 1.5),
      T('Risk Instruments', 92, 14, 160, 14, 9, P.sub),
      ...['Dashboard', 'Instruments', 'Journal', 'Analytics', 'Accounts'].map((tab, i) =>
        F(PW - 500 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 1 ? P.text : P.sub, i === 1, 'center'),
          i === 1 ? R(30, 37, 40, 2, P.neon, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Account strip
    F(0, 40, PW, 52, P.panel2, [
      Ln(0, 0, PW, P.border),
      ...[
        { l: 'ACCOUNT',      v: '$50K Phase 1',     c: P.text   },
        { l: 'BALANCE',      v: '$51,190.40',       c: P.neon   },
        { l: 'TODAY P&L',    v: '+$1,190 (+2.38%)', c: P.profit },
        { l: 'TRADING DAYS', v: '6 / 4 required',  c: P.profit },
        { l: 'STATUS',       v: 'ON TRACK',         c: P.profit },
      ].map(({ l, v, c }, i) => {
        const tw = PW / 5;
        return F(i * tw, 0, tw, 52, 'transparent', [
          T(l, 16, 8, tw - 32, 12, 7, P.sub, false, 'left', 1, 0.6),
          T(v, 16, 24, tw - 32, 20, 13, c, true),
          i < 4 ? R(tw - 1, 8, 1, 36, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 51, PW, P.border),
    ]),

    // Three giant gauges — instrument cluster layout
    F(0, 92, PW, PH - 92, P.bg, [

      // LEFT: Profit Target gauge (large)
      F(0, 0, Math.round(PW / 3), PH - 92, P.panel, [
        Ln(Math.round(PW/3) - 1, 0, 1, PH - 92, P.border),
        T('PROFIT TARGET', 0, 32, Math.round(PW/3), 14, 9, P.sub, false, 'center', 1, 1.2),
        ...((() => {
          const cx = Math.round(PW / 6), cy = 320, r = 160;
          const pct = 0.298;
          return [
            E(cx - r, cy - r, r*2, r*2, P.border, 0.25),
            E(cx - r, cy - r, r*2, r*2, P.blue, pct * 0.7),
            E(cx - r + 40, cy - r + 40, (r-40)*2, (r-40)*2, P.panel),
            T('29.8%', cx - r, cy - 22, r*2, 44, 38, P.blue, true, 'center'),
            T('OF TARGET', cx - r, cy + 24, r*2, 16, 9, P.sub, false, 'center', 1, 0.8),
          ];
        })()),
        // Metric detail
        F(40, 500, Math.round(PW/3) - 80, 100, P.panel2, [
          ...[
            { l: 'Current profit',  v: '+$1,190.40'   },
            { l: 'Target required', v: '+$4,000.00'   },
            { l: 'Remaining',       v: '$2,809.60'    },
            { l: 'Phase deadline',  v: 'No time limit'},
          ].map(({ l, v }, i) =>
            F(0, i * 22, Math.round(PW/3) - 80, 20, 'transparent', [
              T(l, 16, 3, 180, 14, 9, P.sub),
              T(v, 180, 3, Math.round(PW/3) - 80 - 200, 14, 10, P.text, true, 'right'),
            ])
          ),
        ], { r: 6 }),
      ]),

      // CENTER: Max Drawdown gauge (largest — primary risk)
      F(Math.round(PW/3), 0, Math.round(PW/3), PH - 92, P.panel2, [
        Ln(Math.round(PW/3) - 1, 0, 1, PH - 92, P.border),
        T('MAX DRAWDOWN', 0, 32, Math.round(PW/3), 14, 9, P.warn, false, 'center', 1, 1.2),
        T('BINARY RULE — BREACH = INSTANT TERMINATION', 0, 50, Math.round(PW/3), 12, 7, P.dim, false, 'center', 1, 0.5),
        ...((() => {
          const cx = Math.round(PW / 2) - Math.round(PW/3), cy = 330, r = 180;
          const pct = 0.162;
          return [
            E(cx - r, cy - r, r*2, r*2, P.border, 0.3),
            E(cx - r, cy - r, r*2, r*2, P.profit, pct * 0.65),
            E(cx - r + 48, cy - r + 48, (r-48)*2, (r-48)*2, P.panel2),
            T('SAFE', cx - r, cy - 38, r*2, 28, 14, P.profit, true, 'center', 1, 1.5),
            T('16.2%', cx - r, cy - 14, r*2, 52, 44, P.profit, true, 'center'),
            T('OF LIMIT USED', cx - r, cy + 40, r*2, 16, 9, P.sub, false, 'center', 1, 0.8),
          ];
        })()),
        // Warn zone indicator
        F(40, 540, Math.round(PW/3) - 80, 48, P.panel, [
          R(0, 0, Math.round(PW/3) - 80, 48, P.profit, { op: 0.06, r: 4 }),
          T('Drawdown from HWM: $810', 16, 8, Math.round(PW/3) - 96, 16, 10, P.profit, true),
          T('Breach at $5,000 — currently $4,190 safe buffer', 16, 26, Math.round(PW/3) - 96, 14, 9, P.sub),
        ], { r: 4 }),
        F(40, 600, Math.round(PW/3) - 80, 80, P.panel2, [
          ...[
            { l: 'Max allowed drawdown', v: '$5,000 (10%)'  },
            { l: 'Current drawdown',     v: '$810 (1.62%)'  },
            { l: 'HWM (highest balance)',v: '$52,000.40'     },
            { l: 'Safe buffer remaining',v: '$4,190.00'      },
          ].map(({ l, v }, i) =>
            F(0, i * 19, Math.round(PW/3) - 80, 18, 'transparent', [
              T(l, 16, 2, 200, 14, 9, P.sub),
              T(v, 200, 2, Math.round(PW/3) - 80 - 220, 14, 10, P.text, true, 'right'),
            ])
          ),
        ], { r: 4 }),
      ]),

      // RIGHT: Daily Loss gauge
      F(Math.round(PW * 2/3), 0, PW - Math.round(PW * 2/3), PH - 92, P.panel, [
        T('DAILY LOSS LIMIT', 0, 32, PW - Math.round(PW*2/3), 14, 9, P.sub, false, 'center', 1, 1.2),
        T('RESETS AT MIDNIGHT', 0, 50, PW - Math.round(PW*2/3), 12, 7, P.dim, false, 'center', 1, 0.5),
        ...((() => {
          const panelW = PW - Math.round(PW*2/3);
          const cx = Math.round(panelW / 2), cy = 320, r = 160;
          const pct = 0.14;
          return [
            E(cx - r, cy - r, r*2, r*2, P.border, 0.25),
            E(cx - r, cy - r, r*2, r*2, P.profit, pct * 0.7),
            E(cx - r + 40, cy - r + 40, (r-40)*2, (r-40)*2, P.panel),
            T('14.0%', cx - r, cy - 22, r*2, 44, 38, P.profit, true, 'center'),
            T('OF LIMIT USED', cx - r, cy + 24, r*2, 16, 9, P.sub, false, 'center', 1, 0.8),
          ];
        })()),
        F(40, 500, PW - Math.round(PW*2/3) - 80, 100, P.panel2, [
          ...[
            { l: 'Daily limit',      v: '$2,500 (5%)'  },
            { l: 'Used today',       v: '$350 (0.70%)' },
            { l: 'Remaining today',  v: '$2,150'       },
            { l: 'Resets in',        v: '6h 18m'       },
          ].map(({ l, v }, i) =>
            F(0, i * 22, PW - Math.round(PW*2/3) - 80, 20, 'transparent', [
              T(l, 16, 3, 160, 14, 9, P.sub),
              T(v, 160, 3, PW - Math.round(PW*2/3) - 80 - 180, 14, 10, P.text, true, 'right'),
            ])
          ),
        ], { r: 6 }),
        // Caution zones legend
        F(40, 620, PW - Math.round(PW*2/3) - 80, 80, P.panel2, [
          T('CAUTION ZONES', 16, 10, 200, 12, 7, P.sub, true, 'left', 1, 0.8),
          ...[
            { col: P.profit, label: '0–50%  Safe zone'      },
            { col: P.blue,   label: '50–75% Monitor zone'   },
            { col: P.warn,   label: '75–90% Caution zone'   },
            { col: P.loss,   label: '90%+   Stop trading'   },
          ].map(({ col, label }, i) =>
            F(16, 28 + i * 12, PW - Math.round(PW*2/3) - 112, 10, 'transparent', [
              R(0, 2, 8, 8, col, { r: 2 }),
              T(label, 14, 0, 200, 10, 8, P.sub),
            ])
          ),
        ], { r: 4 }),
      ]),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 3 — TRADE JOURNAL ────────────────────────────────────────
function desktopJournal() {
  const allTrades = [
    { date: 'Mar 16', sym: 'EURUSD', dir: 'BUY',  entry: '1.08420', exit: '1.08641', lots: '0.50', duration: '26m', pnl: '+$420', rr: '2.1R',  note: 'Clean breakout above Asian session high' },
    { date: 'Mar 16', sym: 'GBPUSD', dir: 'SELL', entry: '1.27340', exit: '1.27196', lots: '0.25', duration: '17m', pnl: '-$180', rr: '-0.9R', note: 'Stopped out — news spike, premature entry' },
    { date: 'Mar 16', sym: 'XAUUSD', dir: 'BUY',  entry: '2312.40', exit: '2315.80', lots: '0.10', duration: '75m', pnl: '+$310', rr: '1.6R',  note: 'Gold breakout, held through retracement' },
    { date: 'Mar 16', sym: 'NAS100', dir: 'SELL', entry: '18240',   exit: '18176',   lots: '1.00', duration: '43m', pnl: '+$640', rr: '3.2R',  note: 'Best trade of the day — strong momentum' },
    { date: 'Mar 15', sym: 'EURUSD', dir: 'BUY',  entry: '1.08210', exit: '1.08390', lots: '0.50', duration: '34m', pnl: '+$280', rr: '1.4R',  note: 'London open continuation' },
    { date: 'Mar 15', sym: 'GBPJPY', dir: 'SELL', entry: '192.340', exit: '191.980', lots: '0.30', duration: '52m', pnl: '+$480', rr: '2.4R',  note: 'Perfect setup — textbook RSI divergence' },
    { date: 'Mar 14', sym: 'XAUUSD', dir: 'SELL', entry: '2295.10', exit: '2297.80', lots: '0.15', duration: '28m', pnl: '-$220', rr: '-1.1R', note: 'Faded the move too early, countertrend risk' },
  ];
  const ROW_H = 44;

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 40, P.panel, [
      T('FORTIS', 24, 12, 60, 16, 10, P.neon, true, 'left', 1, 1.5),
      T('Trade Journal', 92, 14, 140, 14, 9, P.sub),
      ...['Dashboard', 'Instruments', 'Journal', 'Analytics', 'Accounts'].map((tab, i) =>
        F(PW - 500 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 2 ? P.text : P.sub, i === 2, 'center'),
          i === 2 ? R(30, 37, 40, 2, P.neon, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Summary strip
    F(0, 40, PW, 56, P.panel2, [
      Ln(0, 0, PW, P.border),
      ...[
        { l: 'TOTAL TRADES',   v: '7',      c: P.text   },
        { l: 'WIN RATE',       v: '71%',    c: P.profit },
        { l: 'NET P&L',        v: '+$1,730',c: P.profit },
        { l: 'PROFIT FACTOR',  v: '2.34',   c: P.profit },
        { l: 'BEST TRADE',     v: '+$640',  c: P.neon   },
        { l: 'WORST TRADE',    v: '-$220',  c: P.loss   },
        { l: 'AVG WIN',        v: '+$406',  c: P.profit },
        { l: 'AVG LOSS',       v: '-$200',  c: P.loss   },
      ].map(({ l, v, c }, i) => {
        const tw = PW / 8;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(l, 0, 8, tw, 12, 7, P.sub, false, 'center', 1, 0.5),
          T(v, 0, 26, tw, 22, 14, c, true, 'center'),
          i < 7 ? R(tw - 1, 8, 1, 40, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 55, PW, P.border),
    ]),

    // Table header
    F(0, 96, PW, 28, P.panel, [
      T('DATE', 24, 8, 60, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('SYMBOL', 90, 8, 70, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('DIR', 170, 8, 36, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('ENTRY', 214, 8, 80, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('EXIT', 302, 8, 80, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('LOTS', 390, 8, 50, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('DURATION', 448, 8, 70, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('R:R', 526, 8, 50, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('P&L', 584, 8, 80, 12, 7, P.dim, true, 'left', 1, 0.8),
      T('NOTES', 680, 8, PW - 704, 12, 7, P.dim, true, 'left', 1, 0.8),
      Ln(0, 27, PW, P.border),
    ]),

    // Trade rows
    F(0, 124, PW, allTrades.length * (ROW_H + 1), P.bg,
      allTrades.map(({ date, sym, dir, entry, exit, lots, duration, pnl, rr, note }, i) => {
        const pos = pnl.startsWith('+');
        const col = pos ? P.profit : P.loss;
        return F(0, i * (ROW_H + 1), PW, ROW_H, P.panel, [
          R(0, 0, 3, ROW_H, col),
          T(date,     24,  Math.round((ROW_H-12)/2), 60,  12, 9, P.dim),
          T(sym,      90,  Math.round((ROW_H-14)/2), 70,  14, 11, P.text, true),
          T(dir,      170, Math.round((ROW_H-12)/2), 36,  12, 9, col, true),
          T(entry,    214, Math.round((ROW_H-12)/2), 80,  12, 9, P.sub),
          T(exit,     302, Math.round((ROW_H-12)/2), 80,  12, 9, P.sub),
          T(lots,     390, Math.round((ROW_H-12)/2), 50,  12, 9, P.sub),
          T(duration, 448, Math.round((ROW_H-12)/2), 70,  12, 9, P.sub),
          T(rr,       526, Math.round((ROW_H-12)/2), 50,  12, 9, col),
          PnLChip(584, Math.round((ROW_H-22)/2), pnl, pos),
          T(note,     680, Math.round((ROW_H-12)/2), PW - 704, 12, 9, P.dim),
          Ln(0, ROW_H - 1, PW, P.border),
        ]);
      })
    ),
  ]);
}

// ─── DESKTOP SCREEN 4 — ANALYTICS ────────────────────────────────────────────
function desktopAnalytics() {
  const calRows = 4, calCols = 5;
  const calData = [
    [280, -180, 310, 640, -95],
    [180, 420, -140, 520, 190],
    [-60, 280, 310, -95, 95],
    [0,   0,   0,   0,  0],
  ];
  const dayL    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const cellW   = 120, cellH = 60;

  const eqData  = [50, 50.18, 49.8, 50.64, 51.19, 50.82, 51.64, 52.04, 51.38, 52.74];
  const eqW     = 540, eqH = 120;
  const barWE   = Math.floor(eqW / eqData.length) - 4;

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 40, P.panel, [
      T('FORTIS', 24, 12, 60, 16, 10, P.neon, true, 'left', 1, 1.5),
      T('Analytics', 92, 14, 100, 14, 9, P.sub),
      ...['Dashboard', 'Instruments', 'Journal', 'Analytics', 'Accounts'].map((tab, i) =>
        F(PW - 500 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 3 ? P.text : P.sub, i === 3, 'center'),
          i === 3 ? R(30, 37, 40, 2, P.neon, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Stat tiles
    F(0, 40, PW, 64, P.panel2, [
      Ln(0, 0, PW, P.border),
      ...[
        { l: 'CHALLENGE P&L',   v: '+$1,190', c: P.neon   },
        { l: 'PROFIT FACTOR',   v: '2.34',    c: P.profit },
        { l: 'WIN RATE',        v: '68%',     c: P.profit },
        { l: 'TOTAL TRADES',    v: '21',      c: P.text   },
        { l: 'AVG R:R',         v: '1.67',    c: P.blue   },
        { l: 'MAX CONSEC. WINS',v: '4',       c: P.profit },
        { l: 'SHARPE RATIO',    v: '2.18',    c: P.profit },
        { l: 'EXPECTANCY',      v: '+$56/trade', c: P.profit },
      ].map(({ l, v, c }, i) => {
        const tw = PW / 8;
        return F(i * tw, 0, tw, 64, 'transparent', [
          T(l, 0, 8, tw, 12, 7, P.sub, false, 'center', 1, 0.5),
          T(v, 0, 28, tw, 24, 16, c, true, 'center'),
          i < 7 ? R(tw - 1, 8, 1, 48, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 63, PW, P.border),
    ]),

    // Main analytics area
    F(48, 120, PW - 96, PH - 160, P.bg, [

      // P&L Calendar heatmap
      F(0, 0, calCols * (cellW + 8), calRows * (cellH + 8) + 32, P.panel, [
        T('P&L CALENDAR', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        // Day labels
        ...dayL.map((d, i) =>
          T(d, 20 + i * (cellW + 8), 36, cellW, 14, 8, P.dim, false, 'center')
        ),
        // Cells
        ...calData.flatMap((week, wi) =>
          week.map((val, di) => {
            const col = val > 300 ? P.neon : val > 0 ? P.profit : val < -100 ? P.loss : val < 0 ? P.warn : P.panel2;
            const op  = val === 0 ? 0.3 : Math.min(Math.abs(val) / 700 + 0.25, 0.85);
            return F(20 + di * (cellW + 8), 54 + wi * (cellH + 8), cellW, cellH, col, [
              R(0, 0, cellW, cellH, col, { op: 0.12, r: 4 }),
              val !== 0 ? T(val > 0 ? `+$${val}` : `-$${Math.abs(val)}`, 0, 18, cellW, 22, 13, col, true, 'center') : null,
            ].filter(Boolean), { r: 4 });
          })
        ),
      ], { r: 8 }),

      // Equity curve
      F(calCols * (cellW + 8) + 24, 0, eqW, calRows * (cellH + 8) + 32, P.panel, [
        T('EQUITY CURVE', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        T('$50K → $51,190', eqW - 140, 16, 120, 14, 9, P.neon, true, 'right'),
        F(20, 40, eqW - 40, eqH + 20, 'transparent', [
          // Zero line
          Ln(0, eqH, eqW - 40, P.border, 0.5),
          // Bars
          ...eqData.map((v, i) => {
            const base = 50, h = Math.round((v - base) / 3 * eqH);
            const pos  = v >= base;
            return R(i * (barWE + 4), eqH - (pos ? h : 0), barWE, Math.abs(h) || 2, pos ? P.profit : P.loss, { op: 0.7, r: 1 });
          }),
        ]),
        // Labels
        F(20, eqH + 64, eqW - 40, 20, 'transparent',
          ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10'].map((d, i) =>
            T(d, i * (barWE + 4), 0, barWE, 16, 7, P.dim, false, 'center')
          )
        ),
      ], { r: 8 }),

      // Win/loss by session
      F(0, calRows * (cellH + 8) + 56, calCols * (cellW + 8), 200, P.panel, [
        T('WIN RATE BY SESSION', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        ...[
          { session: 'Asian',    wins: 2, losses: 1, col: P.blue   },
          { session: 'London',   wins: 6, losses: 2, col: P.profit },
          { session: 'NY Open',  wins: 4, losses: 2, col: P.warn   },
          { session: 'NY Close', wins: 2, losses: 2, col: P.sub    },
        ].map(({ session, wins, losses, col }, i) => {
          const total = wins + losses;
          const pct   = wins / total;
          const bw    = calCols * (cellW + 8) - 80;
          return F(20, 44 + i * 38, bw, 30, 'transparent', [
            T(session, 0, 8, 80, 14, 9, P.sub),
            R(90, 10, bw - 130, 8, P.border, { r: 4 }),
            R(90, 10, Math.round((bw - 130) * pct), 8, col, { r: 4 }),
            T(`${wins}W/${losses}L`, bw - 36, 8, 36, 14, 8, col, true, 'right'),
          ]);
        }),
      ], { r: 8 }),

      // Trade size distribution
      F(calCols * (cellW + 8) + 24, calRows * (cellH + 8) + 56, eqW, 200, P.panel, [
        T('LOT SIZE DISTRIBUTION', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        ...[
          { lot: '0.10', count: 4, pct: 0.19 },
          { lot: '0.25', count: 3, pct: 0.14 },
          { lot: '0.30', count: 5, pct: 0.24 },
          { lot: '0.50', count: 7, pct: 0.33 },
          { lot: '1.00', count: 2, pct: 0.10 },
        ].map(({ lot, count, pct }, i) => {
          const bw = eqW - 120;
          return F(20, 44 + i * 28, eqW - 40, 22, 'transparent', [
            T(lot, 0, 4, 48, 14, 9, P.sub),
            R(56, 6, bw, 8, P.border, { r: 4 }),
            R(56, 6, Math.round(bw * pct), 8, P.blue, { r: 4 }),
            T(`${count} trades`, bw + 64, 4, 80, 14, 8, P.dim, false, 'right'),
          ]);
        }),
      ], { r: 8 }),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 5 — ACCOUNTS / SCALING PLAN ──────────────────────────────
function desktopAccounts() {
  const accounts = [
    { size: '$50K',  phase: 'Phase 1',  profit: '$1,190', target: '$4,000', dd: '$810', status: 'active',  pct: 0.298 },
    { size: '$25K',  phase: 'Funded',   profit: '$3,840', target: '—',      dd: '$420', status: 'funded',  pct: 1.0   },
    { size: '$10K',  phase: 'Complete', profit: '$1,040', target: '$800',   dd: '$280', status: 'complete',pct: 1.0   },
  ];

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 40, P.panel, [
      T('FORTIS', 24, 12, 60, 16, 10, P.neon, true, 'left', 1, 1.5),
      T('Accounts & Scaling', 92, 14, 160, 14, 9, P.sub),
      ...['Dashboard', 'Instruments', 'Journal', 'Analytics', 'Accounts'].map((tab, i) =>
        F(PW - 500 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 4 ? P.text : P.sub, i === 4, 'center'),
          i === 4 ? R(30, 37, 40, 2, P.neon, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Account cards
    F(48, 56, PW - 96, 200, P.bg,
      accounts.map(({ size, phase, profit, target, dd, status, pct }, i) => {
        const cw  = Math.round((PW - 96 - 48) / 3);
        const col = status === 'funded' ? P.neon : status === 'active' ? P.blue : P.profit;
        const stl = status === 'funded' ? 'FUNDED' : status === 'active' ? 'IN PROGRESS' : 'PASSED';
        return F(i * (cw + 24), 0, cw, 196, P.panel, [
          R(0, 0, cw, 3, col),
          T(size, 20, 16, 100, 28, 22, P.text, true),
          T(phase, 20, 46, 100, 16, 10, col),
          F(cw - 110, 16, 88, 22, 'transparent', [
            R(0, 0, 88, 22, col, { op: 0.15, r: 4 }),
            T(stl, 0, 4, 88, 14, 8, col, true, 'center', 1, 0.6),
          ], { r: 4 }),
          Ln(0, 72, cw, P.border, 0.5),
          T('Profit', 20, 84, 80, 14, 9, P.sub),
          T(profit, cw - 100, 84, 80, 14, 10, P.profit, true, 'right'),
          T('Target', 20, 104, 80, 14, 9, P.sub),
          T(target, cw - 100, 104, 80, 14, 10, P.sub, false, 'right'),
          T('Drawdown', 20, 124, 80, 14, 9, P.sub),
          T(dd, cw - 100, 124, 80, 14, 10, P.warn, false, 'right'),
          R(20, 152, cw - 40, 6, P.border, { r: 3 }),
          R(20, 152, Math.round((cw - 40) * Math.min(pct, 1)), 6, col, { r: 3 }),
          T(`${Math.round(pct * 100)}%`, 20, 164, cw - 40, 12, 8, col, true),
        ], { r: 8 });
      })
    ),

    // Scaling plan
    T('SCALING PLAN — FUNDED ACCOUNT MILESTONES', 48, 276, 600, 14, 9, P.sub, true, 'left', 1, 0.8),
    F(48, 296, PW - 96, PH - 340, P.panel, [
      // Column headers
      F(0, 0, PW - 96, 32, P.panel2, [
        T('MILESTONE', 24, 9, 200, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('ACCOUNT SIZE', 240, 9, 120, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('PROFIT TARGET', 380, 9, 120, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('PROFIT SHARE', 520, 9, 120, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('MAX DRAWDOWN', 660, 9, 120, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('STATUS', 800, 9, 120, 14, 8, P.dim, true, 'right', 1, 0.8),
        Ln(0, 31, PW - 96, P.border),
      ]),
      // Milestone rows
      ...[
        { milestone: 'Starting Challenge',        size: '$50,000',  target: '$4,000 (8%)', share: '—',   dd: '$5,000 (10%)', status: 'active',   idx: 0 },
        { milestone: 'Pass Phase 1',              size: '$50,000',  target: '$2,500 (5%)', share: '—',   dd: '$5,000 (10%)', status: 'locked',   idx: 1 },
        { milestone: 'Get Funded',                size: '$50,000',  target: '10% profits', share: '80%', dd: '$5,000 (10%)', status: 'locked',   idx: 2 },
        { milestone: 'Scale to $100K (6 months)', size: '$100,000', target: '10% profits', share: '80%', dd: '$10,000',      status: 'locked',   idx: 3 },
        { milestone: 'Scale to $200K (12 months)',size: '$200,000', target: '10% profits', share: '85%', dd: '$20,000',      status: 'locked',   idx: 4 },
        { milestone: 'Elite Tier',                size: '$400,000', target: '10% profits', share: '90%', dd: '$40,000',      status: 'locked',   idx: 5 },
      ].map(({ milestone, size, target, share, dd, status, idx }) => {
        const col = status === 'active' ? P.neon : status === 'complete' ? P.profit : P.dim;
        const stl = status === 'active' ? 'ACTIVE' : status === 'complete' ? 'COMPLETE' : 'LOCKED';
        const stC = status === 'active' ? P.neon : status === 'complete' ? P.profit : P.dim;
        return F(0, 32 + idx * 52, PW - 96, 50, status === 'active' ? P.panel3 : P.panel, [
          status === 'active' ? R(0, 0, 3, 50, P.neon) : null,
          T(milestone, 24, 17, 200, 16, 10, col, status === 'active'),
          T(size, 240, 17, 120, 16, 10, col),
          T(target, 380, 17, 120, 16, 10, col),
          T(share, 520, 17, 120, 16, 10, col),
          T(dd, 660, 17, 120, 16, 10, col),
          F(800, 14, 80, 22, 'transparent', [
            R(0, 0, 80, 22, stC, { op: 0.15, r: 4 }),
            T(stl, 0, 4, 80, 14, 7, stC, true, 'center', 1, 0.6),
          ], { r: 4 }),
          Ln(0, 49, PW - 96, P.border),
        ].filter(Boolean));
      }),
    ], { r: 8 }),
  ]);
}

// ─── ASSEMBLE & LAYOUT ────────────────────────────────────────────────────────
const screens = [
  mobileChallengeOverview(),
  mobileLiveSession(),
  mobileTradeJournal(),
  mobileRules(),
  mobileAnalytics(),
  desktopChallengeDashboard(),
  desktopInstrumentCluster(),
  desktopJournal(),
  desktopAnalytics(),
  desktopAccounts(),
];

let ox = 0;
const GAP = 60;
const laid = screens.map(s => {
  const out = { ...s, x: ox };
  ox += s.width + GAP;
  return out;
});

// ─── MINIFY ───────────────────────────────────────────────────────────────────
function minifyEl(el) {
  const o = { type: el.type, x: el.x || 0, y: el.y || 0, width: el.width, height: el.height };
  if (el.fill !== undefined) o.fill = el.fill;
  if (el.cornerRadius) o.cornerRadius = el.cornerRadius;
  if (el.opacity !== undefined && el.opacity < 0.999) o.opacity = el.opacity;
  if (el.type === 'text') {
    o.text = el.text;
    o.fontSize = el.fontSize;
    if (el.fill) o.fill = el.fill;
    if (el.fontWeight === 700) o.fontWeight = 700;
    if (el.textAlign && el.textAlign !== 'left') o.textAlign = el.textAlign;
    if (el.letterSpacing) o.letterSpacing = el.letterSpacing;
  }
  if (el.children && el.children.length) o.children = el.children.map(minifyEl);
  return o;
}

const penDoc  = { version: '2.8', children: laid.map(minifyEl) };
const penJSON = JSON.stringify(penDoc);
const penB64  = Buffer.from(penJSON).toString('base64');
fs.writeFileSync('/workspace/group/design-studio/fortis.pen', penJSON);
console.log(`Pen JSON: ${(penJSON.length / 1024).toFixed(1)} KB`);

// ─── SVG THUMBNAILS ───────────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oA = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rA = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rA}${oA}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse')
    return `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}"${oA}/>`;
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 12) * 0.65));
    return `<rect x="${x}" y="${y+(h-fh)/2}" width="${w}" height="${fh}" fill="${fill || '#E2E8F4'}"${oA} rx="1"/>`;
  }
  return '';
}

function screenThumb(s, tw, th) {
  const flat = { ...s, x: 0, y: 0 };
  const kids = (flat.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${flat.width} ${flat.height}" `
    + `width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0;box-shadow:0 4px 24px rgba(0,255,178,0.08)">`
    + `<rect width="${flat.width}" height="${flat.height}" fill="${flat.fill || P.bg}"/>`
    + kids + `</svg>`;
}

const labels = [
  'M·Challenge','M·Live Session','M·Journal','M·Rules','M·Analytics',
  'D·Dashboard','D·Instruments','D·Journal','D·Analytics','D·Accounts',
];
const thumbsHTML = screens.map((s, i) => {
  const mobile = i < 5;
  const th = 180, tw = mobile ? Math.round(th * MW / MH) : Math.round(th * PW / PH);
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px">`
    + screenThumb(s, tw, th)
    + `<span style="font-size:9px;letter-spacing:1.5px;color:#7A8EA8;text-transform:uppercase;white-space:nowrap">${labels[i]}</span></div>`;
}).join('');

// ─── BUILD HTML ───────────────────────────────────────────────────────────────
const tagsHTML = ['FUNDED TRADING','DARK TERMINAL','GAUGE CLUSTER','RISK INSTRUMENTS','PROP FIRM']
  .map(t => `<span style="border:1px solid #1C2535;color:#7A8EA8;padding:4px 12px;border-radius:20px;font-size:10px;letter-spacing:1px">${t}</span>`).join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FORTIS — Funded Trader Challenge Platform</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0A0C11;color:#E2E8F4;font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
a{color:inherit;text-decoration:none}
::-webkit-scrollbar{height:4px;width:4px}
::-webkit-scrollbar-track{background:#0F1218}
::-webkit-scrollbar-thumb{background:#1C2535;border-radius:4px}
.nav{display:flex;justify-content:space-between;align-items:center;padding:0 40px;height:56px;border-bottom:1px solid #1C2535}
.logo{font-size:14px;font-weight:700;letter-spacing:2px;color:#00FFB2}
.nav-r{display:flex;gap:16px}
.btn{background:#0F1218;border:1px solid #1C2535;color:#7A8EA8;padding:8px 18px;border-radius:6px;font-size:11px;letter-spacing:0.5px;cursor:pointer;font-family:inherit;font-weight:700}
.btn:hover{border-color:#00FFB2;color:#E2E8F4}
.btn-p{background:#061A12;border:1px solid #00D68F;color:#00D68F}
.btn-x{background:#0D0D0D;border:1px solid #333;color:#fff}
.hero{padding:48px 40px 32px;border-bottom:1px solid #1C2535}
.hero h1{font-size:36px;font-weight:700;letter-spacing:-0.5px;line-height:1.15;margin-bottom:10px}
.hero p{font-size:14px;color:#7A8EA8;line-height:1.6;max-width:580px;margin-top:8px}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.thumb-row{display:flex;gap:24px;padding:32px 40px;overflow-x:auto;align-items:flex-end}
.section{padding:32px 40px;border-top:1px solid #1C2535}
.section h2{font-size:11px;letter-spacing:1.5px;color:#7A8EA8;margin-bottom:20px;text-transform:uppercase}
.cards{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.card{background:#0F1218;border:1px solid #1C2535;border-radius:8px;padding:20px}
.card h3{font-size:10px;letter-spacing:1px;color:#00FFB2;margin-bottom:10px;text-transform:uppercase}
.card p{font-size:12px;color:#7A8EA8;line-height:1.7}
</style>
</head>
<body>
<nav class="nav">
  <div class="logo">FORTIS</div>
  <div class="nav-r">
    <button class="btn btn-x" onclick="shareOnX()">Share on 𝕏</button>
    <button class="btn btn-p" onclick="openInViewer()">Open in Viewer ↗</button>
    <button class="btn" onclick="downloadPen()">Download .pen</button>
  </div>
</nav>
<div class="hero">
  <h1>Funded Trader<br>Challenge Platform</h1>
  <p>Research-first design for the prop trading / funded trader market. Domain-derived UI — gauges for risk proximity, not tables. Built from the challenge trader's morning anxiety loop outward.</p>
  <div class="tags">${tagsHTML}</div>
</div>
<div class="thumb-row">${thumbsHTML}</div>
<div class="section">
  <h2>Research → Design Decisions</h2>
  <div class="cards">
    <div class="card">
      <h3>Market Found: Prop Firm Industry</h3>
      <p>Studied FTMO (#1 globally, $200K accounts), Apex Trader Funding (futures specialist), TopstepTrader (US legacy), The Funded Trader, MyFundedFX. <strong>Gap found:</strong> every competitor's trader dashboard is a dense desktop table. No visual gauge system. No mobile-first morning check-in view. No clear "how close am I to the breach" instrument.</p>
    </div>
    <div class="card">
      <h3>Domain Concept → UI: Gauge Cluster</h3>
      <p>Max Drawdown is a binary rule — breach = instant account termination, no warnings. Daily Loss Limit resets at midnight and is the #1 challenge-killer. These two rules create extreme "proximity anxiety" in traders. The instrument cluster view (D·Instruments screen) addresses this directly — three large circular gauges instead of a table row. You feel how close to the edge you are.</p>
    </div>
    <div class="card">
      <h3>Actor Workflow → Information Hierarchy</h3>
      <p>The challenge trader's morning routine: (1) open dashboard, (2) check balance vs. yesterday's HWM, (3) check daily loss reset, (4) verify drawdown hasn't crept up overnight, (5) plan the day's risk. This 5-step flow drives the screen layout — risk status FIRST, profit progress SECOND, trade detail THIRD. Risk bars above the trade list, always.</p>
    </div>
  </div>
</div>
<script>
const D="${penB64}";
function downloadPen(){const a=document.createElement('a');a.href='data:application/json;base64,'+D;a.download='fortis.pen';a.click();}
function openInViewer(){try{localStorage.setItem('pv_pending',JSON.stringify({json:atob(D),name:'fortis.pen'}));window.open('https://zenbin.org/p/pen-viewer-3','_blank');}catch(e){alert('Error: '+e.message);}}
function shareOnX(){const url=encodeURIComponent(window.location.href);const text=encodeURIComponent('FORTIS — Funded Trader Challenge Platform. Research-first UI design: risk gauges, instrument cluster, P&L calendar. Built with domain research into the prop trading market. #UIDesign #PropTrading #FundedTrader');window.open('https://twitter.com/intent/tweet?text='+text+'&url='+url,'_blank');}
</script>
</body>
</html>`;

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
const slugs = ['fortis-trader','fortis-tr1','fortis-tr2'];
function publishPage(slug, htmlContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title: 'FORTIS — Funded Trader Platform', html: htmlContent });
    const req  = https.request({
      hostname: 'zenbin.org', port: 443, path: `/v1/pages/${slug}`,
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
(async () => {
  for (const slug of slugs) {
    const r = await publishPage(slug, html);
    if (r.status === 200 || r.status === 201) { console.log(`✓ Published: https://zenbin.org/p/${slug}`); return; }
    if (r.status !== 409) { console.error(`✗ HTTP ${r.status}: ${r.body.slice(0,200)}`); break; }
    console.log(`  Slug "${slug}" taken, trying next…`);
  }
})();
