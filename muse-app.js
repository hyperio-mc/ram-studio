'use strict';
// muse-app.js — MUSE: AI Creative Intelligence
// Inspired by: Factory.ai minimal light aesthetic (godly.website) + lapa.ninja AI category surge

const fs   = require('fs');
const path = require('path');

function uid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255 };
}
function rect(x, y, w, h, fill, extra = {}) {
  return { type: 'RECTANGLE', id: uid(), x, y, width: w, height: h,
    fills: fill === 'none' ? [] : [{ type: 'SOLID', color: hexToRgb(fill), opacity: extra.fillOpacity !== undefined ? extra.fillOpacity : 1 }],
    cornerRadius: extra.r || 0,
    strokes: extra.stroke ? [{ type: 'SOLID', color: hexToRgb(extra.stroke) }] : [],
    strokeWeight: extra.strokeW || 1,
    opacity: extra.opacity !== undefined ? extra.opacity : 1 };
}
function text(x, y, w, h, content, fontSize, fill, extra = {}) {
  return { type: 'TEXT', id: uid(), x, y, width: w, height: h,
    characters: content, fontSize,
    fontName: { family: extra.font || 'Inter', style: extra.weight || 'Regular' },
    fills: [{ type: 'SOLID', color: hexToRgb(fill) }],
    textAlignHorizontal: extra.align || 'LEFT',
    letterSpacing: extra.ls || 0,
    lineHeight: extra.lh ? { value: extra.lh, unit: 'PIXELS' } : { unit: 'AUTO' },
    opacity: extra.opacity !== undefined ? extra.opacity : 1 };
}
function ellipse(x, y, w, h, fill, extra = {}) {
  return { type: 'ELLIPSE', id: uid(), x, y, width: w, height: h,
    fills: fill === 'none' ? [] : [{ type: 'SOLID', color: hexToRgb(fill) }],
    strokes: extra.stroke ? [{ type: 'SOLID', color: hexToRgb(extra.stroke) }] : [],
    strokeWeight: extra.strokeW || 1,
    opacity: extra.opacity !== undefined ? extra.opacity : 1 };
}

// LIGHT palette — warm cream, inspired by Factory.ai
const P = {
  bg:       '#F6F3EE',  // warm cream
  bg2:      '#EFECE6',  // slightly deeper cream
  surface:  '#FFFFFF',
  border:   '#E5E0D8',
  border2:  '#D5CFC5',
  text:     '#141210',  // near-black warm
  text2:    '#6B6560',  // mid-warm grey
  text3:    '#ACA59C',  // light warm grey
  sienna:   '#D4410C',  // burnt sienna — primary accent
  sienna2:  '#B33509',  // deeper sienna
  siennaBg: '#FEF3ED',  // sienna tint
  indigo:   '#5B4FE8',  // AI purple
  indigo2:  '#4A3FD4',
  indigoBg: '#F0EEFF',
  green:    '#16A34A',
  greenBg:  '#F0FDF4',
  amber:    '#D97706',
  amberBg:  '#FFFBEB',
};

const W = 390, H = 844;

function statusBar() {
  return [
    text(20, 14, 60, 16, '9:41', 12, P.text2, { weight: 'Medium' }),
    text(290, 14, 80, 16, 'WiFi  100%', 11, P.text2, { align: 'RIGHT' }),
  ];
}

function navBar(activeIdx) {
  const labels = ['Studio', 'Brief', 'Assets', 'Feedback', 'Insights'];
  const nodes = [
    rect(0, H - 84, W, 84, P.surface),
    rect(0, H - 84, W, 1, P.border),
  ];
  labels.forEach((lbl, i) => {
    const x = 8 + i * 75;
    const active = i === activeIdx;
    nodes.push(text(x, H - 60, 68, 13, lbl, 9, active ? P.sienna : P.text3,
      { align: 'CENTER', weight: active ? 'SemiBold' : 'Regular' }));
    if (active) nodes.push(rect(x + 24, H - 68, 20, 3, P.sienna, { r: 2 }));
  });
  return nodes;
}

