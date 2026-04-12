#!/usr/bin/env node
// HELIX — AI-powered code security intelligence for engineering teams
// Inspired by:
//   • Evervault "Customers" page (featured on godly.website) — deep space navy bg (rgb 1,3,20)
//     paired with cool lavender/periwinkle text (#DFE1F4), developer-security aesthetic
//   • VAST (Awwwards SOTD Apr 1 2026 by Antinomy Studio) — 2-color restraint principle
//     (#2A2C2F + #FF5623) — fewer colors = more premium signal
//   • Neon.tech (darkmodedesign.com) — "AI-era developer tooling" framing, pure dark bg, Inter
// Theme: DARK (CORD was light → rotating to dark)

const fs = require('fs');
const path = require('path');

const P = {
  bg:           '#050B1A',
  bgAlt:        '#080F22',
  surface:      '#0D1829',
  text:         '#DFE3F4',
  textMuted:    'rgba(223,227,244,0.50)',
  textSubtle:   'rgba(223,227,244,0.28)',
  accent:       '#7B5CFA',
  accent2:      '#36D9B4',
  accentGlow:   'rgba(123,92,250,0.18)',
  accent2Glow:  'rgba(54,217,180,0.15)',
  accentSoft:   'rgba(123,92,250,0.12)',
  accent2Soft:  'rgba(54,217,180,0.10)',
  border:       'rgba(223,227,244,0.08)',
  borderStrong: 'rgba(223,227,244,0.15)',
  borderAccent: 'rgba(123,92,250,0.30)',
  red:          '#F25767',
  orange:       '#F2924E',
  yellow:       '#F2C94C',
  green:        '#36D9B4',
  redSoft:      'rgba(242,87,103,0.12)',
  orangeSoft:   'rgba(242,146,78,0.12)',
  yellowSoft:   'rgba(242,201,76,0.10)',
  greenSoft:    'rgba(54,217,180,0.10)',
};

let _id = 0;
const uid = () => `c${++_id}`;

function rect(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: false, children: [], ...opts };
}
function text(x, y, w, content, fontSize, fill, opts = {}) {
  return { id: uid(), type: 'text', x, y, width: w, content, fontSize, fill, ...opts };
}
function ellipse(x, y, r, fill, opts = {}) {
  return { id: uid(), type: 'ellipse', x, y, width: r*2, height: r*2, fill, ...opts };
}
function pill(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: true, cornerRadius: h/2, children: [], ...opts };
}
function card(x, y, w, h, opts = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: h, fill: P.surface, clip: true,
    cornerRadius: opts.r || 12, borderColor: P.border, borderWidth: 1, children: [], ...opts };
}
function divLine(x, y, w) {
  return rect(x, y, w, 1, P.border);
}
function progressBar(x, y, w, pct, fill) {
  const track = rect(x, y, w, 4, P.border, { cornerRadius: 2 });
  track.children.push(rect(0, 0, Math.round(w * pct / 100), 4, fill, { cornerRadius: 2 }));
  return track;
}
function sparkBars(x, y, vals, maxVal, color) {
  const g = rect(x, y, vals.length * 6, 28, 'transparent', { clip: false });
  vals.forEach((v, i) => {
    const h = Math.round((v / maxVal) * 28);
    g.children.push(rect(i*6, 28-h, 4, h, color, { cornerRadius: 1 }));
  });
  return g;
}
function severityBadge(x, y, level) {
  const cfg = {
    CRITICAL: { bg: P.redSoft,    border: P.red,    fg: P.red    },
    HIGH:     { bg: P.orangeSoft, border: P.orange,  fg: P.orange  },
    MEDIUM:   { bg: P.yellowSoft, border: P.yellow,  fg: P.yellow  },
    LOW:      { bg: P.greenSoft,  border: P.green,   fg: P.green   },
  };
  const c = cfg[level] || cfg.LOW;
  const w = level === 'CRITICAL' ? 64 : level === 'MEDIUM' ? 58 : 44;
  const b = pill(x, y, w, 18, c.bg, { borderColor: c.border, borderWidth: 1 });
  b.children.push(text(8, 3, w-16, level, 8, c.fg, { fontWeight: 700, letterSpacing: 0.6 }));
  return b;
}
function confPill(x, y, pct) {
  const color = pct >= 90 ? P.accent2 : pct >= 70 ? P.accent : P.orange;
  const bg    = pct >= 90 ? P.accent2Soft : pct >= 70 ? P.accentSoft : P.orangeSoft;
  const b = pill(x, y, 56, 18, bg);
  b.children.push(text(6, 3, 44, `AI ${pct}%`, 8, color, { fontWeight: 700 }));
  return b;
}

