// KEEN — Search Intelligence Platform
// Inspired by: Keytail ("Be the Answer Everywhere People Search") on land-book.com
//              + Equals GTM analytics (clean data-dense light SaaS, land-book)
//              + awwwards.com nominees for data-forward editorial layout
// Theme: LIGHT — clean off-white + electric blue + amber signal
// Typography: Inter (clean sans) + tabular data patterns
// Pencil.dev v2.8 format

const fs = require('fs');

const W = 390;
const H = 844;

const C = {
  bg:       '#F7F5F2',
  surface:  '#FFFFFF',
  surface2: '#F0EEE9',
  border:   '#E8E4DC',
  border2:  '#D4CFC5',
  text:     '#16130E',
  muted:    '#8C8780',
  muted2:   '#B8B3AB',
  accent:   '#2563EB',   // electric blue
  accentBg: '#EBF1FE',
  accent2:  '#F59E0B',   // amber — growth/signal
  amber2:   '#FEF3C7',
  green:    '#16A34A',
  greenBg:  '#DCFCE7',
  red:      '#DC2626',
  redBg:    '#FEE2E2',
  purple:   '#7C3AED',
  purpleBg: '#EDE9FE',
  white:    '#FFFFFF',
};

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rectangle',
    x, y, width: w, height: h,
    fill,
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? null,
    strokeWidth: opts.sw ?? 0,
  };
}