// ─── SCREEN 1: Studio ────────────────────────────────────────────────────────
function screenStudio() {
  const ch = [];
  // bg
  ch.push(rect(0, 0, W, H, P.bg));
  ch.push(...statusBar());

  // Header
  ch.push(text(20, 48, 200, 28, 'MUSE', 22, P.text, { weight: 'Bold', ls: 4 }));
  ch.push(text(20, 50, 200, 12, '           Studio', 9, P.sienna, { weight: 'SemiBold', ls: 2 }));

  // AI pulse badge
  ch.push(rect(280, 44, 92, 26, P.siennaBg, { r: 13 }));
  ch.push(ellipse(293, 54, 8, 8, P.sienna));
  ch.push(text(306, 47, 72, 20, 'AI Active', 10, P.sienna, { weight: 'SemiBold' }));

  // Section: Active Briefs
  ch.push(text(20, 90, 200, 14, 'ACTIVE BRIEFS', 9, P.text3, { weight: 'SemiBold', ls: 2 }));
  ch.push(text(300, 90, 70, 14, '4 projects', 9, P.sienna, { weight: 'Medium', align: 'RIGHT' }));

  // Brief card 1 — Featured, larger
  ch.push(rect(20, 112, 350, 120, P.surface, { r: 14, stroke: P.border, strokeW: 1 }));
  ch.push(rect(20, 112, 4, 120, P.sienna, { r: 2 }));
  ch.push(text(34, 124, 260, 16, 'Nike — AW26 Campaign', 13, P.text, { weight: 'SemiBold' }));
  ch.push(rect(300, 120, 60, 20, P.siennaBg, { r: 10 }));
  ch.push(text(302, 123, 56, 14, 'DUE 2d', 8, P.sienna, { weight: 'Bold', ls: 1, align: 'CENTER' }));
  ch.push(text(34, 144, 300, 13, 'Global motion campaign — 5 hero visuals', 11, P.text2));
  ch.push(text(34, 160, 300, 13, '+ 32 social adaptations needed', 11, P.text2));

  // Progress bar
  ch.push(rect(34, 184, 282, 5, P.border, { r: 3 }));
  ch.push(rect(34, 184, 175, 5, P.sienna, { r: 3 }));
  ch.push(text(34, 195, 120, 12, '62% complete', 10, P.text3));
  ch.push(text(260, 195, 80, 12, '3 of 5 assets', 10, P.text3, { align: 'RIGHT' }));

  // Brief card 2 — compact
  ch.push(rect(20, 244, 168, 90, P.surface, { r: 12, stroke: P.border, strokeW: 1 }));
  ch.push(rect(20, 244, 3, 90, P.indigo, { r: 2 }));
  ch.push(text(31, 254, 140, 14, 'Spotify · Wrapped', 11, P.text, { weight: 'SemiBold' }));
  ch.push(text(31, 272, 140, 12, 'Brand identity', 10, P.text2));
  ch.push(rect(31, 286, 100, 4, P.border, { r: 2 }));
  ch.push(rect(31, 286, 40, 4, P.indigo, { r: 2 }));
  ch.push(text(31, 296, 140, 12, '38% · 5d left', 10, P.text3));

  // Brief card 3 — compact
  ch.push(rect(202, 244, 168, 90, P.surface, { r: 12, stroke: P.border, strokeW: 1 }));
  ch.push(rect(202, 244, 3, 90, P.green, { r: 2 }));
  ch.push(text(213, 254, 140, 14, 'Figma · Conf Key', 11, P.text, { weight: 'SemiBold' }));
  ch.push(text(213, 272, 140, 12, 'Keynote visuals', 10, P.text2));
  ch.push(rect(213, 286, 100, 4, P.border, { r: 2 }));
  ch.push(rect(213, 286, 90, 4, P.green, { r: 2 }));
  ch.push(text(213, 296, 140, 12, '92% · review', 10, P.text3));

  // AI Suggestions strip
  ch.push(rect(20, 346, 350, 72, P.indigoBg, { r: 12, stroke: '#C4B8F8', strokeW: 1 }));
  ch.push(text(36, 358, 280, 14, '✦ MUSE AI · 3 creative suggestions ready', 11, P.indigo, { weight: 'SemiBold' }));
  ch.push(text(36, 376, 285, 12, 'Nike concept: "Motion as emotion" — 2 alt directions', 10, P.text2, { lh: 16 }));
  ch.push(text(36, 393, 285, 12, 'Tap to explore →', 10, P.indigo, { weight: 'Medium' }));

  // Team activity
  ch.push(text(20, 434, 200, 14, 'TEAM TODAY', 9, P.text3, { weight: 'SemiBold', ls: 2 }));

  const team = [
    { name: 'Aria', task: 'Reviewing Nike hero concepts', time: '2m ago', clr: '#E84855' },
    { name: 'Finn', task: 'Generating Spotify color variants', time: '14m ago', clr: '#F59E0B' },
    { name: 'Zoe', task: 'Client feedback on Figma deck', time: '1h ago', clr: '#16A34A' },
  ];
  team.forEach((m, i) => {
    const y = 454 + i * 52;
    ch.push(rect(20, y, 350, 44, P.surface, { r: 10, stroke: P.border, strokeW: 1 }));
    ch.push(ellipse(34, y + 12, 22, 22, m.clr));
    ch.push(text(32, y + 15, 22, 16, m.name[0], 11, P.surface, { weight: 'Bold', align: 'CENTER' }));
    ch.push(text(64, y + 10, 220, 13, m.name, 11, P.text, { weight: 'SemiBold' }));
    ch.push(text(64, y + 26, 220, 12, m.task, 10, P.text2));
    ch.push(text(298, y + 18, 64, 12, m.time, 9, P.text3, { align: 'RIGHT' }));
  });

  ch.push(...navBar(0));
  return ch;
}