function makeNav(W) {
  const nav = rect(0, 0, W, 52, P.bg, { borderColor: P.border, borderWidth: 1 });
  const dot = ellipse(18, 21, 5, P.accent);
  nav.children.push(dot);
  nav.children.push(text(30, 17, 60, 'HELIX', 14, P.text, { fontWeight: 700, letterSpacing: 1.2 }));
  const live = pill(96, 18, 46, 16, P.accent2Soft);
  live.children.push(ellipse(8, 4, 4, P.accent2));
  live.children.push(text(18, 3, 24, 'LIVE', 8, P.accent2, { fontWeight: 700, letterSpacing: 0.8 }));
  nav.children.push(live);
  nav.children.push(ellipse(W-30, 16, 12, P.accentGlow, { borderColor: P.borderAccent, borderWidth: 1.5 }));
  nav.children.push(text(W-38, 17, 24, 'KP', 9, P.accent, { fontWeight: 700 }));
  return nav;
}

function makeTabBar(W, active) {
  const tabs = [
    { icon: '◈', label: 'Pulse' },
    { icon: '⚠', label: 'Vulns' },
    { icon: '◑', label: 'Review' },
    { icon: '⬡', label: 'Intel' },
    { icon: '◎', label: 'Team' },
  ];
  const bar = rect(0, 0, W, 64, P.bg, { borderColor: P.border, borderTopWidth: 1 });
  const tw = W / tabs.length;
  tabs.forEach((t, i) => {
    const isA = i === active;
    const cx = i * tw + tw / 2;
    if (isA) {
      const ul = pill(cx-16, 6, 32, 3, P.accent);
      bar.children.push(ul);
    }
    bar.children.push(text(cx-8, 14, 16, t.icon, 14, isA ? P.accent : P.textSubtle, { fontWeight: isA ? 700 : 400 }));
    bar.children.push(text(cx-16, 34, 32, t.label, 9, isA ? P.accent : P.textSubtle, { fontWeight: isA ? 700 : 400 }));
  });
  return bar;
}

