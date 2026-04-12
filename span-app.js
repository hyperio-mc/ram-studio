/**
 * SPAN — Distributed Trace & API Intelligence
 * Dark theme: deep space navy + indigo + cyan
 * Inspired by: darkmodedesign.com featuring Linear & Midday —
 * the 2025-26 trend of #040612 deep-space backgrounds with
 * indigo+cyan dual-accent dev tool SaaS UIs.
 * RAM Design Heartbeat — 2026-03-28
 */

const fs = require('fs');

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#040612',
  surface:  '#0B1120',
  surface2: '#111827',
  border:   'rgba(99,102,241,0.18)',
  border2:  'rgba(148,163,184,0.08)',
  accent:   '#6366F1',
  accent2:  '#22D3EE',
  ind10:    'rgba(99,102,241,0.10)',
  ind20:    'rgba(99,102,241,0.22)',
  cyan10:   'rgba(34,211,238,0.10)',
  success:  '#10B981',
  warn:     '#F59E0B',
  danger:   '#EF4444',
  violet:   '#A78BFA',
  text:     '#E2E8F0',
  textDim:  '#94A3B8',
  textFaint:'rgba(148,163,184,0.45)',
  white:    '#FFFFFF',
};

let eid = 0;
const id = () => `e${++eid}`;

function r(x, y, w, h, fill, opts = {}) {
  return { id: id(), type: 'rect', x, y, w, h, fill, ...opts };
}
function t(x, y, str, size, weight, fill, opts = {}) {
  return { id: id(), type: 'text', x, y, text: str, fontSize: size, fontWeight: weight, fill, ...opts };
}
function dot(x, y, color, radius = 4) {
  return r(x - radius, y - radius, radius*2, radius*2, color, { rx: radius });
}
function card(x, y, w, h, opts = {}) {
  return r(x, y, w, h, opts.fill || C.surface, { rx: opts.rx || 16, stroke: opts.stroke || C.border, strokeWidth: 1 });
}
function pill(x, y, w, h, bg, label, fg, fs = 11) {
  return [
    r(x, y, w, h, bg, { rx: h / 2 }),
    t(x + w/2, y + h/2 + 4, label, fs, '700', fg, { textAlign: 'center' }),
  ];
}
function div(y, opacity = 0.08) {
  return r(0, y, 390, 1, `rgba(148,163,184,${opacity})`);
}
function bar(x, y, w, h, pct, track, fill) {
  return [
    r(x, y, w, h, track, { rx: h/2 }),
    r(x, y, Math.max(Math.round(w*pct), 3), h, fill, { rx: h/2 }),
  ];
}

function navBar(active) {
  const items = ['⎈','⟁','◫','⚑','⚙'];
  const labels = ['Home','Requests','Traces','Alerts','Settings'];
  const els = [];
  els.push(r(0, 784, 390, 60, C.surface, { stroke: C.border2, strokeWidth: 1 }));
  els.push(r(160, 836, 70, 4, 'rgba(148,163,184,0.35)', { rx: 2 }));
  items.forEach((icon, i) => {
    const cx = 39 + i * 78;
    const on = i === active;
    const fg = on ? C.accent : C.textFaint;
    if (on) {
      els.push(r(cx - 22, 788, 44, 36, C.ind10, { rx: 10 }));
      els.push(r(cx - 14, 787, 28, 2, C.accent, { rx: 1 }));
    }
    els.push(t(cx, 806, icon, 20, '400', fg, { textAlign: 'center' }));
    els.push(t(cx, 824, labels[i], 9, on ? '700' : '500', fg, { textAlign: 'center' }));
  });
  return els;
}

function statusBar() {
  return [
    t(20, 18, '9:41', 15, '600', C.textDim),
    t(370, 18, '● ▲ ▮▮▮', 11, '400', C.textDim, { textAlign: 'right' }),
  ];
}

