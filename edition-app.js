const fs = require('fs');

const W = 390, H = 844;
const BG = "#F6F2EB";
const SURFACE = "#FFFFFF";
const TEXT = "#1A1614";
const ACCENT = "#2C5F4E";
const ACCENT2 = "#C17F2A";
const MUTED = "#8A8178";
const MUTED_BG = "#EDEBE5";
const LIGHT_ACCENT = "#E4EDE9";
const LIGHT_AMBER = "#FAF0E0";
const CARD_LINE = "#E2DDD5";

function rect(x, y, w, h, fill, r, extra) {
  r = r || 0; extra = extra || {};
  return { type: 'rectangle', x, y, width: w, height: h, fill, cornerRadius: r, ...extra };
}

function txt(x, y, w, h, content, fontSize, color, opts) {
  opts = opts || {};
  return {
    type: 'text', x, y, width: w, height: h, content: String(content), fontSize, color,
    fontWeight: opts.bold ? 700 : opts.medium ? 500 : 400,
    fontFamily: opts.serif ? 'Georgia' : 'Inter',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    letterSpacing: opts.tracking || (opts.wide ? 2 : 0),
    lineHeight: opts.lh || 1.4,
    opacity: opts.opacity || 1
  };
}

function pill(x, y, label, bg, fg, r) {
  r = r || 11;
  var w = Math.max(label.length * 7 + 18, 44);
  return [
    rect(x, y, w, 24, bg, r),
    txt(x, y + 4, w, 16, label, 10, fg, { bold: true, center: true, tracking: 0.8 })
  ];
}

function div(y) { return rect(20, y, W - 40, 1, CARD_LINE); }

// ── SCREEN 1: TODAY ──────────────────────────────────────────────────────────
var s1 = [];
s1.push(rect(0, 0, W, H, BG));
// status
s1.push(txt(20, 14, 60, 16, "9:41", 14, TEXT, { bold: true }));
s1.push(txt(W - 80, 14, 70, 16, "• • •", 13, MUTED, { right: true }));
// masthead
s1.push(txt(20, 50, 220, 20, "EDITION", 11, ACCENT, { bold: true, tracking: 3.5 }));
s1.push(txt(W - 80, 50, 66, 18, "✦ 4 new", 11, ACCENT2, { bold: true, right: true }));
// date headline
s1.push(txt(20, 76, 300, 36, "Saturday, April 4", 26, TEXT, { serif: true, lh: 1.1 }));
s1.push(rect(20, 116, W - 40, 1, ACCENT2));
// featured card
s1.push(rect(20, 124, W - 40, 186, "#2E4039", 10));
s1.push(...pill(32, 136, "CULTURE", ACCENT2, "#FFF", 10));
s1.push(txt(32, 162, W - 64, 50, "The Quiet Renaissance of\nthe Independent Press", 15, "#FFFFFF", { serif: true, bold: true, lh: 1.25 }));
s1.push(rect(20, 238, W - 40, 72, "rgba(10,20,15,0.82)", 10));
s1.push(txt(32, 242, 140, 18, "The Atlantic", 10, "rgba(255,255,255,0.6)", { medium: true }));
s1.push(txt(W - 96, 242, 72, 18, "7 min read →", 10, "rgba(255,255,255,0.5)", { right: true }));
// section header
s1.push(txt(20, 324, 140, 18, "In Your Inbox", 11, MUTED, { bold: true, tracking: 1.5 }));
// story 1
s1.push(div(346));
s1.push(...pill(20, 354, "SCIENCE", LIGHT_ACCENT, ACCENT, 10));
s1.push(txt(86, 354, 80, 16, "4 min", 10, MUTED));
s1.push(txt(20, 380, W - 40, 36, "Why Fungi May Solve the Climate Crisis", 15, TEXT, { serif: true, bold: true, lh: 1.25 }));
s1.push(txt(20, 420, 120, 16, "The Economist", 11, MUTED, { medium: true }));
// story 2
s1.push(div(442));
s1.push(...pill(20, 450, "TECHNOLOGY", LIGHT_ACCENT, ACCENT, 10));
s1.push(txt(100, 450, 80, 16, "6 min", 10, MUTED));
s1.push(txt(20, 476, W - 40, 36, "Apple's Next Identity Crisis", 15, TEXT, { serif: true, bold: true, lh: 1.25 }));
s1.push(txt(20, 516, 120, 16, "Stratechery", 11, MUTED, { medium: true }));
// story 3
s1.push(div(538));
s1.push(...pill(20, 546, "FINANCE", LIGHT_AMBER, "#8C4A00", 10));
s1.push(txt(86, 546, 80, 16, "5 min", 10, MUTED));
s1.push(txt(20, 572, W - 40, 36, "The IPO Window is Opening Again", 15, TEXT, { serif: true, bold: true, lh: 1.25 }));
s1.push(txt(20, 612, 80, 16, "The Ken", 11, MUTED, { medium: true }));
// nav
s1.push(rect(0, H - 80, W, 80, SURFACE));
s1.push(rect(0, H - 80, W, 1, CARD_LINE));
[{ label: "Today", icon: "▣", x: 30, a: true }, { label: "Discover", icon: "⊕", x: 120 }, { label: "Reading", icon: "◈", x: 210 }, { label: "Library", icon: "◫", x: 300 }].forEach(function(n) {
  var c = n.a ? ACCENT : MUTED;
  s1.push(txt(n.x, H - 64, 60, 20, n.icon, 18, c, { center: true }));
  s1.push(txt(n.x, H - 42, 60, 16, n.label, 10, c, { center: true, bold: n.a, medium: !n.a }));
  if (n.a) s1.push(rect(n.x + 22, H - 80, 16, 2, ACCENT, 1));
});