// SCREEN 1: PULSE
function screen1(W, H) {
  const s = rect(0, 0, W, H, P.bg);
  s.name = 'Pulse — Dashboard';
  s.children.push(makeNav(W));

  // Hero score
  const hero = card(16, 68, W-32, 162, { r: 16, fill: P.bgAlt, borderColor: P.borderAccent });
  hero.children.push(rect(0, 0, W-32, 162, P.accentGlow, { cornerRadius: 16 }));
  hero.children.push(text(20, 18, 160, 'SECURITY PULSE', 9, P.textMuted, { fontWeight: 700, letterSpacing: 1.2 }));
  hero.children.push(text(20, 34, 80, '94', 64, P.text, { fontWeight: 800 }));
  hero.children.push(text(80, 62, 60, '/ 100', 16, P.textMuted));
  hero.children.push(text(20, 110, 240, '↑ 3 pts from last scan · 2 min ago', 10, P.accent2, { fontWeight: 500 }));
  hero.children.push(sparkBars(W-32-100, 32, [60,70,55,80,72,88,94], 100, P.accent));
  hero.children.push(text(W-32-100, 62, 90, 'last 7 scans', 8, P.textSubtle));
  const aiP = pill(W-32-68, 112, 56, 20, P.accentGlow, { borderColor: P.borderAccent, borderWidth: 1 });
  aiP.children.push(text(10, 4, 40, '✦ AI', 9, P.accent, { fontWeight: 700 }));
  hero.children.push(aiP);
  s.children.push(hero);

  // Stats row
  const stats = [
    { label: 'Critical', value: '2', sub: 'open', color: P.red },
    { label: 'High', value: '7', sub: 'open', color: P.orange },
    { label: 'Resolved', value: '41', sub: 'this week', color: P.green },
  ];
  const sw = (W - 32 - 16) / 3;
  stats.forEach((st, i) => {
    const sc = card(16 + i*(sw+8), 246, sw, 76, { r: 12 });
    sc.children.push(text(14, 10, sw-20, st.label, 9, P.textMuted, { fontWeight: 600 }));
    sc.children.push(text(14, 26, 50, st.value, 28, st.color, { fontWeight: 800 }));
    sc.children.push(text(14, 56, sw-20, st.sub, 9, P.textSubtle));
    s.children.push(sc);
  });

  // Recent scans
  s.children.push(text(16, 336, 200, 'Recent Scans', 13, P.text, { fontWeight: 700 }));
  s.children.push(text(W-80, 338, 64, 'View all →', 11, P.accent, { fontWeight: 600 }));

  const scans = [
    { repo: 'api-gateway',   branch: 'main',       time: '2 min ago',  ok: true,  score: 97 },
    { repo: 'auth-service',  branch: 'feat/oauth',  time: '18 min ago', ok: false, score: 78 },
    { repo: 'ml-pipeline',   branch: 'main',       time: '1 hr ago',   ok: true,  score: 91 },
  ];
  scans.forEach((sc, i) => {
    const c = card(16, 360 + i*72, W-32, 60, { r: 10 });
    c.children.push(rect(0, 12, 3, 36, sc.ok ? P.green : P.orange, { cornerRadius: 2 }));
    c.children.push(text(18, 10, 160, sc.repo, 13, P.text, { fontWeight: 700 }));
    const bp = pill(18, 30, 100, 16, P.accentSoft);
    bp.children.push(text(7, 3, 86, `⎇ ${sc.branch}`, 8, P.textMuted, { fontWeight: 500 }));
    c.children.push(bp);
    c.children.push(text(W-32-48, 10, 48, `${sc.score}`, 22, sc.ok ? P.green : P.orange, { fontWeight: 800, align: 'right' }));
    c.children.push(text(W-32-56, 38, 56, sc.time, 9, P.textSubtle, { align: 'right' }));
    s.children.push(c);
  });

  s.children.push(Object.assign(rect(0, H-64, W, 64, P.bg), { children: [makeTabBar(W, 0)] }));
  return s;
}

// SCREEN 2: VULNERABILITIES
function screen2(W, H) {
  const s = rect(0, 0, W, H, P.bg);
  s.name = 'Vulnerabilities';
  s.children.push(makeNav(W));
  s.children.push(text(16, 66, W-32, 'Vulnerabilities', 22, P.text, { fontWeight: 800 }));
  s.children.push(text(16, 94, W-100, '11 open · sorted by risk', 12, P.textMuted));

  const filters = ['All', 'Critical', 'High', 'Medium'];
  filters.forEach((f, i) => {
    const isA = i === 0;
    const fc = pill(16 + i*70, 116, 62, 26, isA ? P.accentSoft : P.surface, { borderColor: isA ? P.accent : P.border, borderWidth: 1 });
    fc.children.push(text(10, 6, 44, f, 10, isA ? P.accent : P.textMuted, { fontWeight: isA ? 700 : 500 }));
    s.children.push(fc);
  });

  const vulns = [
    { id: 'CVE-2024-8291', title: 'SQL Injection',      pkg: 'sequelize@6.37',  file: 'src/db/query.ts:142',  sev: 'CRITICAL', conf: 97 },
    { id: 'CVE-2024-7104', title: 'Prototype Pollution', pkg: 'lodash@4.17.20',  file: 'lib/utils/merge.js:88', sev: 'HIGH',     conf: 91 },
    { id: 'CWE-89',        title: 'Improper Input',      pkg: 'express@4.18.2',  file: 'routes/search.ts:56',  sev: 'HIGH',     conf: 88 },
    { id: 'CVE-2024-6521', title: 'Path Traversal',      pkg: 'multer@1.4.5',    file: 'api/upload.ts:23',     sev: 'MEDIUM',   conf: 74 },
  ];
  const barClr = { CRITICAL: P.red, HIGH: P.orange, MEDIUM: P.yellow, LOW: P.green };

  vulns.forEach((v, i) => {
    const vc = card(16, 154 + i*100, W-32, 88, { r: 12 });
    vc.children.push(rect(0, 0, 3, 88, barClr[v.sev], { cornerRadius: 2 }));
    vc.children.push(text(16, 12, 180, v.title, 14, P.text, { fontWeight: 700 }));
    vc.children.push(severityBadge(W-32-70, 12, v.sev));
    vc.children.push(text(16, 32, 120, v.id, 10, P.textMuted, { fontWeight: 600, letterSpacing: 0.3 }));
    const pp = pill(16, 50, 140, 18, P.accentSoft);
    pp.children.push(text(8, 3, 124, v.pkg, 9, P.accent, { fontWeight: 600 }));
    vc.children.push(pp);
    vc.children.push(text(16, 72, W-80, v.file, 9, P.textSubtle));
    vc.children.push(confPill(W-32-60, 66, v.conf));
    s.children.push(vc);
  });

  s.children.push(Object.assign(rect(0, H-64, W, 64, P.bg), { children: [makeTabBar(W, 1)] }));
  return s;
}