// ─── Screen 1: Dashboard ─────────────────────────────────────────────────────
function s1() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  // Glow blooms
  els.push(r(60, -60, 270, 160, 'rgba(99,102,241,0.07)', { rx: 80 }));
  els.push(r(240, 300, 140, 140, 'rgba(34,211,238,0.04)', { rx: 70 }));
  els.push(...statusBar());

  // Header
  els.push(t(20, 52, 'SPAN', 11, '800', C.accent));
  els.push(t(20, 72, 'API Health', 28, '800', C.text));
  els.push(t(20, 104, 'prod-us-east-1  ·  last 24h', 13, '400', C.textDim));
  els.push(...pill(294, 66, 64, 24, 'rgba(16,185,129,0.12)', '● LIVE', C.success, 11));

  // Health score card
  els.push(card(16, 122, 358, 112, { rx: 20 }));
  els.push(r(16, 122, 3, 112, C.accent, { rx: 1 }));
  els.push(r(16, 122, 358, 112, 'rgba(99,102,241,0.05)', { rx: 20 }));
  els.push(t(34, 148, 'SYSTEM HEALTH SCORE', 9, '700', C.accent));
  els.push(t(34, 180, '98.7', 48, '800', C.white));
  els.push(t(104, 178, '/100', 16, '600', C.textDim));
  els.push(t(34, 225, 'All systems operational  ·  Zero incidents today', 12, '400', C.textDim));
  // Spark line
  const sv = [48,42,51,39,44,40,43,41,43,42,40,41];
  sv.forEach((v, i) => {
    els.push(r(218 + i*11, 218-v+40, 6, Math.max(v-36,2), `rgba(99,102,241,0.6)`, { rx: 2 }));
  });

  // Stat row
  const stats = [
    { l:'REQ / MIN',   v:'2,841', d:'+12%',  c: C.success },
    { l:'P99 LATENCY', v:'142ms', d:'-8ms',   c: C.success },
    { l:'ERROR RATE',  v:'0.04%', d:'↓0.01', c: C.success },
  ];
  stats.forEach((s, i) => {
    const x = 16 + i * 122;
    els.push(card(x, 250, 118, 84, { rx: 14 }));
    els.push(t(x+12, 270, s.l, 8, '700', C.textDim));
    els.push(t(x+12, 296, s.v, 22, '800', C.text));
    els.push(t(x+12, 320, s.d, 11, '600', s.c));
  });

  // Endpoints section
  els.push(t(20, 354, 'TOP ENDPOINTS', 9, '700', C.textDim));
  els.push(t(344, 354, 'All →', 12, '600', C.accent, { textAlign: 'right' }));

  const mC = { GET: C.accent2, POST: C.violet, DELETE: '#F87171', PATCH: C.warn };
  const eps = [
    { m:'GET',    p:'/api/v2/users',          rps:'840',  p99:'48ms',  err: false },
    { m:'POST',   p:'/api/v2/events',          rps:'1.2k', p99:'89ms',  err: false },
    { m:'GET',    p:'/api/v2/analytics/daily', rps:'312',  p99:'210ms', err: true  },
    { m:'DELETE', p:'/api/v2/sessions/:id',    rps:'28',   p99:'34ms',  err: false },
  ];
  eps.forEach((ep, i) => {
    const y = 370 + i * 90;
    const mc = mC[ep.m] || C.textDim;
    const strokeC = ep.err ? 'rgba(245,158,11,0.30)' : C.border;
    const fillC   = ep.err ? 'rgba(245,158,11,0.04)' : C.surface;
    els.push(r(16, y, 358, 76, fillC, { rx: 14, stroke: strokeC, strokeWidth: 1 }));
    els.push(r(28, y+14, 42, 18, `${mc}22`, { rx: 9 }));
    els.push(t(49, y+27, ep.m, 9, '700', mc, { textAlign: 'center' }));
    els.push(t(80, y+27, ep.p.length > 26 ? ep.p.slice(0,26)+'…' : ep.p, 13, '500', C.text));
    els.push(t(80, y+50, `${ep.rps} req/s`, 11, '500', C.textDim));
    els.push(t(192, y+50, `P99 ${ep.p99}`, 11, '500', ep.err ? C.warn : C.textDim));
    const dc = ep.err ? C.warn : C.success;
    els.push(dot(355, y+24, dc, 4));
    els.push(...bar(80, y+64, 258, 3, ep.err ? 0.65 : 0.92, C.border2, mc));
  });

  els.push(...navBar(0));
  return { id: 's1', name: 'Dashboard', backgroundColor: C.bg, elements: els };
}

