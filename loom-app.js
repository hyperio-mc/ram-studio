'use strict';
// loom-app.js — LOOM · Visual AI Workflow Builder · Dark Indigo theme

const fs   = require('fs');
const path = require('path');

const W = 375, H = 812;

const C = {
  bg: '#060810', surface: '#0D0F1E', surface2: '#13162A', border: '#1C2038',
  text: '#E4E8FF', muted: '#5A6080', accent: '#7B6FFF', accentBg: '#1A1640',
  accent2: '#4AE8A4', acc2Bg: '#0A2318', amber: '#FFB347', amberBg: '#281800',
  red: '#FF5577', redBg: '#280A14', blue: '#50B8FF', blueBg: '#081828',
  pink: '#FF7AC6', pinkBg: '#280A20',
};

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rectangle', x, y, width: w, height: h, fill, radius: opts.r ?? 0, stroke: opts.stroke, strokeWidth: opts.sw ?? 1 };
}
function txt(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), fontSize: size, fill, fontWeight: opts.bold ? 700 : opts.semi ? 600 : opts.med ? 500 : 400, fontFamily: opts.mono ? 'JetBrains Mono' : 'Inter', textAlign: opts.align ?? 'left', letterSpacing: opts.ls ?? 0 };
}
function pill(x, y, w, h, fill, label, labelColor, fs2 = 9) {
  return [rect(x, y, w, h, fill, { r: h / 2 }), txt(x + w / 2, y + h / 2 + fs2 * 0.36, label, fs2, labelColor, { bold: true, align: 'center', ls: 0.2 })];
}
function statusBar() {
  return [rect(0, 0, W, 44, C.bg), txt(16, 28, '9:41', 13, C.text, { bold: true }), txt(W - 16, 28, '◾◾◾', 9, C.muted, { align: 'right' })];
}
function bottomNav(active) {
  const tabs = [{ icon: '⬡', lbl: 'Flows' }, { icon: '⌬', lbl: 'Build' }, { icon: '◈', lbl: 'Runs' }, { icon: '⊞', lbl: 'Hub' }];
  const tw = W / 4;
  const out = [rect(0, H - 80, W, 80, C.surface, { stroke: C.border, sw: 1 })];
  tabs.forEach((t, i) => {
    const cx = i * tw + tw / 2;
    const on = i === active;
    out.push(txt(cx, H - 52, t.icon, 18, on ? C.accent : C.muted, { align: 'center' }));
    out.push(txt(cx, H - 28, t.lbl, 9, on ? C.accent : C.muted, { align: 'center', semi: on }));
    if (on) out.push(rect(cx - 14, H - 80, 28, 2, C.accent, { r: 1 }));
  });
  return out;
}

