// glaze-app.js — GLAZE material specification platform
// Theme: LIGHT — warm parchment #F5F2EC + deep ink #1C1814 + warm bronze #9B7B5C
// Inspired by:
//   fluid.glass (Awwwards SOTD March 30 2026) — structural/architectural glazing,
//     ultra-minimal 2-color palette, mask wipe transitions, product collection grid,
//     "Trusted by architects who demand precision, beauty, and care."
//   Land-book nominees — clean SaaS landing pages with generous whitespace
// Concept: Premium material specification tool for architects.
//   Curate, spec, and quote architectural glass & material systems.
//   5 screens: Projects, Library, Detail, Specify, Profile
// Fonts: Cormorant Garamond (display serif) + Inter (body sans)
// Theme rotation: FLUX was dark → GLAZE is LIGHT ✓

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG        = '#F5F2EC'; // warm parchment
const SURFACE   = '#FFFFFF'; // pure white
const CARD      = '#FAFAF8'; // off-white card
const RAISED    = '#F0EDE6'; // slightly deeper surface
const TEXT      = '#1C1814'; // deep ink
const MUTED     = '#8B8278'; // warm stone
const FAINT     = '#C8C4BC'; // light divider
const BORDER    = '#E8E4DE'; // card border
const BRONZE    = '#9B7B5C'; // warm bronze accent
const BRONZE2   = '#C4956A'; // lighter bronze
const TERRA     = '#7A5C44'; // deep terracotta/umber
const SAGE      = '#6B7C6E'; // muted sage
const CREAM     = '#EDE8DF'; // deep cream for tags

const SERIF = 'Cormorant Garamond';
const SANS  = 'Inter';

let nodes = [];
let id = 1;

function rect(name, x, y, w, h, fill, opts = {}) {
  nodes.push({
    type: 'RECTANGLE', id: `node_${id++}`, name,
    x, y, width: w, height: h, fill,
    cornerRadius: opts.cr || 0,
    opacity: opts.op || 1,
    stroke: opts.stroke || null,
    strokeWidth: opts.sw || 0,
  });
}

function text(name, x, y, w, content, size, color, opts = {}) {
  nodes.push({
    type: 'TEXT', id: `node_${id++}`, name,
    x, y, width: w, content, fontSize: size, color,
    font: opts.font || SANS,
    weight: opts.weight || 400,
    align: opts.align || 'left',
    lh: opts.lh || 1.4,
    ls: opts.ls || 0,
  });
}

function serif(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color, { font: SERIF, ...opts });
}

function divider(name, x, y, w) {
  rect(name, x, y, w, 1, BORDER);
}