// SCREEN 3: CODE REVIEW
function screen3(W, H) {
  const s = rect(0, 0, W, H, P.bg);
  s.name = 'AI Code Review';
  s.children.push(makeNav(W));
  s.children.push(text(16, 66, 24, '←', 16, P.textMuted));
  s.children.push(text(42, 66, 240, 'CVE-2024-8291 · SQL Injection', 13, P.text, { fontWeight: 700 }));
  s.children.push(severityBadge(W-88, 64, 'CRITICAL'));

  const fp = pill(16, 88, 220, 22, P.accentSoft);
  fp.children.push(text(10, 4, 200, '📁 src/db/query.ts · line 142', 9, P.accent, { fontWeight: 600 }));
  s.children.push(fp);

  // Code block
  const cb = card(16, 120, W-32, 150, { r: 10, fill: '#020810', borderColor: P.border });
  const lines = [
    { ln: '139', txt: 'async function getUser(id) {', clr: P.textMuted },
    { ln: '140', txt: "  const q = `SELECT * FROM",   clr: P.textMuted },
    { ln: '141', txt: "    users WHERE id='${id}'",    clr: P.red },
    { ln: '142', txt: '  return await db.query(q);',  clr: P.red },
    { ln: '143', txt: '}',                             clr: P.textMuted },
  ];
  lines.forEach((l, i) => {
    if (l.clr === P.red) cb.children.push(rect(0, 18+i*24, W-32, 24, 'rgba(242,87,103,0.08)'));
    cb.children.push(text(12, 22+i*24, 28, l.ln, 10, P.textSubtle, { fontWeight: 500 }));
    cb.children.push(text(44, 22+i*24, W-80, l.txt, 10, l.clr, { fontWeight: 500 }));
    if (l.clr === P.red) cb.children.push(text(W-60, 22+i*24, 20, '⚠', 11, P.red));
  });
  s.children.push(cb);

  // AI card
  const ai = card(16, 280, W-32, 142, { r: 12, borderColor: P.borderAccent });
  ai.children.push(rect(0, 0, W-32, 38, P.accentGlow, { cornerRadius: 12 }));
  ai.children.push(text(14, 12, 200, '✦ Helix AI Analysis', 12, P.accent, { fontWeight: 700 }));
  ai.children.push(confPill(W-32-68, 10, 97));
  ai.children.push(text(14, 48, W-60, 'Unsanitized `id` interpolated directly into raw SQL. Attacker can inject arbitrary SQL via user input.', 11, P.text, { fontWeight: 400 }));
  ai.children.push(divLine(14, 100, W-60));
  ai.children.push(text(14, 108, 200, '→ Use parameterized queries', 11, P.accent2, { fontWeight: 600 }));
  ai.children.push(text(14, 124, 220, 'e.g.  db.query(sql, [id])', 10, P.textSubtle));
  s.children.push(ai);

  // Buttons
  const btn1 = card(16, 434, (W-44)/2, 44, { r: 22, fill: P.accent, borderColor: 'transparent' });
  btn1.children.push(text(0, 13, (W-44)/2, 'Auto-Fix →', 14, '#fff', { fontWeight: 700, align: 'center' }));
  s.children.push(btn1);
  const btn2 = card(16+(W-44)/2+12, 434, (W-44)/2, 44, { r: 22 });
  btn2.children.push(text(0, 13, (W-44)/2, 'Dismiss', 14, P.textMuted, { fontWeight: 600, align: 'center' }));
  s.children.push(btn2);

  // Suggested fix
  s.children.push(text(16, 490, W-32, 'Suggested Fix', 12, P.text, { fontWeight: 700 }));
  const fb = card(16, 510, W-32, 88, { r: 10, fill: '#020810', borderColor: P.border });
  const flines = [
    { ln: '142', txt: '- return await db.query(q);',    clr: P.red   },
    { ln: '142', txt: "+ const sql='SELECT * FROM",      clr: P.green },
    { ln: '   ', txt: "+   users WHERE id = $1';",       clr: P.green },
    { ln: '   ', txt: '+ return await db.query(sql,[id])', clr: P.green },
  ];
  flines.forEach((l, i) => {
    fb.children.push(text(12, 10+i*18, 28, l.ln, 9, P.textSubtle, { fontWeight: 500 }));
    fb.children.push(text(44, 10+i*18, W-80, l.txt, 9, l.clr, { fontWeight: 500 }));
  });
  s.children.push(fb);

  s.children.push(Object.assign(rect(0, H-64, W, 64, P.bg), { children: [makeTabBar(W, 2)] }));
  return s;
}