// ─── SCREEN 2: Brief Analyzer ────────────────────────────────────────────────
function screenBrief() {
  const ch = [];
  ch.push(rect(0, 0, W, H, P.bg));
  ch.push(...statusBar());

  // Back nav
  ch.push(text(20, 46, 60, 18, '← Back', 12, P.text2));
  ch.push(text(0, 44, W, 20, 'Brief · Nike AW26', 13, P.text, { weight: 'SemiBold', align: 'CENTER' }));

  // Hero card — brief overview
  ch.push(rect(20, 78, 350, 130, P.sienna, { r: 14 }));
  ch.push(rect(20, 78, 350, 130, P.surface, { r: 14, opacity: 0.08 }));
  ch.push(text(34, 92, 300, 20, 'Nike — AW26 Global Motion Campaign', 14, '#FFFFFF', { weight: 'Bold', lh: 20 }));
  ch.push(text(34, 116, 290, 13, '"Capture the feeling of unstoppable forward motion\nacross 5 continents, 5 stories, one truth."', 11, 'rgba(255,255,255,0.80)', { lh: 17 }));
  ch.push(rect(34, 154, 80, 24, 'rgba(255,255,255,0.2)', { r: 12 }));
  ch.push(text(36, 158, 76, 16, 'Motion', 10, '#FFFFFF', { weight: 'SemiBold', align: 'CENTER' }));
  ch.push(rect(122, 154, 70, 24, 'rgba(255,255,255,0.2)', { r: 12 }));
  ch.push(text(124, 158, 66, 16, 'Global', 10, '#FFFFFF', { weight: 'SemiBold', align: 'CENTER' }));
  ch.push(rect(200, 154, 74, 24, 'rgba(255,255,255,0.2)', { r: 12 }));
  ch.push(text(202, 158, 70, 16, 'Campaign', 10, '#FFFFFF', { weight: 'SemiBold', align: 'CENTER' }));

  // AI Direction cards
  ch.push(text(20, 222, 280, 14, 'AI CREATIVE DIRECTIONS', 9, P.text3, { weight: 'SemiBold', ls: 2 }));
  ch.push(rect(340, 218, 30, 18, P.indigoBg, { r: 9 }));
  ch.push(text(340, 220, 30, 14, 'NEW', 8, P.indigo, { weight: 'Bold', align: 'CENTER' }));

  const directions = [
    { title: 'Motion as Emotion', desc: 'Visceral slow-motion at point of peak effort. Raw, human, universal.', score: '94', tag: 'Recommended' },
    { title: 'Urban Kinetics', desc: 'City textures + athlete blur. Energy from environment friction.', score: '87', tag: 'Alternative' },
    { title: 'Silence Before Speed', desc: 'Stillness → explosion. Contrast as narrative device.', score: '81', tag: 'Bold pick' },
  ];
  directions.forEach((d, i) => {
    const y = 246 + i * 100;
    const isTop = i === 0;
    ch.push(rect(20, y, 350, 92, isTop ? P.surface : P.bg2, { r: 12, stroke: isTop ? P.sienna : P.border, strokeW: isTop ? 1.5 : 1 }));
    ch.push(text(34, y + 12, 240, 14, d.title, 12, P.text, { weight: 'SemiBold' }));
    ch.push(rect(300, y + 8, 54, 22, isTop ? P.siennaBg : P.indigoBg, { r: 11 }));
    ch.push(text(300, y + 11, 54, 16, d.score + ' / 100', 9, isTop ? P.sienna : P.indigo, { weight: 'Bold', align: 'CENTER' }));
    ch.push(text(34, y + 32, 300, 12, d.desc, 10, P.text2, { lh: 16 }));
    ch.push(rect(34, y + 68, 60, 16, isTop ? P.siennaBg : P.border, { r: 8 }));
    ch.push(text(34, y + 70, 60, 12, d.tag, 8, isTop ? P.sienna : P.text3, { weight: 'SemiBold', align: 'CENTER' }));
    ch.push(text(270, y + 70, 96, 12, isTop ? '→ Start here' : '→ Explore', 10, isTop ? P.sienna : P.text2, { align: 'RIGHT', weight: isTop ? 'Medium' : 'Regular' }));
  });

  // Mood palette row
  ch.push(text(20, 550, 200, 14, 'MOOD PALETTE', 9, P.text3, { weight: 'SemiBold', ls: 2 }));
  const moods = ['#1A1714','#D4410C','#F5B994','#E8E0D4','#5B4FE8','#FFFFFF'];
  moods.forEach((clr, i) => {
    ch.push(ellipse(20 + i * 44, 570, 32, 32, clr, { stroke: P.border, strokeW: 1 }));
  });
  ch.push(text(20, 614, 350, 12, 'AI-matched to brand & seasonal brief context', 10, P.text3));

  ch.push(...navBar(1));
  return ch;
}