// ── SCREEN 2: DISCOVER ────────────────────────────────────────────────────────
var s2 = [];
s2.push(rect(0, 0, W, H, BG));
s2.push(txt(20, 14, 60, 16, "9:41", 14, TEXT, { bold: true }));
s2.push(txt(20, 50, 200, 32, "Discover", 26, TEXT, { serif: true, bold: true }));
s2.push(txt(20, 84, W - 40, 18, "Curated publications worth your time", 13, MUTED));
// search
s2.push(rect(20, 110, W - 40, 40, SURFACE, 10));
s2.push(txt(40, 122, 220, 18, "⊕  Search newsletters...", 13, MUTED));
// category pills
var catX = 20;
["All", "Culture", "Science", "Finance", "Design"].forEach(function(c, i) {
  var w = Math.max(c.length * 7 + 18, 38);
  s2.push(rect(catX, 164, w, 28, i === 0 ? ACCENT : MUTED_BG, 14));
  s2.push(txt(catX, 168, w, 20, c, 11, i === 0 ? "#FFF" : TEXT, { center: true, bold: i === 0, medium: i !== 0 }));
  catX += w + 8;
});
// picks header
s2.push(txt(20, 206, 200, 18, "Editor's Picks", 11, MUTED, { bold: true, tracking: 1.5 }));
s2.push(div(228));
// pick cards
[
  { name: "Delayed Gratification", sub: "Slow journalism", color: "#2C5F4E", tag: "CULTURE" },
  { name: "Works in Progress", sub: "Ideas & progress", color: "#704214", tag: "SCIENCE" },
  { name: "Not Boring", sub: "Strategy", color: "#1D3557", tag: "FINANCE" },
].forEach(function(p, i) {
  var px = 20 + i * 124;
  s2.push(rect(px, 236, 116, 148, p.color, 10));
  s2.push(rect(px, 332, 116, 52, "rgba(0,0,0,0.55)", 10));
  s2.push(...pill(px + 8, 248, p.tag, "rgba(255,255,255,0.18)", "#FFF", 8));
  s2.push(txt(px + 8, 306, 100, 38, p.name, 12, "#FFF", { serif: true, bold: true, lh: 1.2 }));
  s2.push(txt(px + 8, 350, 100, 18, p.sub, 9, "rgba(255,255,255,0.65)"));
  s2.push(txt(px + 8, 368, 60, 16, "+ Follow", 9, "#FFF", { medium: true }));
});
// trending
s2.push(txt(20, 400, 140, 18, "Trending Topics", 11, MUTED, { bold: true, tracking: 1.5 }));
s2.push(div(422));
[
  { num: "01", topic: "Artificial Intelligence", count: "1,240 stories" },
  { num: "02", topic: "Climate & Energy", count: "892 stories" },
  { num: "03", topic: "Global Markets", count: "743 stories" },
  { num: "04", topic: "Culture & Society", count: "631 stories" },
].forEach(function(t, i) {
  var ty = 430 + i * 58;
  s2.push(txt(20, ty, 40, 44, t.num, 13, ACCENT2, { bold: true, serif: true }));
  s2.push(txt(62, ty + 4, 240, 20, t.topic, 15, TEXT, { serif: true, medium: true }));
  s2.push(txt(62, ty + 26, 200, 16, t.count, 11, MUTED));
  s2.push(txt(W - 40, ty + 12, 20, 20, "›", 18, MUTED, { right: true }));
  if (i < 3) s2.push(rect(62, ty + 46, W - 82, 1, CARD_LINE));
});
// nav
s2.push(rect(0, H - 80, W, 80, SURFACE));
s2.push(rect(0, H - 80, W, 1, CARD_LINE));
[{ label: "Today", icon: "▣", x: 30 }, { label: "Discover", icon: "⊕", x: 120, a: true }, { label: "Reading", icon: "◈", x: 210 }, { label: "Library", icon: "◫", x: 300 }].forEach(function(n) {
  var c = n.a ? ACCENT : MUTED;
  s2.push(txt(n.x, H - 64, 60, 20, n.icon, 18, c, { center: true }));
  s2.push(txt(n.x, H - 42, 60, 16, n.label, 10, c, { center: true, bold: n.a, medium: !n.a }));
  if (n.a) s2.push(rect(n.x + 22, H - 80, 16, 2, ACCENT, 1));
});