// SCREEN 4: THREAT INTEL
function screen4(W, H) {
  const s = rect(0, 0, W, H, P.bg);
  s.name = 'Threat Intelligence';
  s.children.push(makeNav(W));
  s.children.push(text(16, 66, W-32, 'Threat Intelligence', 22, P.text, { fontWeight: 800 }));
  s.children.push(text(16, 94, W-32, 'Live signals · updated 30 sec ago', 12, P.textMuted));

  const banner = card(16, 116, W-32, 66, { r: 12, fill: P.orangeSoft, borderColor: P.orange });
  banner.children.push(text(14, 12, 200, '⚠ ELEVATED — THREAT LEVEL', 9, P.orange, { fontWeight: 700, letterSpacing: 1 }));
  banner.children.push(text(14, 28, W-60, 'New zero-day in Node.js vm module (CVE-2025-0182). Patch available.', 11, P.text, { fontWeight: 500 }));
  banner.children.push(text(W-80, 46, 64, 'Patch now →', 10, P.orange, { fontWeight: 700 }));
  s.children.push(banner);

  s.children.push(text(16, 196, W-32, 'Attack Vectors This Week', 12, P.text, { fontWeight: 700 }));
  const vectors = [
    { label: 'SQL Injection',     pct: 82, color: P.red    },
    { label: 'XSS',               pct: 64, color: P.orange },
    { label: 'Path Traversal',    pct: 48, color: P.yellow },
    { label: 'SSRF',              pct: 35, color: P.accent },
    { label: 'Prototype Pollut.', pct: 27, color: P.accent2 },
  ];
  vectors.forEach((v, i) => {
    s.children.push(text(16, 218+i*36, 140, v.label, 11, P.textMuted, { fontWeight: 500 }));
    s.children.push(progressBar(16, 236+i*36, W-80, v.pct, v.color));
    s.children.push(text(W-56, 230+i*36, 40, `${v.pct}%`, 11, v.color, { fontWeight: 700, align: 'right' }));
  });

  s.children.push(text(16, 404, 160, 'Live Feed', 13, P.text, { fontWeight: 700 }));

  const threats = [
    { title: 'Exploit attempt blocked', detail: 'api-gateway · automated bot scan',     time: '1 min',  color: P.red    },
    { title: 'Suspicious dep added',    detail: 'pr/1482 · node_modules override',      time: '14 min', color: P.orange },
    { title: 'Secret in commit',        detail: 'infra-provisioner · .env.bak',         time: '1 hr',   color: P.orange },
    { title: 'Dependency patched',      detail: 'axios@1.8.2 → 1.8.4 auto-merged',      time: '2 hr',   color: P.green  },
  ];
  threats.forEach((t, i) => {
    const tc = card(16, 428+i*72, W-32, 60, { r: 10 });
    tc.children.push(ellipse(20, 22, 5, t.color));
    tc.children.push(text(36, 10, W-100, t.title, 12, P.text, { fontWeight: 700 }));
    tc.children.push(text(36, 30, W-100, t.detail, 10, P.textMuted));
    tc.children.push(text(W-70, 22, 54, t.time, 10, P.textSubtle, { align: 'right' }));
    s.children.push(tc);
  });

  s.children.push(Object.assign(rect(0, H-64, W, 64, P.bg), { children: [makeTabBar(W, 3)] }));
  return s;
}