// ─── SCREEN 3: Assets ────────────────────────────────────────────────────────
function screenAssets() {
  const ch = [];
  ch.push(rect(0, 0, W, H, P.bg));
  ch.push(...statusBar());

  ch.push(text(20, 46, 200, 22, 'Assets', 18, P.text, { weight: 'Bold' }));
  ch.push(text(20, 70, 300, 13, 'AI-generated · curated for active briefs', 11, P.text2));

  // Filter chips
  const chips = ['All', 'Nike AW26', 'Spotify', 'Figma', 'Archived'];
  let cx = 20;
  chips.forEach((c, i) => {
    const w = c.length * 7 + 24;
    const active = i === 1;
    ch.push(rect(cx, 92, w, 28, active ? P.sienna : P.surface, { r: 14, stroke: active ? P.sienna : P.border, strokeW: 1 }));
    ch.push(text(cx, 97, w, 18, c, 10, active ? '#FFFFFF' : P.text2, { weight: active ? 'SemiBold' : 'Regular', align: 'CENTER' }));
    cx += w + 8;
  });

  // Asset grid — 2 cols
  const assets = [
    { label: 'Hero_v1.jpg', type: 'Visual', clr: '#D4410C', sub: '4096×2732', badge: 'APPROVED' },
    { label: 'Motion_reel.mp4', type: 'Video', clr: '#5B4FE8', sub: '4K · 0:24', badge: 'REVIEW' },
    { label: 'Social_16x9.png', type: 'Social', clr: '#16A34A', sub: '1920×1080', badge: 'APPROVED' },
    { label: 'Type_display.ai', type: 'Type', clr: '#D97706', sub: 'Illustrator', badge: 'DRAFT' },
  ];
  assets.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 20 + col * 180;
    const y = 134 + row * 190;
    ch.push(rect(x, y, 168, 180, P.surface, { r: 12, stroke: P.border, strokeW: 1 }));
    // Thumbnail area
    ch.push(rect(x, y, 168, 110, a.clr, { r: 12 }));
    ch.push(rect(x, y + 66, 168, 44, a.clr, { r: 0, opacity: 0.6 }));
    // Top-right badge on thumbnail
    const badgeClr = a.badge === 'APPROVED' ? P.green : a.badge === 'REVIEW' ? P.amber : P.text3;
    ch.push(rect(x + 108, y + 8, 52, 18, 'rgba(255,255,255,0.92)', { r: 9 }));
    ch.push(text(x + 108, y + 10, 52, 14, a.badge, 7, badgeClr, { weight: 'Bold', align: 'CENTER' }));
    // Type tag
    ch.push(rect(x + 8, y + 8, 40, 18, 'rgba(0,0,0,0.3)', { r: 9 }));
    ch.push(text(x + 8, y + 10, 40, 14, a.type, 8, '#FFFFFF', { weight: 'SemiBold', align: 'CENTER' }));
    // File info
    ch.push(text(x + 10, y + 120, 148, 14, a.label, 11, P.text, { weight: 'Medium' }));
    ch.push(text(x + 10, y + 138, 148, 12, a.sub, 10, P.text2));
    // AI generated tag
    ch.push(text(x + 10, y + 158, 100, 12, '✦ AI generated', 9, P.indigo, { weight: 'Medium' }));
  });

  // AI generation strip at bottom
  ch.push(rect(20, 534, 350, 64, P.indigoBg, { r: 12, stroke: '#C4B8F8', strokeW: 1 }));
  ch.push(text(36, 546, 240, 14, '✦ Generate new assets for Nike AW26', 11, P.indigo, { weight: 'SemiBold' }));
  ch.push(text(36, 564, 260, 12, 'Tap to describe · MUSE AI will create in 40s', 10, P.text2));
  ch.push(rect(316, 550, 40, 28, P.indigo, { r: 14 }));
  ch.push(text(316, 556, 40, 16, '+', 16, '#FFFFFF', { weight: 'Bold', align: 'CENTER' }));

  ch.push(...navBar(2));
  return ch;
}

