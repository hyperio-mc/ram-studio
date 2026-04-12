'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'scope2';
const NAME = 'SCOPE';
const TAGLINE = 'observability that doesn\'t blink';
const HB = 20;

// Palette — dark mode, cinematic deep-space
const BG    = '#0B0D17';
const SURF  = '#111520';
const CARD  = '#161B2E';
const ACC   = '#FF6B35'; // neon orange — darkmodedesign.com 2026 trend
const ACC2  = '#22D3EE'; // electric cyan
const TEXT  = '#F5F7FF';
const MUTED = 'rgba(245,247,255,0.40)';
const SUC   = '#22C55E';
const WARN  = '#FFB366';
const ERR   = '#FF4D4D';

const W = 390, H = 844;

function rect(x,y,w,h,fill,opts={}) {
  const el = {type:'rect',x,y,width:w,height:h,fill};
  if (opts.rx)      el.rx      = opts.rx;
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  return el;
}
function text(x,y,content,size,fill,opts={}) {
  const el = {type:'text',x,y,content:String(content),fontSize:size,fill};
  if (opts.fw)     el.fontWeight  = opts.fw;
  if (opts.anchor) el.textAnchor  = opts.anchor;
  if (opts.ls)     el.letterSpacing = opts.ls;
  if (opts.opacity) el.opacity    = opts.opacity;
  if (opts.font)   el.fontFamily  = opts.font;
  return el;
}
function circle(cx,cy,r,fill,opts={}) {
  const el = {type:'circle',cx,cy,r,fill};
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  return el;
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  const el = {type:'line',x1,y1,x2,y2,stroke};
  if (opts.sw)      el.strokeWidth = opts.sw;
  if (opts.opacity) el.opacity     = opts.opacity;
  return el;
}

const screens = [];