// ── SCREEN 3: READING ─────────────────────────────────────────────────────────
var s3 = [];
s3.push(rect(0, 0, W, H, SURFACE));
s3.push(txt(20, 14, 60, 16, "9:41", 14, TEXT, { bold: true }));
// progress bar
s3.push(rect(0, 44, W, 3, MUTED_BG));
s3.push(rect(0, 44, Math.round(W * 0.42), 3, ACCENT2));
// controls
s3.push(txt(20, 56, 30, 24, "‹", 24, TEXT));
s3.push(txt(W - 70, 58, 60, 20, "··· ↑", 14, MUTED, { right: true }));
// source strip
s3.push(rect(20, 90, W - 40, 1, CARD_LINE));
s3.push(...pill(20, 98, "CULTURE", LIGHT_ACCENT, ACCENT, 10));
s3.push(txt(100, 102, 140, 16, "The Atlantic · 7 min", 11, MUTED));
s3.push(txt(W - 72, 102, 56, 16, "42% read", 10, ACCENT2, { right: true }));
s3.push(rect(20, 128, W - 40, 1, CARD_LINE));
// headline
s3.push(txt(20, 138, W - 40, 80, "The Quiet Renaissance of the Independent Press", 22, TEXT, { serif: true, bold: true, lh: 1.2 }));
// byline
s3.push(txt(20, 222, 260, 18, "By Eleanor Voss  ·  April 3, 2026", 12, MUTED));
s3.push(rect(20, 246, W - 40, 1, CARD_LINE));
// body paragraphs
var body1 = "In the spring of 2024, something curious happened: readers started paying. Not through algorithmic nudges or dark-pattern subscription traps — but willingly, almost defiantly.";
s3.push(txt(20, 254, W - 40, 80, body1, 14, TEXT, { lh: 1.65 }));
// pull quote
s3.push(rect(20, 342, 4, 62, ACCENT2));
s3.push(rect(24, 342, W - 44, 62, LIGHT_AMBER, 6));
s3.push(txt(34, 350, W - 60, 48, '"Readers aren\'t fleeing journalism — they\'re fleeing noise."', 13, TEXT, { serif: true, lh: 1.4 }));
// body 2
var body2 = "The newsletters, subculture magazines, and indie podcasts that emerged share one trait: they are built around trust rather than scale. They prize specificity over breadth.";
s3.push(txt(20, 416, W - 40, 72, body2, 14, TEXT, { lh: 1.65 }));
// font controls
s3.push(rect(20, 500, W - 40, 38, MUTED_BG, 10));
s3.push(txt(30, 511, 60, 18, "Aa−", 13, MUTED, { medium: true }));
s3.push(rect(W / 2 - 1, 507, 1, 24, CARD_LINE));
s3.push(txt(W / 2 + 14, 511, 60, 18, "Aa+", 13, MUTED, { medium: true }));
// action bar
s3.push(rect(0, H - 80, W, 80, SURFACE));
s3.push(rect(0, H - 80, W, 1, CARD_LINE));
s3.push(txt(20, H - 58, 100, 28, "♡  Save", 13, MUTED, { medium: true, center: true }));
s3.push(txt(W / 2 - 45, H - 58, 90, 28, "↑  Share", 13, MUTED, { medium: true, center: true }));
s3.push(txt(W - 120, H - 58, 100, 28, "◎  More", 13, MUTED, { medium: true, center: true }));