// ─── SCREEN 4: Feedback ──────────────────────────────────────────────────────
function screenFeedback() {
  const ch = [];
  ch.push(rect(0, 0, W, H, P.bg));
  ch.push(...statusBar());

  ch.push(text(20, 46, 200, 22, 'Feedback', 18, P.text, { weight: 'Bold' }));
  ch.push(text(20, 70, 300, 13, 'Client reviews · AI-summarized', 11, P.text2));

  // Active review — Nike Hero v1
  ch.push(rect(20, 96, 350, 200, P.surface, { r: 14, stroke: P.border, strokeW: 1 }));
  // Mock image preview
  ch.push(rect(20, 96, 350, 130, P.sienna, { r: 14 }));
  ch.push(rect(20, 152, 350, 44, P.sienna, { r: 0, opacity: 0.5 }));
  ch.push(text(34, 160, 300, 16, 'Nike_Hero_v1.jpg', 12, '#FFFFFF', { weight: 'SemiBold' }));
  ch.push(text(34, 177, 300, 13, 'AW26 Global Campaign · Final review round', 10, 'rgba(255,255,255,0.7)'));
  // Annotation dots on image
  ch.push(ellipse(120, 118, 20, 20, 'rgba(255,255,255,0.95)'));
  ch.push(text(118, 121, 20, 16, '1', 11, P.sienna, { weight: 'Bold', align: 'CENTER' }));
  ch.push(ellipse(240, 138, 20, 20, 'rgba(255,255,255,0.95)'));
  ch.push(text(238, 141, 20, 16, '2', 11, P.sienna, { weight: 'Bold', align: 'CENTER' }));
  // Meta row below image
  ch.push(text(34, 234, 150, 14, '3 client notes', 11, P.text2));
  ch.push(rect(230, 228, 120, 26, P.siennaBg, { r: 13 }));
  ch.push(text(230, 232, 120, 18, '→ Approve / Revise', 10, P.sienna, { weight: 'SemiBold', align: 'CENTER' }));

  // AI feedback summary
  ch.push(rect(20, 310, 350, 80, P.indigoBg, { r: 12, stroke: '#C4B8F8', strokeW: 1 }));
  ch.push(text(36, 322, 290, 14, '✦ MUSE AI · Feedback Summary', 11, P.indigo, { weight: 'SemiBold' }));
  ch.push(text(36, 340, 310, 28, '"Client is strong on composition. 2 notes on\ncolor saturation, 1 on cropping for IG format."', 10, P.text2, { lh: 16 }));
  ch.push(text(36, 374, 200, 12, '→ Auto-generate revision brief', 10, P.indigo, { weight: 'Medium' }));

  // Comment thread
  ch.push(text(20, 406, 200, 14, 'COMMENTS', 9, P.text3, { weight: 'SemiBold', ls: 2 }));

  const comments = [
    { author: 'Sarah K.', role: 'Nike Brand Lead', msg: 'Love the energy. The orange is a bit hot — can we pull it back 15%?', time: '1h ago', clr: '#E84855' },
    { author: 'Tom B.', role: 'Creative Dir', msg: 'Composition is perfect. Crop tight for the square format please.', time: '2h ago', clr: '#5B4FE8' },
    { author: 'MUSE AI', role: 'Summary', msg: 'Revision priority: saturation -15%, 2 crop variants. Est. 20 min.', time: 'auto', clr: P.indigo },
  ];
  comments.forEach((c, i) => {
    const y = 426 + i * 80;
    ch.push(ellipse(20, y + 8, 28, 28, c.clr));
    ch.push(text(18, y + 13, 28, 16, c.author[0], 11, '#FFFFFF', { weight: 'Bold', align: 'CENTER' }));
    ch.push(rect(56, y, 310, 64, i === 2 ? P.indigoBg : P.surface, { r: 10, stroke: i === 2 ? '#C4B8F8' : P.border, strokeW: 1 }));
    ch.push(text(68, y + 10, 200, 13, c.author, 11, P.text, { weight: 'SemiBold' }));
    ch.push(text(68, y + 24, 220, 12, c.msg.substring(0,60), 10, P.text2, { lh: 15 }));
    ch.push(text(300, y + 10, 60, 12, c.time, 9, P.text3, { align: 'RIGHT' }));
  });

  ch.push(...navBar(3));
  return ch;
}