// SCREEN 1: DASHBOARD
{
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(circle(60, 120, 80, ACC, {opacity:0.08}));
  e.push(circle(340, 300, 100, ACC2, {opacity:0.06}));
  e.push(text(20, 54, '9:41', 14, TEXT, {fw:600}));
  e.push(text(370, 54, '●●●', 10, TEXT, {anchor:'end', opacity:0.6}));
  e.push(text(20, 90, 'SCOPE', 22, TEXT, {fw:700, ls:3}));
  e.push(rect(356, 74, 14, 14, ACC, {rx:4, opacity:0.9}));
  e.push(circle(363, 81, 2, BG, {}));
  e.push(rect(20, 108, 350, 36, SURF, {rx:10}));
  e.push(rect(20, 108, 350, 36, 'none', {rx:10, stroke:'rgba(245,247,255,0.10)', sw:1}));
  e.push(text(50, 130, '⌘K Search systems, metrics, logs…', 12, MUTED, {}));
  e.push(text(35, 130, '⌘', 10, ACC, {opacity:0.7}));
  e.push(text(20, 162, 'SYSTEM HEALTH', 10, MUTED, {fw:600, ls:1.5}));
  const pills = [
    { label:'API',    status:'OK',   col:SUC },
    { label:'DB',     status:'OK',   col:SUC },
    { label:'Cache',  status:'WARN', col:WARN },
    { label:'Queue',  status:'OK',   col:SUC },
  ];
  pills.forEach((p, i) => {
    const px = 20 + i * 88;
    e.push(rect(px, 172, 80, 30, CARD, {rx:8}));
    e.push(rect(px, 172, 80, 30, 'none', {rx:8, stroke:p.col, sw:1, opacity:0.5}));
    e.push(circle(px+10, 187, 4, p.col, {}));
    e.push(text(px+20, 191, p.label, 11, TEXT, {fw:600}));
    e.push(text(px+20, 202, p.status, 9, p.col, {fw:500}));
  });
  const metrics = [
    { label:'UPTIME',   value:'99.98%', sub:'30-day avg',   col:SUC  },
    { label:'LATENCY',  value:'42ms',   sub:'p95 baseline', col:ACC2 },
    { label:'ERRORS',   value:'0.03%',  sub:'error rate',   col:ACC  },
    { label:'REQUESTS', value:'1.2M',   sub:'last hour',    col:TEXT },
  ];
  metrics.forEach((m, i) => {
    const col = i % 2 === 0 ? 20 : 205;
    const row = i < 2 ? 216 : 316;
    const cw = 165, ch = 88;
    e.push(rect(col, row, cw, ch, CARD, {rx:12}));
    e.push(rect(col, row, cw, ch, 'none', {rx:12, stroke:'rgba(245,247,255,0.06)', sw:1}));
    e.push(circle(col + 40, row + 38, 24, m.col, {opacity:0.12}));
    e.push(text(col+14, row+22, m.label, 9, MUTED, {fw:600, ls:1.2}));
    e.push(text(col+14, row+50, m.value, 24, m.col, {fw:700}));
    e.push(text(col+14, row+68, m.sub, 10, MUTED, {}));
  });
  e.push(text(20, 416, 'REQUEST VOLUME', 10, MUTED, {fw:600, ls:1.5}));
  e.push(rect(20, 426, 350, 90, CARD, {rx:12}));
  e.push(rect(20, 426, 350, 90, 'none', {rx:12, stroke:'rgba(245,247,255,0.06)', sw:1}));
  const vals = [55,70,48,62,75,80,60,85,72,65,88,92,78,95,82,70,60,74,86,90];
  vals.forEach((v, i) => {
    const bx = 30 + i*16;
    const bh = (v/100) * 60;
    const by = 426 + 20 + (60 - bh);
    const isLast = i === vals.length - 1;
    e.push(rect(bx, by, 10, bh, isLast ? ACC : ACC2, {rx:3, opacity: isLast ? 0.9 : 0.55}));
  });
  e.push(text(30, 522, '00:00', 9, MUTED, {}));
  e.push(text(350, 522, 'now', 9, ACC, {anchor:'end'}));
  e.push(text(20, 542, 'RECENT INCIDENTS', 10, MUTED, {fw:600, ls:1.5}));
  const incidents = [
    { sev:'P2', svc:'Cache', msg:'High memory usage on cache-03', dur:'12m ago', col:WARN },
    { sev:'P3', svc:'API',   msg:'Elevated 503 rate on /v2/search', dur:'1h ago', col:ACC },
  ];
  incidents.forEach((inc, i) => {
    const iy = 552 + i * 62;
    e.push(rect(20, iy, 350, 54, SURF, {rx:10}));
    e.push(rect(20, iy, 4, 54, inc.col, {rx:2}));
    e.push(rect(28, iy+10, 28, 16, inc.col, {rx:4, opacity:0.18}));
    e.push(text(30, iy+22, inc.sev, 10, inc.col, {fw:700}));
    e.push(text(62, iy+22, inc.svc, 12, TEXT, {fw:600}));
    e.push(text(62, iy+36, inc.msg, 10, MUTED, {}));
    e.push(text(366, iy+22, inc.dur, 10, MUTED, {anchor:'end'}));
    e.push(circle(356, iy+36, 4, inc.col, {opacity:0.6}));
  });
  e.push(rect(0, 790, W, 54, SURF, {}));
  e.push(line(0, 790, W, 790, 'rgba(245,247,255,0.08)', {sw:1}));
  const navItems = [
    {label:'Home', x:40, active:true},
    {label:'Alerts', x:118, active:false},
    {label:'Services', x:200, active:false},
    {label:'Logs', x:278, active:false},
    {label:'Settings', x:354, active:false},
  ];
  navItems.forEach(n => {
    e.push(circle(n.x, 810, 4, n.active ? ACC : MUTED, {opacity: n.active ? 1 : 0.5}));
    e.push(text(n.x, 830, n.label, 9, n.active ? ACC : MUTED, {anchor:'middle', fw: n.active ? 600 : 400}));
  });
  screens.push({name:'Dashboard', svg:'', elements:e});
}

