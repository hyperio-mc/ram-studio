// GATE — Every merge, reviewed.
// AI-powered code quality gate & PR intelligence for developer teams
// Inspired by:
//   - Neon.com (Dark Mode Design) — deep space dark bg, neon emerald, AI-first dev tool aesthetic
//   - Midday.ai (Dark Mode Design) — dark dashboard for founders, tabbed feature sections, data-dense layout
//   - "Fluid Glass" Awwwards nominee — depth layering, glass morphism on dark
// Theme: DARK — #0B0E14 deep space, #00D4A4 neon emerald, #7B6FFF soft violet

'use strict';
const fs = require('fs');

const W = 390, H = 844;
const SLUG = 'gate';

// ── PALETTE ─────────────────────────────────────────────────────────────────
const BG      = '#0B0E14';   // deep space near-black (Neon.com depth)
const SURF    = '#131720';   // lifted surface
const SURF2   = '#1C2130';   // card background
const SURF3   = '#252A3D';   // elevated / selected card
const EMERALD = '#00D4A4';   // neon emerald — primary (Neon.com palette)
const EMSOFT  = 'rgba(0,212,164,0.10)';
const EMSOFT2 = 'rgba(0,212,164,0.06)';
const EMGLOW  = 'rgba(0,212,164,0.20)';
const VIOLET  = '#7B6FFF';   // secondary violet
const VIOSOFT = 'rgba(123,111,255,0.12)';
const CORAL   = '#FF5A5A';   // critical / errors
const CORSOFT = 'rgba(255,90,90,0.10)';
const AMBER   = '#FFB443';   // warnings
const AMBSOFT = 'rgba(255,180,67,0.10)';
const TEXT    = '#E0E6F2';   // cool near-white
const MUTED   = 'rgba(224,230,242,0.42)';
const DIM     = 'rgba(224,230,242,0.16)';
const DIVIDER = 'rgba(224,230,242,0.07)';
const MONO    = 'JetBrains Mono';
const SANS    = 'Inter';

// ── HELPERS ─────────────────────────────────────────────────────────────────
function pen(id, name, bg, elements) {
  return { id, name, backgroundColor: bg, width: W, height: H, elements };
}
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    opacity: opts.opacity ?? 1, cornerRadius: opts.r ?? 0,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1 };
}
function txt(content, x, y, size, color, opts = {}) {
  return { type: 'text', content, x, y, fontSize: size, color,
    fontWeight: opts.w ?? 400, fontFamily: opts.font ?? SANS,
    textAlign: opts.align ?? 'left', width: opts.width ?? 350,
    opacity: opts.opacity ?? 1, letterSpacing: opts.ls ?? 0 };
}
function line(x1, y1, x2, y2, color, sw = 1, op = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: sw, opacity: op };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'ellipse', x: cx - r, y: cy - r, width: r * 2, height: r * 2,
    fill, stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1.5, opacity: opts.opacity ?? 1 };
}

// ── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar() {
  return [
    txt('9:41', 20, 16, 12, TEXT, { w: 600, ls: 0.2 }),
    txt('●●● ▲▲▲ ▮', 295, 16, 10, MUTED, { width: 80, align: 'right' }),
  ];
}

// ── BOTTOM NAV ──────────────────────────────────────────────────────────────
function bottomNav(active) {
  const items = [
    { id: 'queue',    label: 'Queue',    icon: '⊞' },
    { id: 'review',  label: 'Review',   icon: '◈' },
    { id: 'insights',label: 'Insights', icon: '◉' },
    { id: 'agents',  label: 'Agents',   icon: '⟡' },
  ];
  const els = [
    rect(0, H - 80, W, 80, SURF),
    line(0, H - 80, W, H - 80, DIVIDER),
  ];
  items.forEach((item, i) => {
    const x = (W / items.length) * i + (W / items.length) / 2;
    const isActive = item.id === active;
    if (isActive) els.push(circle(x, H - 52, 20, EMSOFT));
    els.push(txt(item.icon, x - 8, H - 63, 16, isActive ? EMERALD : MUTED, { width: 16, align: 'center', w: 400 }));
    els.push(txt(item.label, x - 28, H - 44, 10, isActive ? EMERALD : MUTED, { width: 56, align: 'center', w: isActive ? 600 : 400 }));
  });
  return els;
}