// ─── Screen 2: Requests Live Feed ────────────────────────────────────────────
function s2() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(r(180, -30, 120, 80, 'rgba(34,211,238,0.05)', { rx: 40 }));
  els.push(...statusBar());

  els.push(t(20, 52, 'REQUESTS', 11, '700', C.accent2));
  els.push(t(20, 72, 'Live Feed', 28, '800', C.text));

  // Filter pills
  const filters = [['All',36,true], ['GET',40,false], ['POST',46,false], ['Errors',56,false]];
  let fx = 20;
  filters.forEach(([label, w, on]) => {
    els.push(r(fx, 108, w, 26, on ? C.accent : 'transparent', { rx: 13, stroke: on ? 'transparent' : C.border, strokeWidth: 1 }));
    els.push(t(fx+w/2, 125, label, 12, on?'700':'500', on?C.white:C.textDim, { textAlign: 'center' }));
    fx += w + 10;
  });
  // Search
  els.push(r(278, 106, 96, 28, C.surface, { rx: 14, stroke: C.border, strokeWidth: 1 }));
  els.push(t(295, 124, '⌕', 13, '400', C.textDim));
  els.push(t(312, 124, 'Search', 12, '400', C.textFaint));

  els.push(div(143));
  els.push(t(20, 156, '⟳ Streaming — 2,841 req/min', 11, '500', C.textDim));
  els.push(dot(350, 158, C.success, 3));
  els.push(t(355, 161, 'live', 10, '600', C.success));

  const mC = { GET: C.accent2, POST: C.violet, DELETE: '#F87171', PATCH: C.warn };
  const sc = s => s < 300 ? C.success : s < 400 ? C.warn : C.danger;
  const reqs = [
    { m:'GET',    p:'/api/v2/users?limit=20',     s:200, ms:31,  ip:'54.2.11.9',   ago:'0.1s' },
    { m:'POST',   p:'/api/v2/events',              s:201, ms:88,  ip:'203.0.2.44',  ago:'0.3s' },
    { m:'GET',    p:'/api/v2/analytics/daily',     s:200, ms:214, ip:'10.0.0.12',   ago:'0.5s' },
    { m:'GET',    p:'/api/v2/health',               s:200, ms:5,   ip:'35.180.4.2',  ago:'0.6s' },
    { m:'POST',   p:'/api/v2/webhooks',             s:422, ms:44,  ip:'198.51.0.3',  ago:'0.9s' },
    { m:'DELETE', p:'/api/v2/sessions/abc123',      s:204, ms:29,  ip:'54.2.11.9',   ago:'1.1s' },
    { m:'GET',    p:'/api/v2/users/me',              s:401, ms:11,  ip:'45.33.0.8',   ago:'1.4s' },
  ];

  reqs.forEach((req, i) => {
    const y = 170 + i * 84;
    const isErr = req.s >= 400;
    const mc = mC[req.m] || C.textDim;
    const stc = sc(req.s);
    els.push(r(16, y, 358, 72, isErr ? 'rgba(239,68,68,0.04)' : C.surface, {
      rx: 14, stroke: isErr ? 'rgba(239,68,68,0.22)' : C.border, strokeWidth: 1
    }));
    els.push(r(28, y+10, 42, 18, `${mc}22`, { rx: 9 }));
    els.push(t(49, y+23, req.m, 9, '700', mc, { textAlign: 'center' }));
    els.push(r(82, y+10, 36, 18, `${stc}22`, { rx: 9 }));
    els.push(t(100, y+23, `${req.s}`, 10, '700', stc, { textAlign: 'center' }));
    const pp = req.p.length > 26 ? req.p.slice(0,26)+'…' : req.p;
    els.push(t(128, y+23, pp, 12, '500', C.text));
    const latC = req.ms > 200 ? C.warn : req.ms > 80 ? '#FBBF24' : C.success;
    els.push(t(28, y+52, `${req.ms}ms`, 12, '700', latC));
    els.push(t(80, y+52, req.ip, 11, '400', C.textDim));
    els.push(t(344, y+52, req.ago + ' ago', 10, '400', C.textFaint, { textAlign: 'right' }));
    const bw = Math.min(req.ms / 2.5, 80);
    els.push(r(234, y+49, 80, 5, 'rgba(148,163,184,0.07)', { rx: 2 }));
    els.push(r(234, y+49, bw, 5, latC, { rx: 2 }));
  });

  els.push(...navBar(1));
  return { id: 's2', name: 'Requests', backgroundColor: C.bg, elements: els };
}