// SCREEN 2: ALERTS
{
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(circle(200, 200, 180, ERR, {opacity:0.04}));
  e.push(text(20, 54, '9:41', 14, TEXT, {fw:600}));
  e.push(text(370, 54, '●●●', 10, TEXT, {anchor:'end', opacity:0.6}));
  e.push(text(20, 90, 'Alerts', 24, TEXT, {fw:700}));
  e.push(rect(110, 76, 28, 18, ERR, {rx:9, opacity:0.9}));
  e.push(text(124, 89, '3', 11, '#fff', {anchor:'middle', fw:700}));
  const chips = ['All', 'P1', 'P2', 'Resolved'];
  chips.forEach((c, i) => {
    const cx = 20 + i * 78;
    const active = i === 0;
    e.push(rect(cx, 104, 70, 26, active ? ACC : 'none', {rx:13, opacity: active ? 0.15 : 1}));
    e.push(rect(cx, 104, 70, 26, 'none', {rx:13, stroke: active ? ACC : 'rgba(245,247,255,0.15)', sw:1}));
    e.push(text(cx+35, 121, c, 11, active ? ACC : MUTED, {anchor:'middle', fw: active ? 600 : 400}));
  });
  const alerts = [
    { sev:'P1', title:'Database replication lag', svc:'PostgreSQL', time:'2m ago', col:ERR, status:'FIRING', detail:'Lag: 8.4s (threshold: 2s)' },
    { sev:'P2', title:'Cache memory > 90%', svc:'Redis Cluster', time:'12m ago', col:WARN, status:'FIRING', detail:'Heap: 91.2% of 16GB' },
    { sev:'P2', title:'High error rate on /search', svc:'API Gateway', time:'1h ago', col:ACC, status:'FIRING', detail:'503 rate: 2.1% (SLO: 0.5%)' },
    { sev:'P3', title:'Certificate expiring soon', svc:'Load Balancer', time:'3h ago', col:ACC2, status:'WARN', detail:'Expires in 14 days' },
    { sev:'P3', title:'Disk usage warning', svc:'Log Storage', time:'5h ago', col:ACC2, status:'WARN', detail:'83% used on /var/log' },
  ];
  alerts.forEach((al, i) => {
    const ay = 146 + i * 116;
    e.push(rect(20, ay, 350, 108, CARD, {rx:12}));
    e.push(rect(20, ay, 4, 108, al.col, {rx:2}));
    e.push(rect(30, ay+10, 28, 18, al.col, {rx:4, opacity:0.2}));
    e.push(text(44, ay+23, al.sev, 10, al.col, {anchor:'middle', fw:700}));
    const spx = 350 - 12;
    e.push(rect(spx-30, ay+10, 42, 18, al.col, {rx:9, opacity:0.15}));
    e.push(text(spx-9, ay+23, al.status, 9, al.col, {anchor:'middle', fw:600}));
    e.push(text(64, ay+24, al.title, 13, TEXT, {fw:600}));
    e.push(text(64, ay+40, al.svc, 11, MUTED, {}));
    e.push(text(64, ay+56, al.detail, 11, MUTED, {}));
    e.push(text(30, ay+76, al.time, 10, MUTED, {}));
    e.push(rect(200, ay+70, 72, 26, 'none', {rx:6, stroke:'rgba(245,247,255,0.12)', sw:1}));
    e.push(text(236, ay+87, 'Silence', 10, MUTED, {anchor:'middle'}));
    e.push(rect(280, ay+70, 82, 26, al.col, {rx:6, opacity:0.2}));
    e.push(rect(280, ay+70, 82, 26, 'none', {rx:6, stroke:al.col, sw:1, opacity:0.4}));
    e.push(text(321, ay+87, 'Acknowledge', 10, al.col, {anchor:'middle', fw:600}));
  });
  e.push(rect(0, 790, W, 54, SURF, {}));
  e.push(line(0, 790, W, 790, 'rgba(245,247,255,0.08)', {sw:1}));
  [{label:'Home', x:40, active:false},{label:'Alerts', x:118, active:true},{label:'Services', x:200, active:false},{label:'Logs', x:278, active:false},{label:'Settings', x:354, active:false}].forEach(n => {
    e.push(circle(n.x, 810, 4, n.active ? ACC : MUTED, {opacity: n.active ? 1 : 0.5}));
    e.push(text(n.x, 830, n.label, 9, n.active ? ACC : MUTED, {anchor:'middle', fw: n.active ? 600 : 400}));
  });
  screens.push({name:'Alerts', svg:'', elements:e});
}