// ── SCREEN 4: LIBRARY ─────────────────────────────────────────────────────────
var s4 = [];
s4.push(rect(0, 0, W, H, BG));
s4.push(txt(20, 14, 60, 16, "9:41", 14, TEXT, { bold: true }));
s4.push(txt(20, 50, 200, 32, "Library", 26, TEXT, { serif: true, bold: true }));
s4.push(txt(20, 84, 180, 18, "12 subscriptions", 13, MUTED));
s4.push(txt(W - 80, 72, 60, 24, "+ Add", 13, ACCENT, { medium: true, right: true }));
// unread strip
s4.push(rect(20, 112, W - 40, 44, LIGHT_ACCENT, 10));
s4.push(txt(32, 124, 220, 22, "◈  23 unread articles", 13, ACCENT, { medium: true }));
s4.push(txt(W - 68, 124, 50, 22, "View →", 11, ACCENT2, { right: true }));
// section label
s4.push(txt(20, 168, 140, 18, "Subscriptions", 11, MUTED, { bold: true, tracking: 1.5 }));
s4.push(div(190));
// newsletter rows
[
  { name: "The Atlantic", freq: "Daily", unread: 3, color: "#1D3557" },
  { name: "Stratechery", freq: "Weekly", unread: 1, color: "#2C5F4E" },
  { name: "The Economist", freq: "Weekly", unread: 5, color: "#C17F2A" },
  { name: "Delayed Gratification", freq: "Quarterly", unread: 0, color: "#704214" },
  { name: "Not Boring", freq: "2× week", unread: 2, color: "#4A4E69" },
  { name: "Works in Progress", freq: "Monthly", unread: 1, color: "#3D5A80" },
].forEach(function(n, i) {
  var ny = 198 + i * 68;
  s4.push(rect(20, ny + 10, 44, 44, n.color, 22));
  s4.push(txt(20, ny + 22, 44, 22, n.name.charAt(0), 16, "#FFF", { bold: true, serif: true, center: true }));
  s4.push(txt(74, ny + 14, 200, 20, n.name, 14, TEXT, { medium: true, serif: true }));
  s4.push(txt(74, ny + 36, 120, 16, n.freq, 11, MUTED));
  if (n.unread > 0) {
    s4.push(rect(W - 44, ny + 20, 24, 24, ACCENT, 12));
    s4.push(txt(W - 44, ny + 24, 24, 16, String(n.unread), 10, "#FFF", { bold: true, center: true }));
  } else {
    s4.push(txt(W - 44, ny + 24, 30, 16, "✓", 13, MUTED, { center: true }));
  }
  if (i < 5) s4.push(rect(74, ny + 62, W - 94, 1, CARD_LINE));
});
// nav
s4.push(rect(0, H - 80, W, 80, SURFACE));
s4.push(rect(0, H - 80, W, 1, CARD_LINE));
[{ label: "Today", icon: "▣", x: 30 }, { label: "Discover", icon: "⊕", x: 120 }, { label: "Reading", icon: "◈", x: 210 }, { label: "Library", icon: "◫", x: 300, a: true }].forEach(function(n) {
  var c = n.a ? ACCENT : MUTED;
  s4.push(txt(n.x, H - 64, 60, 20, n.icon, 18, c, { center: true }));
  s4.push(txt(n.x, H - 42, 60, 16, n.label, 10, c, { center: true, bold: n.a, medium: !n.a }));
  if (n.a) s4.push(rect(n.x + 22, H - 80, 16, 2, ACCENT, 1));
});