// ─── SCREEN 5: Insights ──────────────────────────────────────────────────────
function screenInsights() {
  const ch = [];
  ch.push(rect(0, 0, W, H, P.bg));
  ch.push(...statusBar());

  ch.push(text(20, 46, 200, 22, 'Insights', 18, P.text, { weight: 'Bold' }));
  ch.push(text(20, 70, 300, 13, 'This month · 4 campaigns tracked', 11, P.text2));

  // Top stats row
  const stats = [
    { val: '94', unit: 'NPS', label: 'Client score', clr: P.green },
    { val: '3.2d', unit: 'AVG', label: 'Brief to delivery', clr: P.sienna },
    { val: '47', unit: 'ASSETS', label: 'AI generated', clr: P.indigo },
  ];
  stats.forEach((s, i) => {
    const x = 20 + i * 118;
    ch.push(rect(x, 92, 110, 80, P.surface, { r: 12, stroke: P.border, strokeW: 1 }));
    ch.push(text(x, 104, 110, 28, s.val, 22, s.clr, { weight: 'Bold', align: 'CENTER' }));
    ch.push(text(x, 130, 110, 14, s.unit, 8, s.clr, { weight: 'Bold', ls: 2, align: 'CENTER' }));
    ch.push(text(x, 146, 110, 13, s.label, 9, P.text2, { align: 'CENTER' }));
  });

  // Bar chart — weekly delivery
  ch.push(rect(20, 186, 350, 160, P.surface, { r: 12, stroke: P.border, strokeW: 1 }));
  ch.push(text(32, 198, 200, 14, 'Delivery Performance', 12, P.text, { weight: 'SemiBold' }));
  ch.push(text(32, 214, 200, 12, 'Assets completed per week', 10, P.text2));

  const barData = [
    { w: 5,  v: 5  },
    { w: 8,  v: 8  },
    { w: 6,  v: 6  },
    { w: 12, v: 12 },
    { w: 9,  v: 9  },
    { w: 14, v: 14 },
    { w: 11, v: 11 },
  ];
  const wk = ['W1','W2','W3','W4','W5','W6','W7'];
  const maxV = 14;
  const barAreaH = 70;
  barData.forEach((b, i) => {
    const bx = 38 + i * 44;
    const bh = Math.round((b.v / maxV) * barAreaH);
    const by = 234 + (barAreaH - bh);
    const isLast = i === barData.length - 1;
    ch.push(rect(bx, by, 28, bh, isLast ? P.sienna : P.border, { r: 4 }));
    ch.push(text(bx, 312, 28, 12, wk[i], 8, P.text3, { align: 'CENTER' }));
    if (isLast) ch.push(text(bx - 6, by - 16, 40, 12, b.v + '', 10, P.sienna, { weight: 'SemiBold', align: 'CENTER' }));
  });

  // Campaign health list
  ch.push(text(20, 360, 200, 14, 'CAMPAIGN HEALTH', 9, P.text3, { weight: 'SemiBold', ls: 2 }));

  const campaigns = [
    { name: 'Nike AW26', progress: 62, status: 'On track', clr: P.sienna },
    { name: 'Spotify Wrapped', progress: 38, status: 'Behind', clr: P.amber },
    { name: 'Figma Conference', progress: 92, status: 'Ahead', clr: P.green },
    { name: "Levi's Summer", progress: 15, status: 'Scoping', clr: P.indigo },
  ];
  campaigns.forEach((c, i) => {
    const y = 380 + i * 72;
    ch.push(rect(20, y, 350, 62, P.surface, { r: 10, stroke: P.border, strokeW: 1 }));
    ch.push(text(32, y + 10, 180, 14, c.name, 12, P.text, { weight: 'SemiBold' }));
    ch.push(rect(288, y + 8, 68, 20, c.clr + '22', { r: 10 }));
    ch.push(text(288, y + 11, 68, 14, c.status, 9, c.clr, { weight: 'SemiBold', align: 'CENTER' }));
    ch.push(rect(32, y + 34, 282, 6, P.border, { r: 3 }));
    ch.push(rect(32, y + 34, Math.round(282 * c.progress / 100), 6, c.clr, { r: 3 }));
    ch.push(text(32, y + 46, 100, 11, c.progress + '% complete', 9, P.text3));
  });

  ch.push(...navBar(4));
  return ch;
}

// ─── BUILD PEN ────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'MUSE — AI Creative Intelligence',
  pages: [{
    id: uid(),
    name: 'Mobile Screens',
    children: [
      { type: 'FRAME', id: uid(), name: 'Studio',     x: 0,    y: 0, width: W, height: H, fills: [], children: screenStudio() },
      { type: 'FRAME', id: uid(), name: 'Brief',      x: 420,  y: 0, width: W, height: H, fills: [], children: screenBrief() },
      { type: 'FRAME', id: uid(), name: 'Assets',     x: 840,  y: 0, width: W, height: H, fills: [], children: screenAssets() },
      { type: 'FRAME', id: uid(), name: 'Feedback',   x: 1260, y: 0, width: W, height: H, fills: [], children: screenFeedback() },
      { type: 'FRAME', id: uid(), name: 'Insights',   x: 1680, y: 0, width: W, height: H, fills: [], children: screenInsights() },
    ],
  }],
};

fs.writeFileSync(path.join(__dirname, 'muse.pen'), JSON.stringify(pen, null, 2));
console.log('✓ muse.pen written —', JSON.stringify(pen).length, 'bytes');