// SCREEN 3: SERVICES
{
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(circle(320, 150, 120, ACC2, {opacity:0.05}));
  e.push(text(20, 54, '9:41', 14, TEXT, {fw:600}));
  e.push(text(370, 54, '●●●', 10, TEXT, {anchor:'end', opacity:0.6}));
  e.push(text(20, 90, 'Services', 24, TEXT, {fw:700}));
  e.push(rect(20, 104, 350, 44, SURF, {rx:10}));
  e.push(rect(30, 112, 200, 10, SUC, {rx:3, opacity:0.8}));
  e.push(rect(232, 112, 50, 10, WARN, {rx:3, opacity:0.8}));
  e.push(rect(284, 112, 76, 10, 'rgba(245,247,255,0.1)', {rx:3}));
  e.push(text(30, 138, '8 healthy', 10, SUC, {}));
  e.push(text(140, 138, '2 degraded', 10, WARN, {}));
  e.push(text(270, 138, '1 down', 10, ERR, {}));
  const svcs = [
    { name:'API Gateway',      version:'v3.12.1', lat:'42ms',  err:'0.02%', status:'OK',   uptime:'100%',   dep:2, col:SUC  },
    { name:'Auth Service',     version:'v2.8.0',  lat:'28ms',  err:'0.00%', status:'OK',   uptime:'100%',   dep:1, col:SUC  },
    { name:'User Service',     version:'v4.1.3',  lat:'61ms',  err:'0.05%', status:'OK',   uptime:'99.98%', dep:3, col:SUC  },
    { name:'Cache Cluster',    version:'v7.0.15', lat:'3ms',   err:'0.00%', status:'WARN', uptime:'99.91%', dep:0, col:WARN },
    { name:'Search Engine',    version:'v8.12.0', lat:'156ms', err:'2.10%', status:'WARN', uptime:'99.40%', dep:2, col:WARN },
    { name:'Notification Svc', version:'v1.9.2',  lat:'—',     err:'—',     status:'DOWN', uptime:'0%',     dep:1, col:ERR  },
  ];
  svcs.forEach((s, i) => {
    const sy = 162 + i * 100;
    e.push(rect(20, sy, 350, 92, CARD, {rx:12}));
    e.push(rect(20, sy, 350, 92, 'none', {rx:12, stroke:s.col, sw:1, opacity:0.2}));
    e.push(circle(38, sy+20, 6, s.col, {}));
    e.push(circle(38, sy+20, 12, s.col, {opacity:0.15}));
    e.push(text(54, sy+25, s.name, 14, TEXT, {fw:700}));
    e.push(text(54, sy+40, s.version, 11, MUTED, {}));
    e.push(rect(290, sy+12, 60, 18, s.col, {rx:9, opacity:0.15}));
    e.push(rect(290, sy+12, 60, 18, 'none', {rx:9, stroke:s.col, sw:1, opacity:0.4}));
    e.push(text(320, sy+25, s.status, 10, s.col, {anchor:'middle', fw:600}));
    e.push(text(30, sy+58, 'Latency', 9, MUTED, {}));
    e.push(text(30, sy+72, s.lat, 12, TEXT, {fw:600}));
    e.push(text(120, sy+58, 'Errors', 9, MUTED, {}));
    e.push(text(120, sy+72, s.err, 12, TEXT, {fw:600}));
    e.push(text(210, sy+58, 'Uptime', 9, MUTED, {}));
    e.push(text(210, sy+72, s.uptime, 12, TEXT, {fw:600}));
    e.push(text(300, sy+58, 'Deps', 9, MUTED, {}));
    e.push(text(300, sy+72, String(s.dep), 12, TEXT, {fw:600}));
  });
  e.push(rect(0, 790, W, 54, SURF, {}));
  e.push(line(0, 790, W, 790, 'rgba(245,247,255,0.08)', {sw:1}));
  [{label:'Home', x:40},{label:'Alerts', x:118},{label:'Services', x:200, a:true},{label:'Logs', x:278},{label:'Settings', x:354}].forEach(n => {
    e.push(circle(n.x, 810, 4, n.a ? ACC : MUTED, {opacity: n.a ? 1 : 0.5}));
    e.push(text(n.x, 830, n.label, 9, n.a ? ACC : MUTED, {anchor:'middle', fw: n.a ? 600 : 400}));
  });
  screens.push({name:'Services', svg:'', elements:e});
}