// ── SCREEN 5: PROFILE ─────────────────────────────────────────────────────────
var s5 = [];
s5.push(rect(0, 0, W, H, BG));
s5.push(txt(20, 14, 60, 16, "9:41", 14, TEXT, { bold: true }));
// header band
s5.push(rect(0, 44, W, 132, LIGHT_ACCENT));
s5.push(rect(W / 2 - 30, 54, 60, 60, ACCENT, 30));
s5.push(txt(W / 2 - 30, 70, 60, 30, "E", 22, "#FFF", { bold: true, serif: true, center: true }));
s5.push(txt(20, 120, W - 40, 22, "Eleanor", 16, TEXT, { bold: true, serif: true, center: true }));
s5.push(txt(20, 144, W - 40, 18, "Reading since March 2024", 11, MUTED, { center: true }));
// stats
s5.push(rect(20, 188, W - 40, 72, SURFACE, 10));
[
  { val: "47", label: "day streak", x: 34, icon: "↑" },
  { val: "312", label: "articles read", x: 146, icon: "◈" },
  { val: "38h", label: "reading time", x: 258, icon: "◷" },
].forEach(function(st, i) {
  s5.push(txt(st.x, 200, 90, 26, st.icon + " " + st.val, 16, ACCENT, { bold: true, center: true }));
  s5.push(txt(st.x, 228, 90, 16, st.label, 10, MUTED, { center: true }));
  if (i < 2) s5.push(rect(st.x + 90, 200, 1, 36, CARD_LINE));
});
// weekly chart
s5.push(txt(20, 276, 200, 18, "This Week", 11, MUTED, { bold: true, tracking: 1.5 }));
s5.push(div(298));
var days = ["M", "T", "W", "T", "F", "S", "S"];
var reads = [3, 5, 2, 7, 4, 6, 2];
days.forEach(function(d, i) {
  var bx = 28 + i * 50;
  var barH = Math.round((reads[i] / 7) * 56);
  var isSat = i === 5;
  s5.push(rect(bx, 304 + (56 - barH), 32, barH, isSat ? ACCENT : MUTED_BG, 6));
  s5.push(txt(bx, 364, 32, 16, d, 10, isSat ? ACCENT : MUTED, { center: true, bold: isSat }));
  s5.push(txt(bx, 380, 32, 14, String(reads[i]), 9, isSat ? ACCENT2 : MUTED, { center: true }));
});
// preferences
s5.push(txt(20, 408, 140, 18, "Preferences", 11, MUTED, { bold: true, tracking: 1.5 }));
s5.push(div(430));
[
  { label: "Reading font", value: "Georgia" },
  { label: "Email digest", value: "7am daily" },
  { label: "Offline reading", value: "On" },
  { label: "Dark mode", value: "Auto" },
].forEach(function(p, i) {
  var py = 438 + i * 52;
  s5.push(txt(20, py + 14, 180, 18, p.label, 14, TEXT));
  s5.push(txt(W - 100, py + 14, 80, 18, p.value + " ›", 13, ACCENT2, { right: true }));
  if (i < 3) s5.push(rect(20, py + 46, W - 40, 1, CARD_LINE));
});
// nav
s5.push(rect(0, H - 80, W, 80, SURFACE));
s5.push(rect(0, H - 80, W, 1, CARD_LINE));
[{ label: "Today", icon: "▣", x: 30 }, { label: "Discover", icon: "⊕", x: 120 }, { label: "Reading", icon: "◈", x: 210 }, { label: "Library", icon: "◫", x: 300 }].forEach(function(n) {
  s5.push(txt(n.x, H - 64, 60, 20, n.icon, 18, MUTED, { center: true }));
  s5.push(txt(n.x, H - 42, 60, 16, n.label, 10, MUTED, { center: true, medium: true }));
});
s5.push(rect(W - 46, H - 66, 32, 32, ACCENT, 16));
s5.push(txt(W - 46, H - 58, 32, 18, "E", 12, "#FFF", { bold: true, serif: true, center: true }));

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
var design = {
  version: "2.8",
  name: "EDITION — Your Morning Edition",
  description: "Curated newsletter reader with editorial magazine aesthetics. Light warm parchment #F6F2EB + deep editorial green #2C5F4E + warm amber #C17F2A. Inspired by QP Magazine & PW Magazine on Siteinspire (editorial type-led design) + MUTI Daily Essentials shot on Dribbble (warm everyday quality).",
  screens: [
    { id: "today",    name: "Today",    backgroundColor: BG,      width: W, height: H, elements: s1 },
    { id: "discover", name: "Discover", backgroundColor: BG,      width: W, height: H, elements: s2 },
    { id: "reading",  name: "Reading",  backgroundColor: SURFACE, width: W, height: H, elements: s3 },
    { id: "library",  name: "Library",  backgroundColor: BG,      width: W, height: H, elements: s4 },
    { id: "profile",  name: "Profile",  backgroundColor: BG,      width: W, height: H, elements: s5 },
  ]
};

fs.writeFileSync('edition.pen', JSON.stringify(design, null, 2));
console.log('edition.pen written:', JSON.stringify(design).length, 'bytes,', design.screens.length, 'screens');
design.screens.forEach(function(sc) {
  console.log(' -', sc.name, sc.elements.length, 'elements');
});