function text(content, x, y, opts = {}) {
  return {
    type: 'text',
    x, y,
    content: String(content),
    fontSize: opts.size ?? 14,
    fontWeight: opts.weight ?? '400',
    fill: opts.color ?? C.text,
    fontFamily: opts.font ?? 'Inter',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
    align: opts.align ?? 'left',
    width: opts.width ?? 300,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return rect(cx - r, cy - r, r * 2, r * 2, fill, { ...opts, r });
}

function line(x1, y1, x2, y2, color, sw = 1) {
  return {
    type: 'line',
    x: x1, y: y1,
    x2, y2,
    stroke: color,
    strokeWidth: sw,
    opacity: 1,
  };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function statusBar(title) {
  return [
    text('9:41', 20, 14, { size: 12, weight: '600', color: C.muted }),
    text(title, W / 2, 14, { size: 12, weight: '700', color: C.text, align: 'center', width: 160 }),
    text('● ●●', W - 60, 14, { size: 7, color: C.muted, align: 'right', width: 60 }),
  ];
}

function bottomNav(active) {
  const items = [
    { icon: '⊞', label: 'Overview' },
    { icon: '◈', label: 'Keywords' },
    { icon: '⟳', label: 'SERP' },
    { icon: '◜', label: 'Gaps' },
  ];
  const tabW = W / items.length;
  return [
    rect(0, H - 74, W, 74, C.surface),
    rect(0, H - 74, W, 1, C.border),
    ...items.flatMap(({ icon, label }, i) => {
      const isActive = i === active;
      const cx = tabW * i + tabW / 2;
      return [
        rect(tabW * i + 10, H - 66, tabW - 20, 50, isActive ? C.accentBg : 'transparent', { r: 10 }),
        text(icon, cx, H - 58, { size: 18, color: isActive ? C.accent : C.muted2, align: 'center', width: 24 }),
        text(label, cx - 20, H - 36, { size: 8, weight: isActive ? '700' : '400', color: isActive ? C.accent : C.muted, align: 'center', width: 40, ls: 0.2 }),
      ];
    }),
  ];
}

function chip(label, x, y, active = false, color = C.accent) {
  const bg = active ? color : C.surface2;
  const tc = active ? C.white : C.muted;
  const w = label.length * 7 + 20;
  return [
    rect(x, y, w, 24, bg, { r: 12, stroke: active ? 'none' : C.border, sw: 1 }),
    text(label, x + w / 2, y + 5, { size: 10, weight: active ? '600' : '400', color: tc, align: 'center', width: w }),
  ];
}

// ─── SCREEN 1: OVERVIEW DASHBOARD ────────────────────────────────────────────

function screen1() {
  // Visibility score ring (simplified as stacked circles)
  function scoreRing(cx, cy, score) {
    return [
      circle(cx, cy, 52, C.accentBg),
      circle(cx, cy, 40, C.surface),
      text(score, cx, cy - 10, { size: 26, weight: '800', color: C.accent, align: 'center', width: 60 }),
      text('VISIBILITY', cx, cy + 10, { size: 7, weight: '700', color: C.muted, align: 'center', width: 60, ls: 1.5 }),
    ];
  }

  // Metric tile
  function metricTile(x, y, w, h, label, value, delta, positive) {
    const dc = positive ? C.green : C.red;
    const db = positive ? C.greenBg : C.redBg;
    return [
      rect(x, y, w, h, C.surface, { r: 12, stroke: C.border, sw: 1 }),
      text(label, x + 14, y + 14, { size: 9, weight: '600', color: C.muted, ls: 0.8 }),
      text(value, x + 14, y + 34, { size: 20, weight: '800', color: C.text, width: w - 28 }),
      // delta badge
      rect(x + 14, y + 62, 44, 16, db, { r: 8 }),
      text(delta, x + 36, y + 64, { size: 8, weight: '700', color: dc, align: 'center', width: 44 }),
    ];
  }

  // Top keyword row
  function kwRow(keyword, pos, vol, change, y) {
    const isUp = change.startsWith('+');
    return [
      rect(12, y, W - 24, 44, C.surface, { r: 8, stroke: C.border, sw: 1 }),
      // position badge
      rect(20, y + 12, 20, 20, C.accentBg, { r: 6 }),
      text(pos, 30, y + 15, { size: 9, weight: '700', color: C.accent, align: 'center', width: 20 }),
      // keyword
      text(keyword, 50, y + 14, { size: 12, weight: '500', color: C.text, width: W - 130 }),
      // vol
      text(vol, W - 96, y + 14, { size: 10, color: C.muted, align: 'right', width: 40 }),
      // change
      rect(W - 50, y + 14, 32, 16, isUp ? C.greenBg : C.redBg, { r: 8 }),
      text(change, W - 50, y + 15, { size: 8, weight: '700', color: isUp ? C.green : C.red, align: 'center', width: 32 }),
    ];
  }

  return [
    rect(0, 0, W, H, C.bg),

    ...statusBar('KEEN'),

    // Header area
    text('Overview', 20, 50, { size: 22, weight: '800', color: C.text }),
    text('keen.io/workspace/rakis', 20, 80, { size: 11, color: C.muted }),

    // Visibility score + 3 tiles
    ...scoreRing(70, 148),
    ...metricTile(138, 106, 108, 88, 'RANKING KWS', '1,847', '+12.4%', true),
    ...metricTile(254, 106, 120, 88, 'AVG POSITION', '11.2', '-1.8', true),

    // Week over week bar
    rect(12, 202, W - 24, 1, C.border),
    text('WEEKLY VISIBILITY', 20, 212, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),

    // Mini bar chart (7 days)
    ...([55, 62, 58, 71, 68, 79, 84].map((h, i) => {
      const bh = h * 0.4;
      const x = 20 + i * 50;
      return [
        rect(x, 260 - bh, 36, bh, i === 6 ? C.accent : C.accentBg, { r: 4 }),
        text(['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], x + 18, 264, { size: 8, color: i === 6 ? C.accent : C.muted, align: 'center', width: 36 }),
      ];
    })).flat(),

    // Top keywords section
    text('TOP KEYWORDS', 20, 284, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),
    ...kwRow('content marketing strategy', '#3', '12.4K', '+2', 298),
    ...kwRow('seo audit checklist', '#7', '8.1K', '+4', 350),
    ...kwRow('keyword research tools', '#11', '22K', '-1', 402),
    ...kwRow('on-page seo tips', '#14', '5.9K', '0', 454),

    // Insights chip strip
    text('QUICK WINS', 20, 506, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),
    rect(12, 520, W - 24, 52, C.surface, { r: 10, stroke: C.amber2, sw: 2 }),
    text('⚡', 24, 535, { size: 16 }),
    text('6 keywords near page 1', 46, 530, { size: 12, weight: '700', color: C.text, width: 210 }),
    text('Small optimisations could push these onto page 1 this week', 46, 548, { size: 10, color: C.muted, width: W - 90 }),

    // Competitor pulse
    rect(12, 582, (W - 30) / 2, 60, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    text('COMPETITORS', 24, 594, { size: 8, weight: '600', color: C.muted, ls: 1 }),
    text('3 new', 24, 610, { size: 16, weight: '800', color: C.text }),
    text('pages indexed', 24, 630, { size: 10, color: C.muted }),

    rect(W / 2 + 6, 582, (W - 30) / 2, 60, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    text('CANNIBALS', W / 2 + 18, 594, { size: 8, weight: '600', color: C.muted, ls: 1 }),
    text('2 URLs', W / 2 + 18, 610, { size: 16, weight: '800', color: C.red }),
    text('competing', W / 2 + 18, 630, { size: 10, color: C.muted }),

    // Action CTA
    rect(12, 652, W - 24, 46, C.accent, { r: 12 }),
    text('Run Full Audit →', W / 2, 668, { size: 13, weight: '700', color: C.white, align: 'center', width: W - 24 }),

    ...bottomNav(0),
  ];
}

// ─── SCREEN 2: KEYWORDS ──────────────────────────────────────────────────────

function screen2() {
  // Full keyword table row with more detail
  function kwDetailRow(kw, pos, vol, diff, intent, y) {
    const intentColors = {
      'Info': C.accentBg,
      'Comm': C.amber2,
      'Trans': C.greenBg,
      'Nav': C.purpleBg,
    };
    const intentText = {
      'Info': C.accent,
      'Comm': '#B45309',
      'Trans': C.green,
      'Nav': C.purple,
    };
    const bg = intentColors[intent] ?? C.accentBg;
    const tc = intentText[intent] ?? C.accent;
    return [
      rect(12, y, W - 24, 58, C.surface, { r: 10, stroke: C.border, sw: 1 }),
      // keyword + intent
      text(kw, 20, y + 10, { size: 11, weight: '600', color: C.text, width: W - 120 }),
      rect(20, y + 30, intent.length * 7 + 12, 16, bg, { r: 8 }),
      text(intent, 20 + (intent.length * 7 + 12) / 2, y + 31, { size: 8, weight: '600', color: tc, align: 'center', width: intent.length * 7 + 12 }),
      // position (far right col stack)
      text('#' + pos, W - 24, y + 10, { size: 13, weight: '700', color: pos <= 10 ? C.green : pos <= 20 ? C.accent2 : C.muted, align: 'right', width: 40 }),
      // vol + diff
      text(vol, W - 80, y + 10, { size: 10, color: C.muted, align: 'right', width: 40 }),
      text('KD ' + diff, W - 80, y + 30, { size: 9, color: diff < 40 ? C.green : diff < 70 ? C.accent2 : C.red, align: 'right', width: 40 }),
    ];
  }

  return [
    rect(0, 0, W, H, C.bg),
    ...statusBar('Keywords'),

    text('Keywords', 20, 50, { size: 22, weight: '800', color: C.text }),

    // Search bar
    rect(12, 78, W - 24, 36, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    text('🔍', 22, 88, { size: 14 }),
    text('Search 1,847 keywords...', 46, 88, { size: 12, color: C.muted2 }),
    // filter icon
    rect(W - 50, 84, 28, 24, C.accentBg, { r: 8 }),
    text('⊟', W - 36, 88, { size: 12, color: C.accent, align: 'center', width: 14 }),

    // Filter chips
    ...[
      { label: 'All', active: true },
      { label: 'P.1 (193)', active: false },
      { label: 'P.2 (384)', active: false },
      { label: 'Rising', active: false },
    ].reduce((acc, { label, active }, i) => {
      const x = 12 + acc.offset;
      const w = label.length * 7 + 22;
      acc.chips.push(...chip(label, x, 124, active));
      acc.offset += w + 8;
      return acc;
    }, { chips: [], offset: 0 }).chips,

    // Column headers
    text('KEYWORD', 20, 160, { size: 8, weight: '700', color: C.muted, ls: 1.2 }),
    text('VOL', W - 80, 160, { size: 8, weight: '700', color: C.muted, ls: 1.2, align: 'right', width: 40 }),
    text('POS', W - 24, 160, { size: 8, weight: '700', color: C.muted, ls: 1.2, align: 'right', width: 40 }),
    rect(12, 174, W - 24, 1, C.border),

    // Rows
    ...kwDetailRow('best seo tools 2025', 4, '18.2K', 62, 'Comm', 182),
    ...kwDetailRow('keyword rank tracking', 8, '9.6K', 45, 'Trans', 248),
    ...kwDetailRow('how to do seo audit', 12, '5.4K', 31, 'Info', 314),
    ...kwDetailRow('content gap analysis', 16, '4.1K', 38, 'Info', 380),
    ...kwDetailRow('serp features guide', 19, '3.8K', 28, 'Info', 446),
    ...kwDetailRow('buy seo software', 22, '6.7K', 71, 'Trans', 512),
    ...kwDetailRow('moz vs ahrefs vs keen', 27, '2.3K', 55, 'Nav', 578),

    // Load more
    rect(12, 648, W - 24, 36, C.surface2, { r: 10, stroke: C.border, sw: 1 }),
    text('Show 1,840 more keywords', W / 2, 660, { size: 11, color: C.muted, align: 'center', width: W - 24 }),

    ...bottomNav(1),
  ];
}

// ─── SCREEN 3: SERP ANALYSIS ─────────────────────────────────────────────────

function screen3() {
  // SERP result card
  function serpResult(rank, title, url, snippet, isOurs, y) {
    return [
      rect(12, y, W - 24, 78, isOurs ? C.accentBg : C.surface, { r: 10, stroke: isOurs ? C.accent + '55' : C.border, sw: isOurs ? 2 : 1 }),
      // rank badge
      rect(20, y + 14, 22, 22, isOurs ? C.accent : C.surface2, { r: 6 }),
      text(rank, 31, y + 18, { size: 9, weight: '700', color: isOurs ? C.white : C.muted, align: 'center', width: 22 }),
      // title
      text(title, 52, y + 14, { size: 11, weight: isOurs ? '700' : '500', color: isOurs ? C.accent : C.text, width: W - 90 }),
      // url
      text(url, 52, y + 30, { size: 9, color: C.muted, width: W - 90 }),
      // snippet
      text(snippet, 52, y + 46, { size: 9, color: C.muted, width: W - 90 }),
      ...(isOurs ? [
        rect(W - 62, y + 14, 42, 16, C.accent, { r: 8 }),
        text('YOURS', W - 41, y + 15, { size: 7, weight: '700', color: C.white, align: 'center', width: 42 }),
      ] : []),
    ];
  }

  return [
    rect(0, 0, W, H, C.bg),
    ...statusBar('SERP Analysis'),

    text('SERP Analysis', 20, 50, { size: 22, weight: '800', color: C.text }),

    // Keyword label
    rect(12, 78, W - 24, 34, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    text('🔍', 22, 88, { size: 13 }),
    text('best seo tools 2025', 44, 88, { size: 12, weight: '600', color: C.text }),
    text('18.2K / mo', W - 24, 88, { size: 9, color: C.muted, align: 'right', width: 80 }),

    // SERP features strip
    text('SERP FEATURES', 20, 124, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),
    ...[
      { label: 'Featured Snippet', active: false },
      { label: 'People Also Ask', active: true },
      { label: 'Images', active: false },
    ].reduce((acc, { label, active }, i) => {
      const x = 12 + acc.offset;
      const w = label.length * 6 + 18;
      acc.items.push(
        rect(x, 138, w, 20, active ? C.amber2 : C.surface2, { r: 10, stroke: active ? '#F59E0B' : C.border, sw: 1 }),
        text(label, x + w / 2, 140, { size: 8, weight: active ? '600' : '400', color: active ? '#B45309' : C.muted, align: 'center', width: w }),
      );
      acc.offset += w + 8;
      return acc;
    }, { items: [], offset: 0 }).items,

    // SERP result list
    text('TOP 5 RESULTS', 20, 170, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),
    ...serpResult('#1', 'Best SEO Tools of 2025 — Tested & Ranked', 'ahrefs.com/blog/best-seo-tools', 'We tested 43 tools so you don\'t have to...', false, 186),
    ...serpResult('#2', 'Top 11 SEO Software Compared (2025 Guide)', 'backlinko.com/best-seo-tools', 'I\'ve used every major SEO platform...', false, 272),
    ...serpResult('#3', 'SEO Tools Compared: Features & Pricing 2025', 'semrush.com/blog/seo-tools', 'The definitive comparison of every major...', false, 358),
    ...serpResult('#4', 'Best SEO Tools: Complete Guide for 2025', 'keen.io/blog/best-seo-tools', 'After testing 50+ platforms, here are the...', true, 444),

    // Position opportunity
    rect(12, 534, W - 24, 50, C.surface, { r: 10, stroke: C.amber2, sw: 2 }),
    text('⬆', 24, 546, { size: 18, color: C.accent2 }),
    text('Opportunity: Jump to #1', 46, 546, { size: 11, weight: '700', color: C.text }),
    text('Competitor #1 has weak backlinks — you can outrank with one fresh update', 46, 564, { size: 9, color: C.muted, width: W - 80 }),

    // Competitor compare row
    rect(12, 594, W - 24, 36, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    text('Compare vs. competitors', 20, 606, { size: 11, color: C.muted }),
    text('→', W - 30, 606, { size: 14, color: C.accent, align: 'right', width: 20 }),

    ...bottomNav(2),
  ];
}

// ─── SCREEN 4: CONTENT GAPS ───────────────────────────────────────────────────

function screen4() {
  // Gap opportunity card
  function gapCard(topic, queries, difficulty, cta, y) {
    return [
      rect(12, y, W - 24, 80, C.surface, { r: 12, stroke: C.border, sw: 1 }),
      text(topic, 20, y + 14, { size: 12, weight: '700', color: C.text, width: W - 100 }),
      text(queries + ' queries · KD ' + difficulty, 20, y + 34, { size: 10, color: C.muted }),
      // difficulty bar
      rect(20, y + 52, W - 90, 6, C.surface2, { r: 3 }),
      rect(20, y + 52, Math.round((difficulty / 100) * (W - 90)), 6, difficulty < 40 ? C.green : difficulty < 70 ? C.accent2 : C.red, { r: 3 }),
      // CTA pill
      rect(W - 96, y + 24, 80, 28, C.accent, { r: 10 }),
      text(cta, W - 56, y + 31, { size: 9, weight: '700', color: C.white, align: 'center', width: 80 }),
    ];
  }

  return [
    rect(0, 0, W, H, C.bg),
    ...statusBar('Content Gaps'),

    text('Content Gaps', 20, 50, { size: 22, weight: '800', color: C.text }),
    text('Topics your competitors rank for — you don\'t', 20, 78, { size: 11, color: C.muted, width: W - 40 }),

    // Summary pill row
    rect(12, 100, W - 24, 52, C.accentBg, { r: 12 }),
    text('◈', 24, 112, { size: 18, color: C.accent }),
    text('312 untapped keyword clusters', 48, 110, { size: 13, weight: '700', color: C.accent }),
    text('Competitors: Ahrefs, Semrush, Moz', 48, 128, { size: 10, color: C.accent, opacity: 0.7 }),

    // Sort chips
    ...[
      { label: 'Easiest', active: true },
      { label: 'Highest Volume', active: false },
      { label: 'Trending', active: false },
    ].reduce((acc, { label, active }, i) => {
      const x = 12 + acc.offset;
      const w = label.length * 7 + 22;
      acc.chips.push(...chip(label, x, 166, active));
      acc.offset += w + 8;
      return acc;
    }, { chips: [], offset: 0 }).chips,

    text('QUICK WINS  ·  KD < 40', 20, 202, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),

    ...gapCard('seo content brief template', '4.2K queries', 28, 'Write Brief', 218),
    ...gapCard('how to fix crawl errors', '6.1K queries', 32, 'Write Brief', 306),
    ...gapCard('internal linking strategy', '3.8K queries', 35, 'Write Brief', 394),
    ...gapCard('core web vitals guide 2025', '9.4K queries', 38, 'Write Brief', 482),

    // Competitor coverage map teaser
    text('COMPETITOR COVERAGE', 20, 576, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),
    rect(12, 592, W - 24, 56, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    // grid of dots representing coverage
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
      const covers = [true, true, false, true, false, false, true, false, true][i];
      return circle(36 + (i % 9) * 34, 620, 8, covers ? C.accentBg : C.surface2,
        { stroke: covers ? C.accent : C.border2, sw: 1.5 });
    }),
    text('Ahrefs', 20, 634, { size: 8, color: C.muted }),
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
      const covers = [false, true, true, false, true, true, false, true, false][i];
      return circle(36 + (i % 9) * 34, 644, 6, covers ? C.amber2 : C.surface2,
        { stroke: covers ? C.accent2 : C.border2, sw: 1 });
    }),

    ...bottomNav(3),
  ];
}

// ─── SCREEN 5: REPORTS ────────────────────────────────────────────────────────

function screen5() {
  function reportCard(title, schedule, lastRun, status, recipients, y) {
    const statusColor = status === 'Sent' ? C.green : status === 'Scheduled' ? C.accent : C.accent2;
    const statusBg = status === 'Sent' ? C.greenBg : status === 'Scheduled' ? C.accentBg : C.amber2;
    return [
      rect(12, y, W - 24, 90, C.surface, { r: 12, stroke: C.border, sw: 1 }),
      // icon
      rect(20, y + 16, 36, 36, C.accentBg, { r: 10 }),
      text('📊', 38, y + 22, { size: 18, align: 'center', width: 16 }),
      // title + schedule
      text(title, 68, y + 16, { size: 12, weight: '700', color: C.text, width: W - 130 }),
      text(schedule, 68, y + 34, { size: 10, color: C.muted, width: W - 130 }),
      // last run
      text(lastRun, 68, y + 52, { size: 9, color: C.muted2 }),
      // recipients avatars (dots)
      ...[0, 1, 2].map(i => circle(W - 52 + i * 12, y + 52, 7, ['#6366F1', '#EC4899', '#F59E0B'][i])),
      text(recipients, W - 28, y + 52, { size: 9, color: C.muted }),
      // status badge
      rect(W - 88, y + 12, 72, 18, statusBg, { r: 9 }),
      text(status, W - 52, y + 14, { size: 8, weight: '700', color: statusColor, align: 'center', width: 72 }),
    ];
  }

  return [
    rect(0, 0, W, H, C.bg),
    ...statusBar('Reports'),

    text('Reports', 20, 50, { size: 22, weight: '800', color: C.text }),

    // New report button
    rect(W - 112, 44, 100, 34, C.accent, { r: 10 }),
    text('+ New Report', W - 62, 55, { size: 10, weight: '700', color: C.white, align: 'center', width: 100 }),

    // Summary strip
    rect(12, 90, W - 24, 52, C.surface, { r: 12, stroke: C.border, sw: 1 }),
    ...[
      { val: '6', label: 'Active' },
      { val: '2', label: 'Paused' },
      { val: '47', label: 'Sent 30d' },
    ].flatMap(({ val, label }, i) => {
      const x = 24 + i * 120;
      return [
        text(val, x, 100, { size: 18, weight: '800', color: i === 0 ? C.accent : C.text }),
        text(label, x, 120, { size: 9, color: C.muted }),
        ...(i < 2 ? [rect(x + 100, 104, 1, 24, C.border)] : []),
      ];
    }),

    // Report cards
    text('SCHEDULED REPORTS', 20, 156, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),
    ...reportCard('Weekly Rankings Digest', 'Every Monday · 08:00', 'Last: Mon 24 Mar', 'Sent', '+3', 172),
    ...reportCard('Monthly Executive Summary', '1st of month · 09:00', 'Last: 1 Mar', 'Scheduled', '+5', 270),
    ...reportCard('Competitor Alert Digest', 'Every Friday · 17:00', 'Last: Fri 28 Mar', 'Sent', '+2', 368),
    ...reportCard('Keyword Movement Report', 'Every Wednesday', 'Last: Wed 26 Mar', 'Paused', '+1', 466),

    // Recent send log
    text('RECENT SENDS', 20, 568, { size: 8, weight: '700', color: C.muted, ls: 1.5 }),
    ...[
      { label: 'Weekly Rankings Digest', time: 'Today · 08:02', icon: '✓', c: C.green },
      { label: 'Competitor Alert Digest', time: 'Fri 28 Mar · 17:00', icon: '✓', c: C.green },
      { label: 'Monthly Summary', time: '1 Mar · 09:00', icon: '✓', c: C.green },
    ].flatMap(({ label, time, icon, c }, i) => {
      const y = 586 + i * 38;
      return [
        rect(12, y, W - 24, 30, C.surface, { r: 8, stroke: C.border, sw: 1 }),
        text(icon, 24, y + 7, { size: 12, color: c }),
        text(label, 42, y + 9, { size: 10, color: C.text, width: W - 130 }),
        text(time, W - 24, y + 9, { size: 9, color: C.muted, align: 'right', width: 100 }),
      ];
    }),

    ...bottomNav(0),
  ];
}

// ─── ASSEMBLE & WRITE ─────────────────────────────────────────────────────────

function flatten(arr) {
  return arr.flat(Infinity).filter(Boolean);
}

const screens = [
  { name: 'Overview',     layers: screen1() },
  { name: 'Keywords',     layers: screen2() },
  { name: 'SERP Analysis',layers: screen3() },
  { name: 'Content Gaps', layers: screen4() },
  { name: 'Reports',      layers: screen5() },
];

const pen = {
  version: '2.8',
  name: 'KEEN',
  width: W,
  height: H,
  fill: C.bg,
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    fill: C.bg,
    children: flatten(s.layers),
  })),
};

fs.writeFileSync('/workspace/group/design-studio/keen.pen', JSON.stringify(pen, null, 2));
console.log('✓ keen.pen written');
pen.screens.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} — ${s.children.length} layers`));