// SCREEN 4: LOGS
{
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(circle(195, 420, 200, ACC, {opacity:0.03}));
  e.push(text(20, 54, '9:41', 14, TEXT, {fw:600}));
  e.push(text(370, 54, '●●●', 10, TEXT, {anchor:'end', opacity:0.6}));
  e.push(text(20, 90, 'Logs', 24, TEXT, {fw:700}));
  e.push(circle(78, 83, 5, ERR, {}));
  e.push(circle(78, 83, 9, ERR, {opacity:0.2}));
  e.push(text(92, 88, 'LIVE', 10, ERR, {fw:700, ls:1.5}));
  e.push(rect(20, 104, 350, 32, SURF, {rx:8}));
  e.push(rect(20, 104, 350, 32, 'none', {rx:8, stroke:'rgba(245,247,255,0.08)', sw:1}));
  e.push(text(40, 124, '🔍  Filter logs…', 12, MUTED, {}));
  e.push(rect(310, 108, 52, 24, 'none', {rx:6, stroke:'rgba(245,247,255,0.12)', sw:1}));
  e.push(text(336, 124, '⌘K', 10, MUTED, {anchor:'middle'}));
  const lvls = [
    {l:'ALL', c:TEXT, active:true}, {l:'ERROR', c:ERR}, {l:'WARN', c:WARN}, {l:'INFO', c:ACC2}
  ];
  lvls.forEach((lv, i) => {
    const lx = 20 + i*82;
    e.push(rect(lx, 144, 74, 22, lv.active ? lv.c : 'none', {rx:11, opacity:lv.active ? 0.15 : 1}));
    e.push(rect(lx, 144, 74, 22, 'none', {rx:11, stroke: lv.active ? lv.c : 'rgba(245,247,255,0.12)', sw:1}));
    e.push(text(lx+37, 159, lv.l, 10, lv.active ? lv.c : MUTED, {anchor:'middle', fw: lv.active ? 600 : 400}));
  });
  const logs = [
    { t:'09:41:22.841', lvl:'ERR',  svc:'postgres', msg:'replication_lag exceeded threshold: 8437ms', c:ERR },
    { t:'09:41:21.203', lvl:'WARN', svc:'redis',    msg:'memory_used_bytes 14.8GB / 16GB (92.5%)',  c:WARN },
    { t:'09:41:20.887', lvl:'INFO', svc:'api',      msg:'GET /v2/search 200 42ms agent=mobile',     c:ACC2 },
    { t:'09:41:20.441', lvl:'ERR',  svc:'api',      msg:'GET /v2/search 503 timeout upstream=search',c:ERR },
    { t:'09:41:19.992', lvl:'INFO', svc:'auth',     msg:'user_login uid=82741 method=oauth2',        c:ACC2 },
    { t:'09:41:19.551', lvl:'INFO', svc:'api',      msg:'POST /v1/orders 201 28ms',                  c:ACC2 },
    { t:'09:41:18.871', lvl:'WARN', svc:'queue',    msg:'consumer_lag topic=events lag=14201',       c:WARN },
    { t:'09:41:18.330', lvl:'INFO', svc:'notify',   msg:'SMS delivered uid=55123 provider=twilio',   c:ACC2 },
    { t:'09:41:17.008', lvl:'ERR',  svc:'notify',   msg:'connection_refused host=smtp.internal:587', c:ERR },
    { t:'09:41:16.543', lvl:'INFO', svc:'api',      msg:'GET /v1/users 200 18ms',                   c:ACC2 },
  ];
  logs.forEach((log, i) => {
    const ly = 178 + i * 58;
    e.push(rect(20, ly, 350, 52, CARD, {rx:8}));
    e.push(rect(26, ly+8, 36, 16, log.c, {rx:4, opacity:0.2}));
    e.push(text(44, ly+19, log.lvl, 9, log.c, {anchor:'middle', fw:700}));
    e.push(rect(68, ly+8, 52, 16, SURF, {rx:4}));
    e.push(text(94, ly+19, log.svc, 9, MUTED, {anchor:'middle'}));
    e.push(text(350, ly+19, log.t, 9, MUTED, {anchor:'end', opacity:0.6}));
    e.push(text(26, ly+38, log.msg.length > 52 ? log.msg.slice(0,52)+'…' : log.msg, 10, TEXT, {}));
  });
  e.push(rect(0, 790, W, 54, SURF, {}));
  e.push(line(0, 790, W, 790, 'rgba(245,247,255,0.08)', {sw:1}));
  [{label:'Home', x:40},{label:'Alerts', x:118},{label:'Services', x:200},{label:'Logs', x:278, a:true},{label:'Settings', x:354}].forEach(n => {
    e.push(circle(n.x, 810, 4, n.a ? ACC : MUTED, {opacity: n.a ? 1 : 0.5}));
    e.push(text(n.x, 830, n.label, 9, n.a ? ACC : MUTED, {anchor:'middle', fw: n.a ? 600 : 400}));
  });
  screens.push({name:'Logs', svg:'', elements:e});
}