// ─── Screen 3: Trace Waterfall ────────────────────────────────────────────────
function s3() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(...statusBar());

  els.push(t(20, 50, '← Requests', 13, '500', C.accent));
  els.push(t(20, 76, 'Trace', 28, '800', C.text));
  els.push(t(20, 108, 'POST /api/v2/events  ·  trace_8af3d', 12, '400', C.textDim));

  // Summary card
  els.push(card(16, 124, 358, 68, { rx: 16 }));
  const sumStats = [
    { l:'TOTAL', v:'88ms' }, { l:'SPANS', v:'6' }, { l:'STATUS', v:'201' }, { l:'SVC', v:'4' }
  ];
  sumStats.forEach((s, i) => {
    const x = 32 + i * 88;
    els.push(t(x, 144, s.l, 8, '700', C.textDim));
    const vc = s.l === 'STATUS' ? C.success : s.l === 'TOTAL' ? C.text : C.text;
    els.push(t(x, 168, s.v, s.l === 'STATUS' ? 15 : 18, '800', vc));
  });

  // Waterfall
  els.push(div(204));
  els.push(t(20, 218, 'SPAN', 8, '700', C.textDim));
  els.push(t(188, 218, 'TIMELINE (0 ————————— 88ms)', 8, '600', C.textDim));
  els.push(t(356, 218, 'MS', 8, '700', C.textDim, { textAlign: 'right' }));
  els.push(div(230));

  const spans = [
    { n:'http.request',    svc:'gateway',    s:0,  d:88, depth:0, c:C.accent  },
    { n:'auth.verify',     svc:'auth-svc',   s:2,  d:12, depth:1, c:C.violet  },
    { n:'db.query.users',  svc:'postgres',   s:14, d:8,  depth:2, c:C.accent2 },
    { n:'events.validate', svc:'events-api', s:22, d:18, depth:1, c:C.violet  },
    { n:'queue.publish',   svc:'rabbitmq',   s:40, d:24, depth:2, c:C.accent2 },
    { n:'http.response',   svc:'gateway',    s:64, d:24, depth:0, c:C.accent  },
  ];
  const total = 88, bw = 152, bx = 188;
  spans.forEach((sp, i) => {
    const y = 242 + i * 88;
    const indent = sp.depth * 14;
    if (i % 2 === 0) els.push(r(16, y-2, 358, 84, 'rgba(148,163,184,0.025)', { rx: 10 }));
    els.push(t(20 + indent, y+18, sp.n, 12, '600', C.text));
    els.push(t(20 + indent, y+38, sp.svc, 10, '400', C.textDim));
    // Bar track
    els.push(r(bx, y+10, bw, 22, 'rgba(148,163,184,0.07)', { rx: 4 }));
    // Bar fill
    const fx2 = bx + (sp.s / total) * bw;
    const fw = Math.max((sp.d / total) * bw, 5);
    els.push(r(fx2, y+10, fw, 22, sp.c, { rx: 4 }));
    // Span start label inside
    if (sp.s > 0) els.push(t(fx2+2, y+24, `${sp.s}ms`, 8, '600', 'rgba(255,255,255,0.6)'));
    // Duration
    els.push(t(356, y+22, `${sp.d}ms`, 11, '700', C.textDim, { textAlign: 'right' }));
    els.push(div(y+82, 0.05));
  });

  els.push(...navBar(2));
  return { id: 's3', name: 'Traces', backgroundColor: C.bg, elements: els };
}