// ── SCORE RING BADGE ─────────────────────────────────────────────────────────
function scoreBadge(cx, cy, score, size = 28) {
  const color = score >= 80 ? EMERALD : score >= 60 ? AMBER : CORAL;
  return [
    circle(cx, cy, size + 3, EMGLOW),
    circle(cx, cy, size, SURF2),
    circle(cx, cy, size, 'none', { stroke: color, strokeWidth: 2.5 }),
    txt(String(score), cx - size + 2, cy - 8, score >= 100 ? 11 : 13, color,
      { w: 700, font: MONO, width: size * 2 - 4, align: 'center' }),
  ];
}

// ── PR CARD ──────────────────────────────────────────────────────────────────
function prCard(x, y, w, pr) {
  const { title, branch, author, score, time, files, additions, deletions, status, active } = pr;
  const h = 94;
  const sc = score >= 80 ? EMERALD : score >= 60 ? AMBER : CORAL;
  const stBg = status === 'approved' ? EMSOFT : status === 'needs-work' ? CORSOFT : AMBSOFT;
  const stC  = status === 'approved' ? EMERALD : status === 'needs-work' ? CORAL : AMBER;
  const stL  = status === 'approved' ? '✓ Approved' : status === 'needs-work' ? '✗ Needs work' : '◌ In review';
  return [
    rect(x, y, w, h, active ? SURF3 : SURF2, { r: 12,
      stroke: active ? EMERALD : DIVIDER, strokeWidth: active ? 1 : 1 }),
    ...scoreBadge(x + w - 36, y + h / 2, score, 22),
    txt(title, x + 14, y + 10, 13, TEXT, { w: 600, width: w - 82 }),
    txt(branch, x + 14, y + 28, 10, EMERALD, { font: MONO, ls: 0.2, width: w - 82 }),
    txt(author + '  ·  ' + time, x + 14, y + 46, 10, MUTED, { width: w - 82 }),
    txt(files + ' files  +' + additions + '  -' + deletions, x + 14, y + 62, 10, MUTED, { font: MONO, width: w - 82 }),
    rect(x + 14, y + h - 20, 84, 14, stBg, { r: 7 }),
    txt(stL, x + 14, y + h - 20, 9, stC, { w: 600, width: 84, align: 'center' }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — PR Queue / Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function screen1() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  // Logo + tagline
  els.push(txt('GATE', 20, 44, 20, EMERALD, { w: 700, ls: 2, font: MONO }));
  els.push(txt('code intelligence', 80, 50, 11, MUTED, { ls: 0.3 }));
  // Avatar
  els.push(circle(W - 30, 52, 18, SURF2, { stroke: EMERALD, strokeWidth: 1.5 }));
  els.push(txt('AK', W - 38, 45, 11, EMERALD, { w: 700, width: 16, align: 'center' }));

  // Stat row
  const stats = [
    { label: 'Open PRs', value: '7',  color: TEXT },
    { label: 'Avg score', value: '84', color: EMERALD },
    { label: 'Blocked',  value: '2',  color: CORAL },
  ];
  const sw = (W - 40) / 3;
  stats.forEach((s, i) => {
    const sx = 20 + sw * i;
    els.push(rect(sx, 82, sw - 6, 52, SURF2, { r: 10 }));
    els.push(txt(s.value, sx + 10, 90, 22, s.color, { w: 700 }));
    els.push(txt(s.label, sx + 10, 112, 10, MUTED, { width: sw - 16 }));
  });

  // Section header
  els.push(txt('Pull requests', 20, 148, 13, TEXT, { w: 600 }));
  els.push(rect(W - 62, 144, 44, 18, EMSOFT2, { r: 9, stroke: EMERALD, strokeWidth: 1 }));
  els.push(txt('filter', W - 62, 147, 10, EMERALD, { width: 44, align: 'center' }));

  const prs = [
    { title: 'feat: streaming inference cache', branch: 'feat/stream-cache',
      author: 'akshat', time: '2h', files: 8, additions: 142, deletions: 34, score: 91, status: 'approved', active: false },
    { title: 'fix: rate limiter race condition', branch: 'fix/rate-limit',
      author: 'mei', time: '5h', files: 3, additions: 28, deletions: 12, score: 73, status: 'in-review', active: true },
    { title: 'refactor: auth middleware split', branch: 'refactor/auth-mw',
      author: 'dan', time: '1d', files: 14, additions: 312, deletions: 278, score: 48, status: 'needs-work', active: false },
    { title: 'docs: API reference v2.0', branch: 'docs/api-v2',
      author: 'priya', time: '1d', files: 2, additions: 88, deletions: 11, score: 96, status: 'approved', active: false },
  ];
  let py = 172;
  prs.forEach(pr => { els.push(...prCard(20, py, W - 40, pr)); py += 102; });

  // FAB — run agent
  els.push(circle(W - 36, H - 96, 24, EMERALD));
  els.push(txt('⟡', W - 36 - 9, H - 96 - 9, 18, BG, { w: 700, width: 18, align: 'center' }));

  els.push(...bottomNav('queue'));
  return pen('screen1', '01 — PR Queue', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Review: AI diff + suggestions
// ─────────────────────────────────────────────────────────────────────────────
function screen2() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  els.push(txt('← Back', 20, 44, 12, EMERALD, { w: 600 }));
  els.push(txt('fix/rate-limit', 20, 62, 11, EMERALD, { font: MONO, ls: 0.2 }));
  els.push(txt('fix: rate limiter race condition', 20, 80, 14, TEXT, { w: 700, width: W - 80 }));
  els.push(...scoreBadge(W - 44, 74, 73, 26));

  // Meta row
  const meta = [
    { l: 'Files', v: '3', c: TEXT },
    { l: 'Adds',  v: '+28', c: EMERALD },
    { l: 'Dels',  v: '-12', c: CORAL },
    { l: 'By',    v: 'mei', c: TEXT },
  ];
  const mw = (W - 40) / 4;
  meta.forEach((m, i) => {
    const mx = 20 + mw * i;
    els.push(txt(m.v, mx, 112, 13, m.c, { w: 700, font: i < 3 ? MONO : SANS, width: mw }));
    els.push(txt(m.l, mx, 128, 9, MUTED, { width: mw }));
  });

  els.push(line(20, 148, W - 20, 148, DIVIDER));

  // Changed files
  els.push(txt('Changed files', 20, 156, 11, MUTED, { w: 600 }));
  const files = [
    { name: 'middleware/rateLimit.ts', adds: 14, dels: 8, risk: 'med' },
    { name: 'utils/lock.ts',           adds: 11, dels: 4, risk: 'low' },
    { name: 'tests/rateLimit.test.ts', adds: 3,  dels: 0, risk: 'low' },
  ];
  let fy = 172;
  files.forEach(f => {
    const rc = f.risk === 'med' ? AMBER : EMERALD;
    els.push(rect(20, fy, W - 40, 26, SURF2, { r: 6 }));
    els.push(txt(f.name, 30, fy + 8, 10, TEXT, { font: MONO, width: W - 120 }));
    els.push(txt(`+${f.adds} -${f.dels}`, W - 68, fy + 8, 10, MUTED, { font: MONO, width: 50, align: 'right' }));
    els.push(circle(W - 28, fy + 13, 4, rc));
    fy += 30;
  });

  // Diff section
  els.push(line(20, fy + 2, W - 20, fy + 2, DIVIDER));
  els.push(txt('rateLimit.ts  ·  lines 42–55', 20, fy + 10, 10, MUTED, { font: MONO }));
  fy += 26;
  els.push(rect(20, fy, W - 40, 10 * 19, SURF2, { r: 8 }));

  const diffs = [
    { t: ' ', c: 'async acquire(key: string) {' },
    { t: ' ', c: '  const lock = await getLock(key);' },
    { t: '-', c: '  return lock.wait(this.timeout);' },
    { t: '+', c: '  const result = await Promise.race([' },
    { t: '+', c: '    lock.wait(this.timeout),' },
    { t: '+', c: '    sleep(this.timeout).then(() =>' },
    { t: '+', c: '      { throw new Error("timeout") })' },
    { t: '+', c: '  ]);' },
    { t: '+', c: '  return result;' },
    { t: ' ', c: '}' },
  ];
  diffs.forEach(d => {
    const bg = d.t === '+' ? 'rgba(0,212,164,0.08)' : d.t === '-' ? 'rgba(255,90,90,0.08)' : 'transparent';
    const cc = d.t === '+' ? EMERALD : d.t === '-' ? CORAL : DIM;
    els.push(rect(22, fy + 1, W - 44, 17, bg));
    els.push(txt(d.t, 28, fy + 3, 10, cc, { font: MONO, w: 700, width: 10 }));
    els.push(txt(d.c, 40, fy + 3, 10, d.t === ' ' ? DIM : cc, { font: MONO, width: W - 64 }));
    fy += 19;
  });

  // AI suggestion
  fy += 8;
  const sev = 'warning';
  const bc = AMBER;
  els.push(rect(20, fy, W - 40, 68, SURF2, { r: 10, stroke: bc, strokeWidth: 1 }));
  els.push(rect(20, fy, 3, 68, bc, { r: 2 }));
  els.push(txt('◌  Promise leak risk', 30, fy + 10, 11, TEXT, { w: 600, width: W - 110 }));
  els.push(txt('rateLimit.ts:51', 30, fy + 26, 9, bc, { font: MONO }));
  els.push(txt('Unawaited branch may silently leak on timeout path.', 30, fy + 40, 10, MUTED, { width: W - 100 }));
  els.push(rect(W - 90, fy + 10, 62, 22, AMBSOFT, { r: 11 }));
  els.push(txt('✦ Fix', W - 90, fy + 14, 10, bc, { w: 600, width: 62, align: 'center' }));

  els.push(...bottomNav('review'));
  return pen('screen2', '02 — Review', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Insights: code quality trends
// ─────────────────────────────────────────────────────────────────────────────
function screen3() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  els.push(txt('Insights', 20, 44, 20, TEXT, { w: 700 }));
  els.push(txt('30-day trend', 20, 66, 11, MUTED));

  // Time chips
  const chips = ['7d', '30d', '90d'];
  chips.forEach((c, i) => {
    const active = i === 1;
    els.push(rect(W - 20 - 38 * (chips.length - i), 40, 34, 18,
      active ? EMSOFT : SURF2, { r: 9, stroke: active ? EMERALD : DIVIDER }));
    els.push(txt(c, W - 20 - 38 * (chips.length - i), 43, 10,
      active ? EMERALD : MUTED, { w: active ? 600 : 400, width: 34, align: 'center' }));
  });

  // Score trend chart
  els.push(txt('AI Review Score', 20, 86, 12, TEXT, { w: 600 }));
  els.push(txt('avg 84  ↑ +7%', W - 100, 86, 11, EMERALD, { w: 600, width: 80, align: 'right' }));

  const cX = 20, cY = 104, cW = W - 40, cH = 68;
  els.push(rect(cX, cY, cW, cH, SURF2, { r: 10 }));
  const bars = [68, 74, 79, 71, 83, 86, 91, 78, 88, 84, 90, 87, 84, 91, 88];
  const bw = (cW - 20) / bars.length;
  bars.forEach((v, i) => {
    const bh = ((v - 60) / 40) * (cH - 16);
    const bx = cX + 10 + i * bw;
    const by = cY + cH - 8 - bh;
    const isLast = i === bars.length - 1;
    els.push(rect(bx, by, bw - 2, bh, isLast ? EMERALD : EMSOFT2, { r: 2 }));
    if (isLast) {
      els.push(txt(String(v), bx - 3, by - 14, 10, EMERALD,
        { w: 700, font: MONO, width: 22, align: 'center' }));
    }
  });
  [0.33, 0.66].forEach(g => {
    const gy = cY + 8 + (1 - g) * (cH - 16);
    els.push(line(cX + 8, gy, cX + cW - 8, gy, DIVIDER));
  });

  // Hotspot files
  els.push(txt('Hotspot files', 20, 186, 12, TEXT, { w: 600 }));
  els.push(txt('most review churn', W - 140, 186, 10, MUTED, { width: 120, align: 'right' }));

  const hotspots = [
    { file: 'middleware/rateLimit.ts', score: 38, delta: '+12', c: CORAL },
    { file: 'api/inference.ts',        score: 54, delta: '+8',  c: AMBER },
    { file: 'auth/session.ts',         score: 62, delta: '+3',  c: AMBER },
    { file: 'db/cache.ts',             score: 74, delta: '-2',  c: EMERALD },
    { file: 'utils/logger.ts',         score: 83, delta: '-5',  c: EMERALD },
  ];
  let hy = 206;
  hotspots.forEach(h => {
    const bMax = W - 120;
    const bFill = (bMax - 20) * (h.score / 100);
    els.push(rect(20, hy, W - 40, 38, SURF2, { r: 8 }));
    els.push(txt(h.file, 30, hy + 8, 10, TEXT, { font: MONO, width: W - 120 }));
    els.push(rect(30, hy + 24, bMax - 20, 5, DIM, { r: 3 }));
    els.push(rect(30, hy + 24, bFill, 5, h.c, { r: 3 }));
    els.push(txt(String(h.score), W - 74, hy + 8, 12, h.c, { w: 700, font: MONO, width: 28, align: 'right' }));
    const dc = h.delta.startsWith('-') ? EMERALD : CORAL;
    els.push(txt(h.delta, W - 38, hy + 8, 10, dc, { w: 600, font: MONO, width: 24 }));
    hy += 42;
  });

  // Issue breakdown
  const iY = hy + 8;
  els.push(txt('Issue breakdown', 20, iY, 12, TEXT, { w: 600 }));
  const issues = [
    { label: 'Security',     count: 3,  color: CORAL },
    { label: 'Performance',  count: 7,  color: AMBER },
    { label: 'Style',        count: 14, color: VIOLET },
    { label: 'Logic',        count: 5,  color: EMERALD },
  ];
  const iw = (W - 40) / 2;
  issues.forEach((issue, i) => {
    const ix = 20 + (i % 2) * iw;
    const iy2 = iY + 18 + Math.floor(i / 2) * 52;
    els.push(rect(ix, iy2, iw - 8, 46, SURF2, { r: 8 }));
    els.push(txt(String(issue.count), ix + 10, iy2 + 7, 20, issue.color, { w: 700 }));
    els.push(txt(issue.label, ix + 10, iy2 + 30, 10, MUTED, { width: iw - 20 }));
    els.push(circle(ix + iw - 24, iy2 + 23, 6, issue.color));
  });

  els.push(...bottomNav('insights'));
  return pen('screen3', '03 — Insights', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — AI Agents control center
// ─────────────────────────────────────────────────────────────────────────────
function screen4() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  els.push(txt('AI Agents', 20, 44, 20, TEXT, { w: 700 }));
  els.push(txt('3 active  ·  1 idle', 20, 66, 11, MUTED));

  // Hero: primary agent card
  els.push(rect(20, 82, W - 40, 124, SURF2, { r: 14, stroke: EMERALD, strokeWidth: 1 }));
  // Glowing agent icon
  els.push(circle(52, 132, 28, EMGLOW));
  els.push(circle(52, 132, 22, EMSOFT2, { stroke: EMERALD, strokeWidth: 1.5 }));
  els.push(txt('⟡', 52 - 9, 132 - 9, 18, EMERALD, { w: 600, width: 18, align: 'center' }));
  // Agent info
  els.push(txt('Gate Review Agent', 88, 98, 14, TEXT, { w: 700, width: W - 120 }));
  els.push(txt('● Active  ·  running', 88, 116, 10, EMERALD, { w: 500 }));
  els.push(txt('Reviewing 2 PRs  ·  last action 4 min ago', 88, 132, 10, MUTED, { width: W - 110 }));
  // Mini stats
  const as = [{ l: 'Reviewed', v: '47' }, { l: 'Fixed', v: '23' }, { l: 'Blocked', v: '4' }];
  const aw = (W - 60) / 3;
  as.forEach((a, i) => {
    const ax = 30 + aw * i;
    els.push(rect(ax, 164, aw - 6, 34, SURF3, { r: 8 }));
    els.push(txt(a.v, ax + 10, 170, 14, i < 2 ? EMERALD : CORAL, { w: 700 }));
    els.push(txt(a.l, ax + 10, 186, 9, MUTED, { width: aw - 16 }));
  });

  // Live log
  els.push(txt('Agent log', 20, 212, 12, TEXT, { w: 600 }));
  els.push(rect(W - 64, 208, 46, 18, EMSOFT2, { r: 9, stroke: EMERALD, strokeWidth: 1 }));
  els.push(txt('live', W - 64, 211, 10, EMERALD, { w: 600, width: 46, align: 'center' }));

  const logs = [
    { time: '12:02', msg: 'Detected Promise leak in rateLimit.ts:51', c: AMBER },
    { time: '12:01', msg: 'Generated fix suggestion · awaiting approval', c: EMERALD },
    { time: '11:58', msg: 'Completed review: feat/stream-cache · score 91', c: EMERALD },
    { time: '11:47', msg: 'Flagged security issue in auth/session.ts', c: CORAL },
    { time: '11:42', msg: 'Started review cycle · 3 PRs queued', c: EMERALD },
  ];
  let ly = 234;
  logs.forEach(log => {
    els.push(rect(20, ly, W - 40, 30, SURF2, { r: 6 }));
    els.push(circle(36, ly + 15, 4, log.c));
    els.push(txt(log.time, 46, ly + 9, 9, MUTED, { font: MONO, width: 32 }));
    els.push(txt(log.msg, 82, ly + 9, 10, TEXT, { width: W - 104, opacity: 0.85 }));
    ly += 34;
  });

  // Other agents
  els.push(txt('Other agents', 20, ly + 8, 12, TEXT, { w: 600 }));
  ly += 26;
  const agents = [
    { name: 'Style Enforcer',  desc: 'ESLint + Prettier auto-fix on merge',  status: 'active', icon: '◈' },
    { name: 'Dep Scanner',     desc: 'CVE checks + outdated packages',        status: 'active', icon: '◉' },
    { name: 'Release Drafter', desc: 'Auto-generates changelogs from PRs',    status: 'idle',   icon: '⊞' },
  ];
  agents.forEach(ag => {
    const sc = ag.status === 'active' ? EMERALD : MUTED;
    els.push(rect(20, ly, W - 40, 52, SURF2, { r: 10 }));
    els.push(circle(42, ly + 26, 18, EMSOFT2, { stroke: sc, strokeWidth: 1 }));
    els.push(txt(ag.icon, 42 - 8, ly + 26 - 8, 14, sc, { w: 600, width: 16, align: 'center' }));
    els.push(txt(ag.name, 70, ly + 10, 13, TEXT, { w: 600, width: W - 120 }));
    els.push(txt(ag.desc, 70, ly + 28, 10, MUTED, { width: W - 120 }));
    els.push(rect(W - 76, ly + 17, 48, 18, ag.status === 'active' ? EMSOFT : SURF3, { r: 9 }));
    els.push(txt(ag.status, W - 76, ly + 20, 9, sc, { w: 600, width: 48, align: 'center' }));
    ly += 58;
  });

  els.push(...bottomNav('agents'));
  return pen('screen4', '04 — AI Agents', BG, els);
}

// ── WRITE ────────────────────────────────────────────────────────────────────
const penFile = {
  version: '2.8',
  name: 'Gate — AI Code Intelligence',
  screens: [screen1(), screen2(), screen3(), screen4()],
};
fs.writeFileSync('gate.pen', JSON.stringify(penFile, null, 2));
console.log('✓ gate.pen written —', penFile.screens.length, 'screens');