// SCREEN 5: INCIDENTS
{
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(circle(60, 500, 150, WARN, {opacity:0.04}));
  e.push(text(20, 54, '9:41', 14, TEXT, {fw:600}));
  e.push(text(370, 54, '●●●', 10, TEXT, {anchor:'end', opacity:0.6}));
  e.push(text(20, 90, 'Incidents', 24, TEXT, {fw:700}));
  e.push(rect(300, 74, 70, 30, ACC, {rx:8, opacity:0.9}));
  e.push(text(335, 93, '+ New', 11, BG, {anchor:'middle', fw:700}));
  e.push(rect(20, 110, 350, 72, CARD, {rx:12}));
  e.push(rect(20, 110, 350, 72, 'none', {rx:12, stroke:ERR, sw:1.5, opacity:0.6}));
  e.push(circle(34, 130, 8, ERR, {}));
  e.push(circle(34, 130, 14, ERR, {opacity:0.15}));
  e.push(text(52, 126, 'ACTIVE INCIDENT — INC-0047', 11, ERR, {fw:700, ls:0.5}));
  e.push(text(52, 142, 'Database replication lag > 8s', 13, TEXT, {fw:600}));
  e.push(text(52, 158, 'Commander: Sarah K. · 12 min elapsed', 11, MUTED, {}));
  e.push(text(350, 165, 'Join →', 11, ACC, {anchor:'end', fw:600}));
  e.push(text(20, 200, 'TIMELINE', 10, MUTED, {fw:600, ls:1.5}));
  const events = [
    { t:'09:41', type:'DETECTED',  msg:'Automated detection via PagerDuty rule', col:ERR,  active:true },
    { t:'09:38', type:'ALERT',     msg:'P1 alert fired — replication_lag > 2s', col:ERR,  active:false },
    { t:'09:35', type:'COMMIT',    msg:'Deploy: postgres-15.2 config patch', col:WARN, active:false },
    { t:'09:29', type:'METRICS',   msg:'Lag crossed 500ms — early warning', col:WARN, active:false },
    { t:'09:15', type:'DEPLOY',    msg:'Infra: promoted replica-02 to primary', col:ACC2, active:false },
    { t:'08:52', type:'RESOLVED',  msg:'INC-0046 resolved — 34min MTTR', col:SUC,  active:false },
  ];
  events.forEach((ev, i) => {
    const ey = 218 + i * 88;
    if (i < events.length - 1) {
      e.push(line(38, ey+16, 38, ey+88, 'rgba(245,247,255,0.12)', {sw:1}));
    }
    e.push(circle(38, ey+8, 7, ev.col, {opacity: ev.active ? 1 : 0.5}));
    if (ev.active) e.push(circle(38, ey+8, 14, ev.col, {opacity:0.15}));
    e.push(rect(58, ey, 302, 78, ev.active ? CARD : SURF, {rx:10}));
    if (ev.active) e.push(rect(58, ey, 302, 78, 'none', {rx:10, stroke:ev.col, sw:1, opacity:0.3}));
    e.push(rect(66, ey+8, 70, 16, ev.col, {rx:4, opacity:0.15}));
    e.push(text(101, ey+19, ev.type, 9, ev.col, {anchor:'middle', fw:600}));
    e.push(text(356, ey+19, ev.t, 10, MUTED, {anchor:'end'}));
    e.push(text(66, ey+38, ev.msg, 11, TEXT, {}));
    e.push(text(66, ey+54, i === 0 ? '2 responders on call' : '— automated', 10, MUTED, {}));
  });
  e.push(rect(0, 790, W, 54, SURF, {}));
  e.push(line(0, 790, W, 790, 'rgba(245,247,255,0.08)', {sw:1}));
  [{label:'Home', x:40},{label:'Alerts', x:118, a:true},{label:'Services', x:200},{label:'Logs', x:278},{label:'Settings', x:354}].forEach(n => {
    e.push(circle(n.x, 810, 4, n.a ? ACC : MUTED, {opacity: n.a ? 1 : 0.5}));
    e.push(text(n.x, 830, n.label, 9, n.a ? ACC : MUTED, {anchor:'middle', fw: n.a ? 600 : 400}));
  });
  screens.push({name:'Incidents', svg:'', elements:e});
}