// SCREEN 5: TEAM
function screen5(W, H) {
  const s = rect(0, 0, W, H, P.bg);
  s.name = 'Team Exposure';
  s.children.push(makeNav(W));
  s.children.push(text(16, 66, W-32, 'Team Exposure', 22, P.text, { fontWeight: 800 }));
  s.children.push(text(16, 94, W-32, '5 members · 3 repos active', 12, P.textMuted));

  // Score card
  const sc = card(16, 116, W-32, 140, { r: 14, fill: P.bgAlt, borderColor: P.borderAccent });
  sc.children.push(ellipse(86, 30, 46, P.bg));
  sc.children.push(ellipse(86, 30, 40, 'transparent', { borderColor: P.green, borderWidth: 8 }));
  sc.children.push(rect(82, 22, 8, 28, P.red, { cornerRadius: 4 }));
  sc.children.push(rect(126, 50, 28, 8, P.orange, { cornerRadius: 4 }));
  sc.children.push(rect(82, 90, 8, 22, P.yellow, { cornerRadius: 4 }));
  sc.children.push(text(76, 55, 48, '94', 22, P.text, { fontWeight: 800, align: 'center' }));
  sc.children.push(text(68, 79, 64, 'score', 9, P.textMuted, { align: 'center' }));

  const legend = [{ c: P.red, l: 'Critical', v: '2' }, { c: P.orange, l: 'High', v: '7' }, { c: P.green, l: 'Clean', v: '41' }];
  legend.forEach((l, i) => {
    const lx = 170; const ly = 20+i*34;
    sc.children.push(ellipse(lx, ly+6, 5, l.c));
    sc.children.push(text(lx+14, ly, 80, l.l, 11, P.textMuted, { fontWeight: 500 }));
    sc.children.push(text(lx+100, ly, 40, l.v, 14, l.c, { fontWeight: 800, align: 'right' }));
  });
  s.children.push(sc);

  s.children.push(text(16, 272, 160, 'Members', 13, P.text, { fontWeight: 700 }));

  const members = [
    { name: 'Kira Patel', role: 'Lead Eng', repos: 4, score: 96, color: P.accent  },
    { name: 'Omar Diaz',  role: 'Backend',  repos: 3, score: 88, color: P.accent2 },
    { name: 'Nia Chen',   role: 'DevOps',   repos: 5, score: 91, color: P.orange  },
    { name: 'Lev Morin',  role: 'Frontend', repos: 2, score: 79, color: P.yellow  },
    { name: 'Sasha Kim',  role: 'ML Eng',   repos: 3, score: 85, color: P.accent  },
  ];
  members.forEach((m, i) => {
    const mc = card(16, 296+i*66, W-32, 54, { r: 10 });
    mc.children.push(ellipse(22, 17, 14, m.color + '33', { borderColor: m.color, borderWidth: 1.5 }));
    mc.children.push(text(14, 16, 22, m.name.charAt(0)+m.name.split(' ')[1].charAt(0), 9, m.color, { fontWeight: 700 }));
    mc.children.push(text(50, 8, 140, m.name, 12, P.text, { fontWeight: 700 }));
    mc.children.push(text(50, 26, 140, `${m.role} · ${m.repos} repos`, 10, P.textMuted));
    const sc2 = m.score >= 90 ? P.green : m.score >= 80 ? P.accent2 : P.yellow;
    mc.children.push(text(W-64, 16, 48, `${m.score}`, 20, sc2, { fontWeight: 800, align: 'right' }));
    s.children.push(mc);
  });

  s.children.push(Object.assign(rect(0, H-64, W, 64, P.bg), { children: [makeTabBar(W, 4)] }));
  return s;
}

// ASSEMBLE
const W = 390, H = 844;
const screens = [screen1, screen2, screen3, screen4, screen5].map((fn, i) => {
  const sc = fn(W, H);
  sc.x = 20 + i*(W+20);
  sc.y = 20;
  return sc;
});

const pen = {
  version: '2.8',
  name: 'Helix — AI Security Intelligence',
  width: W*5 + 120,
  height: H + 40,
  fill: '#020810',
  children: screens,
};

const out = path.join(__dirname, 'helix-sec.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ helix-sec.pen written (${(fs.statSync(out).size/1024).toFixed(1)} KB)`);