function flowRow(x, y, name, desc, dot, dotColor, meta) {
  return [
    rect(x, y, W - 32, 56, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(x + 44, y + 20, name, 12, C.text, { semi: true }),
    txt(x + 44, y + 35, desc, 9, C.muted, { mono: true }),
    txt(x + 44, y + 48, meta, 8, dotColor),
    rect(x + 14, y + 17, 22, 22, C.surface2, { r: 6 }),
    txt(x + 25, y + 32, dot, 10, dotColor, { align: 'center' }),
  ];
}

function screen1() {
  const sw = (W - 44) / 3;
  return [
    rect(0, 0, W, H, C.bg), ...statusBar(),
    txt(20, 74, 'LOOM', 18, C.text, { bold: true, ls: 2 }),
    txt(20, 92, 'AI Workflow Platform', 10, C.muted, { ls: 0.5 }),
    ...pill(W - 86, 64, 74, 22, C.accentBg, '✦ 8 Running', C.accent, 9),
    rect(16, 108, W - 32, 88, C.surface2, { r: 14, stroke: C.accent, sw: 1 }),
    txt(28, 132, 'Executions Today', 10, C.muted, { ls: 0.5 }),
    txt(28, 168, '12,847', 34, C.text, { bold: true }),
    txt(28, 188, '▲ +18.4% vs yesterday', 10, C.accent2),
    txt(W - 40, 168, '98.7%', 20, C.accent2, { bold: true, align: 'right' }),
    txt(W - 40, 185, 'success', 9, C.muted, { align: 'right' }),
    rect(16, 206, sw, 52, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(16 + sw / 2, 228, '34', 18, C.text, { bold: true, align: 'center' }),
    txt(16 + sw / 2, 246, 'Active Flows', 8, C.muted, { align: 'center' }),
    rect(22 + sw, 206, sw, 52, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(22 + sw + sw / 2, 228, '1.4s', 18, C.text, { bold: true, align: 'center' }),
    txt(22 + sw + sw / 2, 246, 'Avg Duration', 8, C.muted, { align: 'center' }),
    rect(28 + sw * 2, 206, sw, 52, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(28 + sw * 2 + sw / 2, 228, '4.2M', 18, C.text, { bold: true, align: 'center' }),
    txt(28 + sw * 2 + sw / 2, 246, 'AI Tokens', 8, C.muted, { align: 'center' }),
    txt(20, 272, 'RECENT WORKFLOWS', 9, C.muted, { bold: true, ls: 1.5 }),
    ...flowRow(16, 286, 'Support Triage', 'webhook → gpt-4o → jira', '●', C.accent2, '3.2K runs/day'),
    ...flowRow(16, 350, 'Content Pipeline', 'rss → summarize → slack', '●', C.accent2, '247 runs/day'),
    ...flowRow(16, 414, 'Code Review Bot', 'github → claude → pr', '◎', C.amber, '89 runs/day'),
    ...flowRow(16, 478, 'Lead Enricher', 'crm → research → email', '○', C.muted, 'Paused'),
    rect(16, 546, (W - 44) / 2, 40, C.accentBg, { r: 10, stroke: C.accent, sw: 1 }),
    txt(16 + (W - 44) / 4, 570, '+ New Flow', 12, C.accent, { bold: true, align: 'center' }),
    rect(16 + (W - 44) / 2 + 12, 546, (W - 44) / 2, 40, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(16 + (W - 44) / 2 + 12 + (W - 44) / 4, 570, '⊞ Templates', 12, C.muted, { align: 'center' }),
    ...bottomNav(0),
  ].flat();
}

function nodeEl(x, y, w, h, bg, borderColor, title, sub, selected) {
  const out = [
    rect(x, y, w, h, bg, { r: 10, stroke: selected ? borderColor : C.border, sw: selected ? 2 : 1 }),
    txt(x + w / 2, y + h / 2 - 2, title, 10, selected ? borderColor : C.text, { bold: true, align: 'center' }),
    txt(x + w / 2, y + h / 2 + 12, sub, 8, C.muted, { align: 'center' }),
  ];
  return out;
}

function arrowLine(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return [rect(mx - 1, y1, 2, y2 - y1, C.border, { r: 1 }), rect(mx - 3, y2 - 5, 6, 6, C.border, { r: 3 })];
}

function screen2() {
  return [
    rect(0, 0, W, H, C.bg), ...statusBar(),
    txt(20, 70, '← Flows', 12, C.accent, { semi: true }),
    txt(20, 90, 'Support Triage', 16, C.text, { bold: true }),
    ...pill(W - 80, 64, 68, 22, C.acc2Bg, '● Running', C.accent2, 9),
    rect(0, 108, W, H - 188, C.bg),
    ...nodeEl(W/2-56, 124, 112, 50, C.pinkBg, C.pink, '⚡ Webhook', 'HTTP Trigger', false),
    ...arrowLine(W/2, 174, W/2, 206),
    ...nodeEl(W/2-56, 206, 112, 50, C.blueBg, C.blue, '⊕ Extract', 'JSON Parser', false),
    ...arrowLine(W/2, 256, W/2, 288),
    ...nodeEl(W/2-64, 288, 128, 60, C.accentBg, C.accent, '✦ GPT-4o', 'AI · Classify & Route', true),
    rect(W/2-65, 285, 130, 66, 'transparent', { r: 12, stroke: C.accent, sw: 1 }),
    ...arrowLine(W/2-28, 348, 98, 388),
    ...arrowLine(W/2+28, 348, W-98, 388),
    ...nodeEl(48, 388, 100, 48, C.blueBg, C.blue, '◎ Jira', 'Create ticket', false),
    ...nodeEl(W-148, 388, 100, 48, C.pinkBg, C.pink, '◎ Slack', 'Notify team', false),
    ...arrowLine(98, 436, W/2-48, 468),
    ...arrowLine(W-98, 436, W/2+48, 468),
    ...nodeEl(W/2-48, 468, 96, 40, C.acc2Bg, C.accent2, '✓ Done', 'End of flow', false),
    rect(0, H - 188, W, 108, C.surface2, { r: 0, stroke: C.border, sw: 1 }),
    rect(0, H - 188, W, 2, C.accent),
    txt(20, H-162, 'GPT-4o · Configuration', 12, C.accent, { semi: true }),
    txt(20, H-142, 'Model', 9, C.muted),
    ...pill(90, H-156, 80, 20, C.accentBg, 'gpt-4o-mini', C.accent, 8),
    txt(20, H-118, 'Prompt', 9, C.muted),
    rect(20, H-108, W-40, 22, C.surface, { r: 6, stroke: C.border, sw: 1 }),
    txt(28, H-93, 'Classify this support ticket as...', 9, C.muted, { mono: true }),
    txt(W-28, H-96, '✎', 11, C.accent, { align: 'right' }),
    ...bottomNav(1),
  ].flat();
}

function runRow(x, y, id, status, dur, tokens, time) {
  const sColor = status === 'success' ? C.accent2 : status === 'failed' ? C.red : C.amber;
  const sBg = status === 'success' ? C.acc2Bg : status === 'failed' ? C.redBg : C.amberBg;
  const sLabel = status === 'success' ? '✓ OK' : status === 'failed' ? '✕ Fail' : '⚡ Slow';
  return [
    rect(x, y, W-32, 54, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(x+14, y+20, id, 12, C.text, { semi: true, mono: true }),
    txt(x+14, y+36, time, 9, C.muted),
    txt(x+14, y+50, dur + ' · ' + tokens, 9, C.muted, { mono: true }),
    ...pill(W-x-62, y+16, 50, 22, sBg, sLabel, sColor, 9),
  ];
}

function screen3() {
  return [
    rect(0, 0, W, H, C.bg), ...statusBar(),
    txt(20, 74, 'Run History', 18, C.text, { bold: true }),
    txt(20, 92, 'Support Triage · Last 24h', 10, C.muted),
    rect(16, 108, W-32, 56, C.surface2, { r: 12, stroke: C.border, sw: 1 }),
    txt(40, 130, '3,204', 18, C.text, { bold: true, align: 'center' }),
    txt(40, 146, 'Total', 8, C.muted, { align: 'center' }),
    txt(W/2, 130, '3,170', 18, C.accent2, { bold: true, align: 'center' }),
    txt(W/2, 146, 'Success', 8, C.muted, { align: 'center' }),
    txt(W-40, 130, '34', 18, C.red, { bold: true, align: 'center' }),
    txt(W-40, 146, 'Failed', 8, C.muted, { align: 'center' }),
    rect(16, 168, W-32, 6, C.redBg, { r: 3 }),
    rect(16, 168, (W-32) * 0.989, 6, C.accent2, { r: 3 }),
    ...pill(16, 184, 40, 22, C.accentBg, 'All', C.accent, 9),
    ...pill(62, 184, 58, 22, C.acc2Bg, 'Success', C.accent2, 9),
    ...pill(126, 184, 46, 22, C.surface, 'Failed', C.muted, 9),
    ...pill(178, 184, 44, 22, C.surface, 'Slow', C.muted, 9),
    txt(20, 218, 'EXECUTIONS', 9, C.muted, { bold: true, ls: 1.5 }),
    ...runRow(16, 232, '#3204', 'success', '1.2s', '847 tok', '2m ago'),
    ...runRow(16, 294, '#3203', 'success', '0.9s', '621 tok', '3m ago'),
    ...runRow(16, 356, '#3202', 'failed', '—', '—', '4m ago'),
    ...runRow(16, 418, '#3201', 'success', '2.1s', '1.2K tok', '6m ago'),
    ...runRow(16, 480, '#3200', 'success', '1.4s', '903 tok', '7m ago'),
    ...runRow(16, 542, '#3199', 'slow', '8.4s', '4.1K tok', '9m ago'),
    ...bottomNav(2),
  ].flat();
}

function screen4() {
  return [
    rect(0, 0, W, H, C.bg), ...statusBar(),
    txt(20, 70, '← Canvas', 12, C.accent, { semi: true }),
    txt(20, 90, 'GPT-4o Node', 18, C.text, { bold: true }),
    ...pill(W-96, 64, 84, 22, C.acc2Bg, '✓ Connected', C.accent2, 9),
    txt(20, 122, 'AI Model', 10, C.muted, { bold: true, ls: 0.5 }),
    rect(16, 136, W-32, 44, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(30, 162, 'gpt-4o-mini', 12, C.text, { semi: true }),
    txt(W-30, 162, '▾', 12, C.muted, { align: 'right' }),
    ...pill(16, 190, 74, 24, C.accentBg, 'gpt-4o-mini', C.accent, 9),
    ...pill(96, 190, 52, 24, C.surface, 'claude-3', C.muted, 9),
    ...pill(154, 190, 60, 24, C.surface, 'gemini-2', C.muted, 9),
    ...pill(220, 190, 52, 24, C.surface, 'llama-3', C.muted, 9),
    txt(20, 228, 'System Prompt', 10, C.muted, { bold: true, ls: 0.5 }),
    rect(16, 242, W-32, 90, C.surface, { r: 10, stroke: C.accent, sw: 1 }),
    txt(28, 262, 'You are a support classification AI.', 10, C.text, { mono: true }),
    txt(28, 278, 'Classify the ticket as one of:', 10, C.text, { mono: true }),
    txt(28, 294, '  billing, technical, or account', 10, C.accent, { mono: true }),
    txt(28, 310, 'Extract: priority, sentiment, team.', 10, C.text, { mono: true }),
    txt(28, 326, 'Respond only in JSON.', 10, C.accent2, { mono: true }),
    txt(20, 348, 'Temperature', 10, C.muted, { bold: true, ls: 0.5 }),
    rect(16, 362, W-32, 36, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    rect(30, 376, (W-62) * 0.2, 8, C.accent, { r: 4 }),
    rect(30 + (W-62) * 0.2, 376, (W-62) * 0.8, 8, C.border, { r: 4 }),
    rect(30 + (W-62) * 0.2 - 6, 372, 12, 16, C.accent, { r: 6 }),
    txt(W-30, 383, '0.2', 11, C.accent, { align: 'right', bold: true }),
    txt(20, 412, 'Max Tokens', 10, C.muted, { bold: true, ls: 0.5 }),
    rect(16, 426, W-32, 36, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(28, 448, '512', 12, C.text, { semi: true }),
    txt(20, 476, 'Output Schema', 10, C.muted, { bold: true, ls: 0.5 }),
    rect(16, 490, W-32, 80, '#06080E', { r: 10, stroke: C.border, sw: 1 }),
    txt(28, 510, '{ "category": string,', 10, C.accent2, { mono: true }),
    txt(28, 526, '  "priority": "high"|"mid"|"low",', 10, C.accent2, { mono: true }),
    txt(28, 542, '  "sentiment": number,', 10, C.accent2, { mono: true }),
    txt(28, 558, '  "team": string }', 10, C.accent2, { mono: true }),
    rect(16, 582, W-32, 44, C.accent, { r: 12 }),
    txt(W/2, 608, 'Save & Test Node', 13, '#FFFFFF', { bold: true, align: 'center' }),
    ...bottomNav(1),
  ].flat();
}

function templateCard(x, y, name, desc, tags, uses) {
  return [
    rect(x, y, W-32, 80, C.surface, { r: 12, stroke: C.border, sw: 1 }),
    txt(x+16, y+22, name, 13, C.text, { semi: true }),
    txt(x+16, y+38, desc, 9, C.muted, { mono: true }),
    ...tags.slice(0,3).flatMap((t, i) => pill(x + 16 + i * 58, y+52, 54, 18, C.accentBg, t, C.accent, 7)),
    txt(W-x-20, y+22, uses, 9, C.muted, { align: 'right' }),
    rect(W-x-50, y+34, 38, 24, C.accent, { r: 8 }),
    txt(W-x-31, y+50, 'Use', 10, '#FFF', { bold: true, align: 'center' }),
  ];
}

function connectorRow(x, y, icon, iconColor, name, sub) {
  return [
    rect(x, y, W-32, 44, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    rect(x+12, y+10, 26, 26, C.surface2, { r: 7 }),
    txt(x+25, y+27, icon, 12, iconColor, { align: 'center' }),
    txt(x+50, y+20, name, 12, C.text, { semi: true }),
    txt(x+50, y+36, sub, 9, C.muted),
    ...pill(W-x-60, y+12, 48, 20, C.accentBg, 'Install', C.accent, 9),
  ];
}

function screen5() {
  return [
    rect(0, 0, W, H, C.bg), ...statusBar(),
    txt(20, 74, 'Hub', 18, C.text, { bold: true }),
    txt(20, 92, '120+ ready-made workflows', 10, C.muted),
    rect(16, 108, W-32, 38, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    txt(34, 131, '⌕  Search workflows, connectors...', 12, C.muted),
    ...pill(16, 156, 38, 22, C.accentBg, 'All', C.accent, 9),
    ...pill(60, 156, 48, 22, C.surface, 'Support', C.muted, 9),
    ...pill(114, 156, 54, 22, C.surface, 'Marketing', C.muted, 9),
    ...pill(174, 156, 42, 22, C.surface, 'DevOps', C.muted, 9),
    ...pill(222, 156, 48, 22, C.surface, 'Finance', C.muted, 9),
    txt(20, 190, 'TRENDING', 9, C.muted, { bold: true, ls: 1.5 }),
    ...templateCard(16, 204, 'Smart Support Triage', 'webhook → AI classify → Jira + Slack', ['GPT-4o', 'Jira', 'Slack'], '3.2K uses'),
    ...templateCard(16, 292, 'AI Content Summarizer', 'RSS → Summarize → Notion digest', ['Claude 3', 'Notion'], '1.8K uses'),
    ...templateCard(16, 380, 'GitHub PR Reviewer', 'GitHub → AI review → Comment', ['Claude 3.5', 'GitHub'], '1.4K uses'),
    txt(20, 474, 'NEW CONNECTORS', 9, C.muted, { bold: true, ls: 1.5 }),
    ...connectorRow(16, 488, '◈', C.accent, 'Anthropic Claude 3.7', 'Latest Sonnet + Haiku'),
    ...connectorRow(16, 540, '◉', C.pink, 'Perplexity Sonar', 'Real-time web search'),
    ...connectorRow(16, 592, '⬡', C.blue, 'Linear', 'Issues + project sync'),
    ...connectorRow(16, 644, '⊕', C.accent2, 'Resend Email', 'Transactional & batch'),
    ...bottomNav(3),
  ].flat();
}

const screens = [
  { id: 's1', name: 'Dashboard',  elements: screen1() },
  { id: 's2', name: 'Canvas',     elements: screen2() },
  { id: 's3', name: 'Run Log',    elements: screen3() },
  { id: 's4', name: 'Node Config',elements: screen4() },
  { id: 's5', name: 'Hub',        elements: screen5() },
];

const pen = {
  version: '2.8',
  meta: { name: 'LOOM', description: 'Visual AI workflow builder · Dark indigo theme' },
  canvas: { width: W, height: H, background: C.bg },
  screens: screens.map((s, i) => ({
    id: s.id, name: s.name, order: i,
    canvas: { width: W, height: H, background: C.bg },
    elements: s.elements.flat(),
  })),
};

fs.writeFileSync(path.join(__dirname, 'loom.pen'), JSON.stringify(pen, null, 2));
console.log('loom.pen written — screens:', screens.length, '| total elements:', screens.reduce((a, s) => a + s.elements.flat().length, 0));