// SCREEN 6: SETTINGS
{
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(circle(195, 160, 140, ACC, {opacity:0.06}));
  e.push(text(20, 54, '9:41', 14, TEXT, {fw:600}));
  e.push(text(370, 54, '●●●', 10, TEXT, {anchor:'end', opacity:0.6}));
  e.push(text(20, 90, 'Settings', 24, TEXT, {fw:700}));
  e.push(rect(20, 110, 350, 100, CARD, {rx:16}));
  e.push(rect(20, 110, 350, 100, 'none', {rx:16, stroke:'rgba(245,247,255,0.06)', sw:1}));
  e.push(circle(62, 160, 30, SURF, {}));
  e.push(circle(62, 160, 30, 'none', {stroke:ACC, sw:2, opacity:0.6}));
  e.push(text(62, 165, 'SK', 16, ACC, {anchor:'middle', fw:700}));
  e.push(text(104, 150, 'Sarah Kim', 16, TEXT, {fw:700}));
  e.push(text(104, 168, 'SRE Lead · Acme Corp', 12, MUTED, {}));
  e.push(rect(104, 180, 66, 20, ACC2, {rx:10, opacity:0.15}));
  e.push(rect(104, 180, 66, 20, 'none', {rx:10, stroke:ACC2, sw:1, opacity:0.4}));
  e.push(text(137, 194, 'ON-CALL', 9, ACC2, {anchor:'middle', fw:700}));
  e.push(text(350, 194, 'Edit →', 11, ACC, {anchor:'end', fw:600}));
  e.push(text(20, 228, 'NOTIFICATIONS', 10, MUTED, {fw:600, ls:1.5}));
  const notifs = [
    { label:'P1 Alerts', desc:'Immediate — call + SMS', on:true },
    { label:'P2 Alerts', desc:'Within 5 minutes', on:true },
    { label:'P3 Alerts', desc:'Batched hourly digest', on:false },
    { label:'Weekly Report', desc:'Monday 9AM summary', on:true },
  ];
  notifs.forEach((n, i) => {
    const ny = 242 + i * 60;
    e.push(rect(20, ny, 350, 52, SURF, {rx:10}));
    e.push(line(20, ny+52, 370, ny+52, 'rgba(245,247,255,0.04)', {sw:1}));
    e.push(text(30, ny+20, n.label, 13, TEXT, {fw:600}));
    e.push(text(30, ny+36, n.desc, 11, MUTED, {}));
    const tx = 330, ty = ny+20;
    e.push(rect(tx, ty, 32, 18, n.on ? ACC : SURF, {rx:9, opacity:n.on ? 0.9 : 1}));
    if (!n.on) e.push(rect(tx, ty, 32, 18, 'none', {rx:9, stroke:'rgba(245,247,255,0.15)', sw:1}));
    e.push(circle(n.on ? tx+22 : tx+10, ty+9, 7, n.on ? BG : MUTED, {}));
  });
  e.push(text(20, 488, 'INTEGRATIONS', 10, MUTED, {fw:600, ls:1.5}));
  const integrations = [
    { name:'PagerDuty', status:'Connected', col:SUC },
    { name:'Slack #incidents', status:'Connected', col:SUC },
    { name:'Datadog Metrics', status:'Connected', col:SUC },
    { name:'Jira Projects', status:'Configure', col:ACC },
  ];
  integrations.forEach((intg, i) => {
    const iy = 502 + i * 56;
    e.push(rect(20, iy, 350, 48, SURF, {rx:10}));
    e.push(circle(36, iy+24, 6, intg.col, {}));
    e.push(text(52, iy+28, intg.name, 13, TEXT, {fw:600}));
    e.push(rect(290, iy+14, 72, 20, intg.col, {rx:10, opacity:0.15}));
    e.push(rect(290, iy+14, 72, 20, 'none', {rx:10, stroke:intg.col, sw:1, opacity:0.4}));
    e.push(text(326, iy+28, intg.status, 10, intg.col, {anchor:'middle', fw:600}));
    e.push(line(20, iy+48, 370, iy+48, 'rgba(245,247,255,0.04)', {sw:1}));
  });
  e.push(rect(20, 730, 350, 44, 'none', {rx:10, stroke:ERR, sw:1, opacity:0.3}));
  e.push(text(195, 756, 'Sign Out', 13, ERR, {anchor:'middle', fw:600}));
  e.push(rect(0, 790, W, 54, SURF, {}));
  e.push(line(0, 790, W, 790, 'rgba(245,247,255,0.08)', {sw:1}));
  [{label:'Home', x:40},{label:'Alerts', x:118},{label:'Services', x:200},{label:'Logs', x:278},{label:'Settings', x:354, a:true}].forEach(n => {
    e.push(circle(n.x, 810, 4, n.a ? ACC : MUTED, {opacity: n.a ? 1 : 0.5}));
    e.push(text(n.x, 830, n.label, 9, n.a ? ACC : MUTED, {anchor:'middle', fw: n.a ? 600 : 400}));
  });
  screens.push({name:'Settings', svg:'', elements:e});
}

// WRITE PEN FILE
const total = screens.reduce((s, sc) => s + sc.elements.length, 0);
const pen = {
  version: '2.8',
  metadata: {
    name: NAME, author: 'RAM', date: new Date().toISOString(),
    theme: 'dark', heartbeat: HB, elements: total,
    slug: SLUG, tagline: TAGLINE,
  },
  screens,
};
fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