// ─── Screen 4: Alerts ────────────────────────────────────────────────────────
function s4() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(r(80, -20, 230, 120, 'rgba(239,68,68,0.05)', { rx: 60 }));
  els.push(...statusBar());

  els.push(t(20, 52, 'ALERTS', 11, '700', C.danger));
  els.push(t(20, 72, 'Anomaly Detection', 26, '800', C.text));
  els.push(...pill(276, 64, 76, 26, 'rgba(239,68,68,0.14)', '1 FIRING', C.danger, 11));

  // Active alert banner
  els.push(r(16, 108, 358, 58, 'rgba(239,68,68,0.07)', { rx: 14, stroke: 'rgba(239,68,68,0.28)', strokeWidth: 1 }));
  els.push(r(16, 108, 3, 58, C.danger, { rx: 1 }));
  els.push(dot(36, 128, C.danger, 4));
  els.push(t(50, 128, 'P99 latency on /analytics exceeded 200ms', 12, '700', C.text));
  els.push(t(50, 148, 'Firing 4 min  ·  Ack by @jess', 10, '400', C.textDim));

  els.push(t(20, 182, 'RULES', 9, '700', C.textDim));
  els.push(t(344, 182, '+ New', 12, '600', C.accent, { textAlign: 'right' }));

  const rules = [
    { n:'High Error Rate',   cond:'error_rate > 1%',     state:'ok'     },
    { n:'Slow P99 Latency',  cond:'p99_ms > 200ms',      state:'firing' },
    { n:'Request Spike',     cond:'rps increase > 300%', state:'ok'     },
    { n:'Low Availability',  cond:'uptime < 99.9%',      state:'ok'     },
    { n:'5xx Burst',         cond:'5xx > 20 per 5min',   state:'ok'     },
  ];
  rules.forEach((rule, i) => {
    const y = 200 + i * 100;
    const fire = rule.state === 'firing';
    els.push(r(16, y, 358, 84, fire ? 'rgba(239,68,68,0.05)' : C.surface, {
      rx: 14, stroke: fire ? 'rgba(239,68,68,0.28)' : C.border, strokeWidth: 1
    }));
    els.push(r(16, y, 3, 84, fire ? C.danger : C.success, { rx: 1 }));
    els.push(t(34, y+24, rule.n, 14, '700', C.text));
    const lBg = fire ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.12)';
    const lFg = fire ? C.danger : C.success;
    els.push(...pill(fire ? 270 : 282, y+16, fire ? 66 : 54, 22, lBg, fire ? 'FIRING' : 'OK', lFg, 10));
    els.push(t(34, y+48, rule.cond, 12, '400', C.textDim));
    // Toggle
    els.push(r(314, y+56, 34, 18, C.accent, { rx: 9 }));
    els.push(r(330, y+58, 14, 14, C.white, { rx: 7 }));
    // Notify channel
    els.push(t(34, y+68, '→ Slack #alerts', 10, '400', C.textFaint));
  });

  els.push(...navBar(3));
  return { id: 's4', name: 'Alerts', backgroundColor: C.bg, elements: els };
}