// ─── Header ───────────────────────────────────────────────────────────────────
function header(sx, title, sub, badge, badgeCol) {
  rect(`hdr-bg-${sx}`, sx, 0, W, 76, BG);
  serif(`hdr-title-${sx}`, sx + 24, 22, W - 100, title, 22, TEXT, { weight: 500, ls: -0.3, lh: 1.2 });
  text(`hdr-sub-${sx}`,    sx + 24, 50, W - 100, sub,   10, MUTED, { ls: 0.04 });
  if (badge) {
    rect(`hdr-badge-bg-${sx}`, sx + W - 90, 25, 66, 22, CREAM, { cr: 11 });
    text(`hdr-badge-${sx}`,    sx + W - 86, 31, 58, badge, 9, badgeCol || BRONZE, { align: 'center', ls: 0.04, weight: 500 });
  }
  divider(`hdr-div-${sx}`, sx, 75, W);
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function bottomNav(sx, active) {
  rect(`nav-bg-${sx}`,  sx, H - 66, W, 66, SURFACE);
  rect(`nav-top-${sx}`, sx, H - 67, W, 1, BORDER);

  const tabs = [
    { icon: '◈', label: 'Projects' },
    { icon: '⬡', label: 'Library'  },
    { icon: '◉', label: 'Detail'   },
    { icon: '⊞', label: 'Specify'  },
    { icon: '◎', label: 'Profile'  },
  ];
  const tw = Math.floor(W / tabs.length);
  tabs.forEach((tab, i) => {
    const tx = sx + i * tw;
    const isActive = i === active;
    const col = isActive ? BRONZE : FAINT;
    const tCol = isActive ? TEXT : MUTED;
    text(`nav-icon-${sx}-${i}`, tx,      H - 54, tw, tab.icon, 14, col, { align: 'center' });
    text(`nav-lbl-${sx}-${i}`,  tx,      H - 34, tw, tab.label,  9, tCol, { align: 'center', ls: 0.02 });
    if (isActive) {
      rect(`nav-dot-${sx}-${i}`, tx + tw/2 - 10, H - 14, 20, 2, BRONZE, { cr: 1 });
    }
  });
}

// ─── SCREEN 0 — PROJECTS ──────────────────────────────────────────────────────
function screenProjects(sx) {
  rect(`s0-bg`, sx, 0, W, H, BG);
  header(sx, 'Glaze', 'Material Specification Platform', '3 ACTIVE', BRONZE);

  // greeting
  serif(`s0-greet`, sx + 24, 88, W - 48, 'Good morning, Anya.', 18, TEXT, { weight: 300, ls: -0.2, lh: 1.3 });
  text(`s0-date`,   sx + 24, 113, W - 48, 'MON 30 MARCH 2026 — 3 projects open', 9, MUTED, { ls: 0.06 });

  // summary strip
  rect(`s0-summary`, sx + 24, 130, W - 48, 52, CREAM, { cr: 8 });
  const sumItems = [
    { label: 'Projects', val: '7'    },
    { label: 'Specs',    val: '24'   },
    { label: 'Pending',  val: '£12k' },
  ];
  sumItems.forEach((s, i) => {
    const bx = sx + 24 + i * Math.floor((W - 48) / 3);
    const bw = Math.floor((W - 48) / 3);
    serif(`s0-sum-val-${i}`,  bx, 140, bw, s.val,   18, TEXT,   { align: 'center', weight: 500 });
    text(`s0-sum-lbl-${i}`,   bx, 161, bw, s.label,  9, MUTED,  { align: 'center', ls: 0.04 });
    if (i < 2) rect(`s0-sum-sep-${i}`, bx + bw, 141, 1, 34, BORDER);
  });

  // section label
  text(`s0-sec-lbl`, sx + 24, 196, 140, 'ACTIVE PROJECTS', 9, MUTED, { ls: 0.08 });
  text(`s0-sec-all`, sx + W - 50, 196, 36, 'All →', 9, BRONZE, { align: 'right' });

  const projects = [
    {
      name:   'Kensington Residence',
      client: 'R. Ashford Architects',
      type:   'Structural Glazing',
      stage:  'Specification',
      pct:    72,
      tag:    'IN PROGRESS',
      col:    SAGE,
    },
    {
      name:   'EC1 Office Complex',
      client: 'Paloma Studio',
      type:   'Curtain Wall System',
      stage:  'Quoting',
      pct:    45,
      tag:    'AWAITING QUOTE',
      col:    BRONZE,
    },
    {
      name:   'Shoreditch Pavilion',
      client: 'Harrow + Partners',
      type:   'Bespoke Doors',
      stage:  'Design Review',
      pct:    18,
      tag:    'NEW',
      col:    TERRA,
    },
  ];

  projects.forEach((p, i) => {
    const py = 212 + i * 116;
    rect(`s0-proj-bg-${i}`,   sx + 24,  py,      W - 48,  104, SURFACE, { cr: 10, stroke: BORDER, sw: 1 });
    rect(`s0-proj-left-${i}`, sx + 24,  py,      3,       104, p.col, { cr: 2 });
    serif(`s0-proj-name-${i}`, sx + 38, py + 14,  W - 100, p.name,   15, TEXT, { weight: 500, ls: -0.2 });
    text(`s0-proj-cl-${i}`,    sx + 38, py + 34,  W - 110, p.client,  9, MUTED, { ls: 0.02 });
    text(`s0-proj-type-${i}`,  sx + 38, py + 48,  W - 110, p.type,   10, TEXT);
    // progress bar
    rect(`s0-bar-bg-${i}`,     sx + 38, py + 68,  W - 120, 3, CREAM, { cr: 2 });
    rect(`s0-bar-fg-${i}`,     sx + 38, py + 68,  Math.round((W - 120) * p.pct / 100), 3, p.col, { cr: 2 });
    text(`s0-proj-pct-${i}`,   sx + 38, py + 76,  W - 120, `${p.pct}% complete`, 8, MUTED);
    // tag
    rect(`s0-tag-bg-${i}`,     sx + W - 104, py + 12, 72, 18, CREAM, { cr: 9 });
    text(`s0-tag-${i}`,        sx + W - 101, py + 16, 66, p.tag,   7, p.col, { align: 'center', ls: 0.04, weight: 600 });
  });

  // quick actions
  text(`s0-qa-lbl`, sx + 24, 564, 160, 'QUICK ACTIONS', 9, MUTED, { ls: 0.08 });
  const qa = ['+ New Project', '⊞ Browse Library', '◉ Saved Specs'];
  qa.forEach((label, i) => {
    const qy = 580 + i * 44;
    rect(`s0-qa-bg-${i}`, sx + 24, qy, W - 48, 36, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
    text(`s0-qa-lbl-${i}`, sx + 40, qy + 11, W - 90, label, 11, TEXT);
    text(`s0-qa-arr-${i}`, sx + W - 48, qy + 11, 16, '›', 14, BRONZE, { align: 'right' });
  });

  bottomNav(sx, 0);
}

// ─── SCREEN 1 — MATERIAL LIBRARY ──────────────────────────────────────────────
function screenLibrary(sx) {
  rect(`s1-bg`, sx, 0, W, H, BG);
  header(sx, 'Material Library', '48 systems · glass, steel, stone', 'FILTER', MUTED);

  // search
  rect(`s1-search-bg`, sx + 24, 85, W - 48, 38, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
  text(`s1-search-icon`, sx + 36, 97, 20, '⌕', 14, MUTED);
  text(`s1-search-ph`,   sx + 56, 99, W - 100, 'Search glazing systems...', 11, FAINT);

  // category strip
  const cats = ['All', 'Structural', 'Curtain Wall', 'Doors', 'Windows'];
  let cx2 = sx + 24;
  cats.forEach((cat, i) => {
    const cw2 = cat.length * 7 + 24;
    const active = i === 0;
    rect(`s1-cat-bg-${i}`, cx2, 131, cw2, 26, active ? TEXT : SURFACE, { cr: 13, stroke: active ? 'none' : BORDER, sw: 1 });
    text(`s1-cat-${i}`, cx2 + 4, 138, cw2 - 8, cat, 10, active ? BG : MUTED, { align: 'center', ls: 0.02 });
    cx2 += cw2 + 8;
  });

  // section label
  text(`s1-feat-lbl`, sx + 24, 168, W - 48, 'FEATURED SYSTEMS', 9, MUTED, { ls: 0.08 });

  // 2-column grid — material cards (inspired by fluid.glass product collection)
  const materials = [
    { name: 'SL-7 Structural',  sub: 'Toughened laminate',     code: 'GL-SL-7',  thick: '16mm',  col: SAGE   },
    { name: 'CW-3 Curtain Wall', sub: 'Aluminium frame system', code: 'CW-003',   thick: '12mm',  col: BRONZE },
    { name: 'BD-1 Bespoke Door', sub: 'Pivot frameless entry',  code: 'BD-001',   thick: '10mm',  col: TERRA  },
    { name: 'WD-4 Slim Window',  sub: 'Thermally broken sash',  code: 'WD-004',   thick: '8mm',   col: MUTED  },
  ];

  const colW = Math.floor((W - 56) / 2);
  materials.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = sx + 24 + col * (colW + 8);
    const my = 183 + row * 150;

    rect(`s1-mat-bg-${i}`,   mx, my, colW, 136, SURFACE, { cr: 10, stroke: BORDER, sw: 1 });
    // material swatch area
    rect(`s1-swatch-${i}`,   mx, my, colW, 68, RAISED, { cr: 10 });
    rect(`s1-swatch-b-${i}`, mx, my + 58, colW, 10, RAISED); // overlap corner fix
    // swatch pattern lines (simulating glass material texture)
    for (let li = 0; li < 4; li++) {
      rect(`s1-swl-${i}-${li}`, mx + 8 + li * 14, my + 12, 6, 44, m.col, { cr: 2, op: 0.12 + li * 0.04 });
    }
    rect(`s1-swatch-code-bg-${i}`, mx + colW - 60, my + 8, 52, 18, SURFACE, { cr: 9 });
    text(`s1-swatch-code-${i}`, mx + colW - 56, my + 13, 44, m.code, 7, m.col, { weight: 600, ls: 0.04 });

    serif(`s1-mat-name-${i}`, mx + 10, my + 76, colW - 20, m.name, 12, TEXT, { weight: 500, ls: -0.1 });
    text(`s1-mat-sub-${i}`,   mx + 10, my + 93, colW - 20, m.sub,   9, MUTED, { lh: 1.3 });
    text(`s1-mat-thick-${i}`, mx + 10, my + 110, 60, m.thick, 9, TEXT, { weight: 500 });
    text(`s1-mat-add-${i}`,   mx + colW - 30, my + 108, 20, '+', 14, BRONZE, { align: 'center', weight: 300 });
  });

  // more indicator
  text(`s1-more`, sx + 24, 487, W - 48, '+ 44 more systems available', 10, BRONZE, { align: 'center' });

  bottomNav(sx, 1);
}

// ─── SCREEN 2 — MATERIAL DETAIL ───────────────────────────────────────────────
function screenDetail(sx) {
  rect(`s2-bg`, sx, 0, W, H, BG);
  header(sx, 'SL-7 Structural Glass', 'Toughened laminate · GL-SL-7', '+ SPECIFY', BRONZE);

  // large hero swatch (mimics fluid.glass product close-up)
  rect(`s2-hero-bg`,   sx + 24, 85, W - 48, 160, RAISED, { cr: 12 });
  for (let li = 0; li < 8; li++) {
    rect(`s2-hero-l-${li}`, sx + 28 + li * 20, sy => sy, 12, 160, BRONZE, { cr: 3, op: 0.04 + li * 0.02 });
  }
  // vertical texture lines
  for (let li = 0; li < 8; li++) {
    const lx = sx + 32 + li * ((W - 56) / 8);
    rect(`s2-line-${li}`, lx, 85, 1, 160, BRONZE, { op: 0.06 + (li % 2) * 0.04 });
  }
  // cross lines
  for (let li = 0; li < 5; li++) {
    rect(`s2-hline-${li}`, sx + 24, 85 + li * 32, W - 48, 1, BRONZE, { op: 0.05 });
  }
  // code badge on swatch
  rect(`s2-code-bg`, sx + W - 86, 95, 60, 22, SURFACE, { cr: 11 });
  text(`s2-code`,    sx + W - 82, 101, 52, 'GL-SL-7', 9, BRONZE, { weight: 600, ls: 0.04, align: 'center' });
  // swatch label
  serif(`s2-swatch-name`, sx + 36, 115, W - 100, 'SL-7 Structural', 22, TEXT, { weight: 500, ls: -0.3, lh: 1.2 });
  text(`s2-swatch-sub`,   sx + 36, 142, W - 100, 'Toughened laminate glass', 10, MUTED);
  // material tag strip
  const tags2 = ['STRUCTURAL', 'LAMINATED', 'FIRE-RATED'];
  let tx2 = sx + 36;
  tags2.forEach((t, i) => {
    const tw2 = t.length * 6.2 + 20;
    rect(`s2-tag-bg-${i}`, tx2, 166, tw2, 18, CREAM, { cr: 9 });
    text(`s2-tag-${i}`, tx2 + 4, 171, tw2 - 8, t, 7, SAGE, { ls: 0.05, weight: 600 });
    tx2 += tw2 + 6;
  });

  // specs section
  text(`s2-spec-lbl`, sx + 24, 258, 140, 'SPECIFICATIONS', 9, MUTED, { ls: 0.08 });

  const specs = [
    { label: 'Thickness',       value: '16mm laminate'          },
    { label: 'Max pane size',   value: '3000 × 2400mm'          },
    { label: 'U-value',         value: '1.0 W/m²K'              },
    { label: 'Light trans.',    value: '72%'                     },
    { label: 'Fire rating',     value: 'EI 30 (30 min)'         },
    { label: 'Lead time',       value: '6–8 weeks'              },
  ];
  specs.forEach((s, i) => {
    const sy2 = 274 + i * 38;
    if (i > 0) divider(`s2-spec-div-${i}`, sx + 24, sy2 - 4, W - 48);
    text(`s2-spec-key-${i}`,  sx + 24, sy2, W / 2 - 24, s.label, 10, MUTED);
    text(`s2-spec-val-${i}`,  sx + W/2, sy2, W/2 - 24,  s.value, 10, TEXT, { weight: 500, align: 'right' });
  });

  // CTA
  rect(`s2-cta-bg`, sx + 24, H - 140, W - 48, 46, TEXT, { cr: 10 });
  text(`s2-cta`, sx + 24, H - 122, W - 48, 'Specify for Project', 13, BG, { align: 'center', weight: 500, ls: 0.02 });

  rect(`s2-sec-bg`, sx + 24, H - 84, W - 48, 36, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
  text(`s2-sec`, sx + 24, H - 69, W - 48, 'Save to Library', 11, TEXT, { align: 'center' });

  bottomNav(sx, 2);
}

// ─── SCREEN 3 — SPECIFY (QUOTE BUILDER) ───────────────────────────────────────
function screenSpecify(sx) {
  rect(`s3-bg`, sx, 0, W, H, BG);
  header(sx, 'Specify', 'Kensington Residence · SL-7 Structural', 'QUOTE', BRONZE);

  text(`s3-sub`, sx + 24, 85, W - 48, 'Configure dimensions and quantity', 10, MUTED);

  // project badge
  rect(`s3-proj-bg`, sx + 24, 102, W - 48, 40, CREAM, { cr: 8 });
  text(`s3-proj-icon`,   sx + 38, 116, 20, '◈', 12, BRONZE);
  text(`s3-proj-label`,  sx + 58, 109, W - 100, 'Kensington Residence', 11, TEXT, { weight: 500 });
  text(`s3-proj-sub`,    sx + 58, 126, W - 100, 'R. Ashford Architects · Spec ref: KR-2026-04', 8, MUTED);

  // dimension inputs
  text(`s3-dim-lbl`, sx + 24, 155, W - 48, 'DIMENSIONS', 9, MUTED, { ls: 0.08 });

  const dims = [
    { label: 'Width (mm)',  val: '1800'  },
    { label: 'Height (mm)', val: '2400'  },
    { label: 'Quantity',    val: '12 panes' },
  ];
  dims.forEach((d, i) => {
    const dy = 170 + i * 64;
    text(`s3-dim-key-${i}`, sx + 24, dy, W - 48, d.label, 10, MUTED, { ls: 0.02 });
    rect(`s3-dim-bg-${i}`,  sx + 24, dy + 14, W - 48, 38, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
    serif(`s3-dim-val-${i}`, sx + 38, dy + 24, W - 96, d.val, 15, TEXT, { weight: 400, ls: -0.1 });
    text(`s3-dim-edit-${i}`, sx + W - 52, dy + 28, 16, '✎', 11, BRONZE, { align: 'center' });
  });

  // options
  text(`s3-opt-lbl`, sx + 24, 364, W - 48, 'OPTIONS', 9, MUTED, { ls: 0.08 });

  const opts2 = [
    { label: 'Toughened',  active: true  },
    { label: 'Laminated',  active: true  },
    { label: 'Low-E coat', active: false },
    { label: 'Tinted',     active: false },
  ];
  let ox = sx + 24;
  opts2.forEach((o, i) => {
    const ow = o.label.length * 7 + 28;
    const active = o.active;
    rect(`s3-opt-bg-${i}`,  ox, 378, ow, 28, active ? TEXT : SURFACE, { cr: 14, stroke: active ? 'none' : BORDER, sw: 1 });
    text(`s3-opt-lbl-${i}`, ox + 8, 385, ow - 16, o.label, 10, active ? BG : MUTED, { ls: 0.01 });
    ox += ow + 8;
  });

  // pricing estimate
  divider(`s3-price-div`, sx + 24, 422, W - 48);
  text(`s3-price-lbl`, sx + 24, 432, W / 2, 'ESTIMATED COST', 9, MUTED, { ls: 0.08 });
  serif(`s3-price-val`, sx + 24, 448, W - 48, '£ 8,640', 28, TEXT, { weight: 300, ls: -0.5, lh: 1.1 });
  text(`s3-price-sub`,  sx + 24, 484, W - 48, '12 × SL-7 Structural · 1800 × 2400mm · inc. VAT', 9, MUTED);

  text(`s3-lead-lbl`, sx + 24, 504, 120, 'Lead time', 9, MUTED, { ls: 0.04 });
  text(`s3-lead-val`, sx + W - 48, 504, 120, '6–8 weeks', 9, TEXT, { weight: 500, align: 'right' });

  // add to project CTA
  rect(`s3-cta-bg`, sx + 24, H - 140, W - 48, 46, BRONZE, { cr: 10 });
  text(`s3-cta`, sx + 24, H - 121, W - 48, 'Add to Specification', 13, SURFACE, { align: 'center', weight: 500, ls: 0.02 });
  rect(`s3-sec-bg`, sx + 24, H - 84, W - 48, 36, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
  text(`s3-sec`, sx + 24, H - 69, W - 48, 'Request Full Quote', 11, TEXT, { align: 'center' });

  bottomNav(sx, 3);
}

// ─── SCREEN 4 — PROFILE ───────────────────────────────────────────────────────
function screenProfile(sx) {
  rect(`s4-bg`, sx, 0, W, H, BG);
  header(sx, 'Profile', 'Anya Sorensen · Principal Architect', '', null);

  // avatar
  rect(`s4-av-bg`, sx + 24, 85, 56, 56, CREAM, { cr: 28 });
  serif(`s4-av-init`, sx + 24, 99, 56, 'AS', 22, BRONZE, { align: 'center', weight: 500 });
  serif(`s4-name`,    sx + 92, 92, W - 130, 'Anya Sorensen', 18, TEXT, { weight: 500, ls: -0.2 });
  text(`s4-role`,     sx + 92, 113, W - 130, 'Principal Architect · RIBA', 10, MUTED);
  text(`s4-firm`,     sx + 92, 128, W - 130, 'Sorensen + Shaw Studio', 10, TEXT);

  divider(`s4-div-1`, sx + 24, 154, W - 48);

  // stats
  const stats = [
    { label: 'Projects',  val: '23' },
    { label: 'Specs',     val: '147' },
    { label: 'Saved',     val: '38' },
  ];
  stats.forEach((s, i) => {
    const bx = sx + 24 + i * Math.floor((W - 48) / 3);
    const bw2 = Math.floor((W - 48) / 3);
    serif(`s4-stat-val-${i}`, bx, 162, bw2, s.val,   22, TEXT, { align: 'center', weight: 400 });
    text(`s4-stat-lbl-${i}`,  bx, 186, bw2, s.label,  9, MUTED, { align: 'center', ls: 0.04 });
    if (i < 2) rect(`s4-stat-sep-${i}`, bx + bw2, 162, 1, 42, BORDER);
  });

  divider(`s4-div-2`, sx + 24, 212, W - 48);

  // recent activity
  text(`s4-act-lbl`, sx + 24, 220, W - 48, 'RECENT ACTIVITY', 9, MUTED, { ls: 0.08 });

  const activities = [
    { icon: '⊞', text: 'Added SL-7 to Kensington Residence',     time: '2h ago',  col: SAGE   },
    { icon: '◉', text: 'Viewed CW-3 Curtain Wall System',         time: '5h ago',  col: BRONZE },
    { icon: '◈', text: 'Created EC1 Office Complex project',      time: 'Yesterday', col: TERRA },
    { icon: '⬡', text: 'Saved BD-1 Bespoke Door to library',      time: '2d ago',  col: MUTED  },
    { icon: '⊞', text: 'Submitted quote for Shoreditch Pavilion', time: '3d ago',  col: SAGE   },
  ];
  activities.forEach((a, i) => {
    const ay = 236 + i * 54;
    text(`s4-act-icon-${i}`, sx + 24, ay + 6, 22, a.icon, 14, a.col);
    text(`s4-act-text-${i}`, sx + 50, ay + 4, W - 120, a.text, 10, TEXT, { lh: 1.3 });
    text(`s4-act-time-${i}`, sx + W - 72, ay + 4, 44, a.time,  9, MUTED, { align: 'right' });
    if (i < activities.length - 1) divider(`s4-act-div-${i}`, sx + 24, ay + 44, W - 48);
  });

  // settings cta
  rect(`s4-settings-bg`, sx + 24, H - 140, W - 48, 36, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
  text(`s4-settings`, sx + 24, H - 123, W - 48, '⚙  Settings & Preferences', 11, TEXT, { align: 'center' });
  rect(`s4-logout-bg`, sx + 24, H - 94, W - 48, 36, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
  text(`s4-logout`, sx + 24, H - 77, W - 48, 'Sign Out', 11, MUTED, { align: 'center' });

  bottomNav(sx, 4);
}

// ─── RENDER ALL SCREENS ───────────────────────────────────────────────────────
const screenFns = [screenProjects, screenLibrary, screenDetail, screenSpecify, screenProfile];
screenFns.forEach((fn, i) => {
  const sx = GAP + i * (W + GAP);
  fn(sx);
});

// ─── OUTPUT .PEN FILE ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'GLAZE — Material Specification Platform',
  width: canvas_w,
  height: H,
  fill: '#E8E4DE',
  children: nodes,
};

fs.writeFileSync('/workspace/group/design-studio/glaze.pen', JSON.stringify(pen, null, 2));
console.log(`✓ glaze.pen written — ${nodes.length} nodes, ${SCREENS} screens`);
console.log(`  Canvas: ${canvas_w} × ${H}px`);