// ─── Screen 5: Settings / API Keys ───────────────────────────────────────────
function s5() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(...statusBar());

  els.push(t(20, 52, 'SETTINGS', 11, '700', C.textDim));
  els.push(t(20, 72, 'Workspace', 26, '800', C.text));

  // Org card
  els.push(card(16, 110, 358, 68, { rx: 16 }));
  els.push(r(32, 124, 42, 42, C.ind20, { rx: 12 }));
  els.push(t(53, 150, 'A', 18, '800', C.accent, { textAlign: 'center' }));
  els.push(t(88, 136, 'Acme Corp', 15, '700', C.text));
  els.push(t(88, 157, 'prod-us-east-1  ·  Pro', 12, '400', C.textDim));
  els.push(t(356, 144, '›', 18, '400', C.textDim, { textAlign: 'right' }));

  // API Keys
  els.push(t(20, 196, 'API KEYS', 9, '700', C.textDim));
  els.push(t(344, 196, '+ New', 12, '600', C.accent, { textAlign: 'right' }));

  const keys = [
    { n:'Production SDK',   tok:'span_live_••••••••••d4f9', used:'2 min ago',   scope:'read / write' },
    { n:'CI / Alerting',    tok:'span_live_••••••••••7a3c', used:'1 hr ago',    scope:'read only'    },
    { n:'Analytics Export', tok:'span_live_••••••••••9b1d', used:'3 days ago',  scope:'read only'    },
  ];
  keys.forEach((k, i) => {
    const y = 214 + i * 94;
    els.push(card(16, y, 358, 80, { rx: 14 }));
    els.push(r(28, y+14, 36, 38, C.ind10, { rx: 10 }));
    els.push(t(46, y+36, '⚷', 16, '400', C.accent, { textAlign: 'center' }));
    els.push(t(76, y+26, k.n, 14, '700', C.text));
    els.push(t(76, y+46, k.tok, 11, '500', C.textDim));
    els.push(t(76, y+64, `Last used ${k.used}  ·  ${k.scope}`, 10, '400', C.textFaint));
    els.push(t(354, y+38, '⧉', 15, '400', C.textDim, { textAlign: 'right' }));
  });

  // Integrations
  els.push(t(20, 504, 'INTEGRATIONS', 9, '700', C.textDim));
  const intgs = [
    { n:'PagerDuty',      i:'🔔', ok: true  },
    { n:'Slack',          i:'💬', ok: true  },
    { n:'Datadog',        i:'🐶', ok: false },
    { n:'GitHub Actions', i:'⚙',  ok: true  },
  ];
  intgs.forEach((intg, i) => {
    const y = 522 + i * 60;
    els.push(div(y-2, 0.06));
    els.push(t(22, y+20, intg.i, 18, '400', C.text));
    els.push(t(54, y+20, intg.n, 14, '600', C.text));
    const sc = intg.ok ? C.success : C.textDim;
    els.push(dot(240, y+20, sc, 3));
    els.push(t(250, y+24, intg.ok ? 'Connected' : 'Not connected', 11, '500', sc));
    els.push(t(356, y+24, '›', 16, '400', C.textDim, { textAlign: 'right' }));
  });

  els.push(...navBar(4));
  return { id: 's5', name: 'Settings', backgroundColor: C.bg, elements: els };
}

// ─── Write ────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'SPAN',
    description: 'Distributed Trace & API Intelligence — deep navy + indigo + cyan',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['developer-tools', 'api', 'tracing', 'dark', 'dashboard', 'saas', 'indigo'],
  },
  screens: [s1(), s2(), s3(), s4(), s5()],
  theme: {
    primary:    C.accent,
    background: C.bg,
    surface:    C.surface,
    text:       C.text,
    accent:     C.accent2,
  },
};

fs.writeFileSync('/workspace/group/design-studio/span.pen', JSON.stringify(pen, null, 2));
const elCount = pen.screens.reduce((n, s) => n + s.elements.length, 0);
console.log(`✓ span.pen written — ${pen.screens.length} screens, ${elCount} elements`);
