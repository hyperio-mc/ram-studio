'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'thesis';
const HEARTBEAT = 43;
const W = 390, H = 844;

// Palette — warm parchment editorial light theme
// Inspired by: AfterQuery (CMU Serif + terracotta on lavender-white), Stripe Sessions (parchment + ultra-light type)
const BG     = '#FAF8F3';   // warm parchment
const SURF   = '#FFFFFF';   // pure white cards
const PARCH2 = '#F3EFE6';   // deeper parchment for alternating sections
const TEXT   = '#2A1A0E';   // warm dark brown (primary)
const MUTED  = '#8A7B6E';   // warm taupe (secondary)
const TERRA  = '#B85C38';   // terracotta accent (inspired by AfterQuery's rgb(203,75,22))
const INDIGO = '#4B4BA0';   // deep indigo accent2
const BORDER = '#E4DDD4';   // warm light border
const LEAF   = '#5A7A4A';   // muted sage for tags/success

// Helper elements
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    ...(opts.rx !== undefined && { rx: opts.rx }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke && { stroke: opts.stroke }),
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }) };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content, fontSize: size, fill,
    ...(opts.fw && { fontWeight: opts.fw }),
    ...(opts.font && { fontFamily: opts.font }),
    ...(opts.anchor && { textAnchor: opts.anchor }),
    ...(opts.ls !== undefined && { letterSpacing: opts.ls }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.td && { textDecoration: opts.td }) };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke && { stroke: opts.stroke }),
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }) };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }) };
}

// Shared components
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, BG));
  elements.push(text(16, 28, '9:41', 13, TEXT, { fw: '500' }));
  elements.push(text(374, 28, '●●●', 10, TEXT, { anchor: 'end', opacity: 0.6 }));
}

function bottomNav(elements, active = 0) {
  const labels = ['Search', 'Library', 'Synthesis', 'Profile'];
  const icons = ['◎', '⊟', '⊕', '◉'];
  elements.push(rect(0, H - 80, W, 80, SURF));
  elements.push(line(0, H - 80, W, H - 80, BORDER, { sw: 1 }));
  labels.forEach((label, i) => {
    const x = 49 + i * 73;
    const isActive = i === active;
    elements.push(text(x, H - 53, icons[i], 18, isActive ? TERRA : MUTED, { anchor: 'middle' }));
    elements.push(text(x, H - 30, label, 10, isActive ? TERRA : MUTED, { anchor: 'middle', fw: isActive ? '600' : '400' }));
  });
}

function sectionLabel(elements, x, y, label) {
  elements.push(text(x, y, label.toUpperCase(), 9, TERRA, { fw: '700', ls: 1.5 }));
  elements.push(line(x, y + 4, x + label.length * 7.5, y + 4, TERRA, { sw: 1, opacity: 0.4 }));
}

// ─────────────────────────────────────────
// SCREEN 1: Search — Hero discovery screen
// ─────────────────────────────────────────
function screen1() {
  const elements = [];
  // BG
  elements.push(rect(0, 0, W, H, BG));
  statusBar(elements);

  // Header wordmark
  elements.push(text(W/2, 75, 'THESIS', 13, TEXT, { fw: '700', anchor: 'middle', ls: 3 }));
  elements.push(text(W/2, 92, 'AI Research Assistant', 11, MUTED, { anchor: 'middle', ls: 0.5 }));

  // Large serif headline (simulate editorial serif at scale)
  elements.push(text(20, 155, 'Find the', 42, TEXT, { fw: '300', font: 'Georgia, serif' }));
  elements.push(text(20, 200, 'research', 42, TERRA, { fw: '300', font: 'Georgia, serif' }));
  elements.push(text(20, 245, 'that matters.', 42, TEXT, { fw: '300', font: 'Georgia, serif' }));

  // Subtle serif italic sub
  elements.push(text(20, 273, 'Synthesize literature across 200M+ papers', 13, MUTED, { font: 'Georgia, serif' }));

  // Search bar
  elements.push(rect(20, 295, 350, 52, SURF, { rx: 8, stroke: BORDER, sw: 1.5 }));
  elements.push(circle(46, 321, 9, 'none', { stroke: MUTED, sw: 1.5 }));
  elements.push(line(52, 327, 58, 333, MUTED, { sw: 1.5 }));
  elements.push(text(68, 325, 'Search by topic, author, or question...', 13, MUTED, { opacity: 0.7 }));
  elements.push(rect(326, 303, 36, 36, TERRA, { rx: 6 }));
  elements.push(text(344, 326, '→', 16, SURF, { anchor: 'middle', fw: '600' }));

  // Recent searches label
  sectionLabel(elements, 20, 368, 'Recent Searches');

  const recents = [
    'Transformer attention mechanisms in NLP',
    'CRISPR therapeutic delivery methods',
    'Carbon capture biomimicry approaches',
  ];
  recents.forEach((q, i) => {
    const y = 390 + i * 44;
    elements.push(rect(20, y, 350, 36, PARCH2, { rx: 6 }));
    elements.push(text(38, y + 23, '◷', 11, MUTED));
    elements.push(text(58, y + 23, q, 12, TEXT, { opacity: 0.85 }));
    elements.push(text(362, y + 23, '↗', 12, MUTED, { anchor: 'end', opacity: 0.6 }));
  });

  // Trending section
  sectionLabel(elements, 20, 529, 'Trending in Research');

  const trending = [
    { tag: 'AI', topic: 'Large language models in science', count: '2.4k papers' },
    { tag: 'BIO', topic: 'mRNA delivery mechanisms', count: '1.8k papers' },
    { tag: 'ENV', topic: 'Ocean carbon sequestration', count: '943 papers' },
  ];
  trending.forEach((t, i) => {
    const y = 550 + i * 68;
    elements.push(rect(20, y, 350, 58, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
    // tag pill
    elements.push(rect(32, y + 10, 34, 18, INDIGO, { rx: 4, opacity: 0.12 }));
    elements.push(text(49, y + 23, t.tag, 9, INDIGO, { fw: '700', anchor: 'middle', ls: 0.5 }));
    elements.push(text(74, y + 23, t.topic, 12, TEXT));
    elements.push(text(32, y + 44, t.count, 10, MUTED));
    // trending bar
    elements.push(rect(W - 60, y + 39, 40, 4, BORDER, { rx: 2 }));
    elements.push(rect(W - 60, y + 39, 40 - i * 10, 4, TERRA, { rx: 2, opacity: 0.5 }));
  });

  bottomNav(elements, 0);
  return elements;
}

// ────────────────────────────────────────────
// SCREEN 2: Results — Paper search results
// ────────────────────────────────────────────
function screen2() {
  const elements = [];
  elements.push(rect(0, 0, W, H, BG));
  statusBar(elements);

  // Back + query header
  elements.push(text(20, 75, '←', 18, TEXT));
  elements.push(text(W/2, 75, 'Results', 15, TEXT, { fw: '600', anchor: 'middle' }));

  // Query chip
  elements.push(rect(20, 88, 350, 32, PARCH2, { rx: 16 }));
  elements.push(circle(36, 104, 6, TERRA, { opacity: 0.2 }));
  elements.push(text(48, 109, 'Transformer attention mechanisms in NLP', 11, TEXT));

  // Filter row
  const filters = ['All', 'Since 2023', 'High cited', 'Open access'];
  const fW = [28, 70, 72, 80];
  let fx = 20;
  filters.forEach((f, i) => {
    const w = fW[i];
    const active = i === 0;
    elements.push(rect(fx, 132, w, 24, active ? TERRA : PARCH2, { rx: 12 }));
    elements.push(text(fx + w/2, 148, f, 10, active ? SURF : MUTED, { anchor: 'middle', fw: active ? '600' : '400' }));
    fx += w + 8;
  });

  // Result count
  elements.push(text(20, 174, '3,421 papers', 12, MUTED));
  elements.push(text(370, 174, 'Sort ↓', 11, TERRA, { anchor: 'end' }));

  // Paper cards
  const papers = [
    {
      title: 'Attention Is All You Need',
      authors: 'Vaswani, A., Shazeer, N., et al.',
      journal: 'NeurIPS 2017',
      year: '2017',
      cite: '97,421',
      match: 98,
      saved: true,
      abstract: 'We propose a new network architecture, the Transformer, based on attention mechanisms...',
    },
    {
      title: 'BERT: Pre-training Deep Bidirectional Transformers',
      authors: 'Devlin, J., Chang, M., et al.',
      journal: 'NAACL 2019',
      year: '2019',
      cite: '62,108',
      match: 94,
      saved: false,
      abstract: 'We introduce BERT, a new language model pre-training approach designed for deep...',
    },
    {
      title: 'Language Models are Few-Shot Learners',
      authors: 'Brown, T., Mann, B., et al.',
      journal: 'NeurIPS 2020',
      year: '2020',
      cite: '41,882',
      match: 91,
      saved: true,
      abstract: 'We demonstrate that scaling language models greatly improves task-agnostic, few-shot...',
    },
  ];

  papers.forEach((p, i) => {
    const y = 186 + i * 194;
    elements.push(rect(20, y, 350, 184, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    // Match score bar
    elements.push(rect(20, y, Math.round((p.match/100) * 350), 3, TERRA, { rx: 1.5, opacity: 0.6 }));
    // Match badge
    elements.push(rect(310, y + 12, 44, 18, TERRA, { rx: 9, opacity: 0.1 }));
    elements.push(text(332, y + 25, `${p.match}%`, 10, TERRA, { anchor: 'middle', fw: '700' }));
    // Title
    const titleWords = p.title.split(' ');
    const line1 = titleWords.slice(0, 4).join(' ');
    const line2 = titleWords.slice(4).join(' ');
    elements.push(text(32, y + 34, line1, 13, TEXT, { fw: '600', font: 'Georgia, serif' }));
    if (line2) elements.push(text(32, y + 50, line2, 13, TEXT, { fw: '600', font: 'Georgia, serif' }));
    // Authors
    elements.push(text(32, y + 68, p.authors, 10, MUTED));
    // Journal + year chip
    elements.push(rect(32, y + 82, 80, 16, PARCH2, { rx: 4 }));
    elements.push(text(72, y + 94, p.journal, 9, INDIGO, { anchor: 'middle', fw: '500' }));
    // Abstract
    elements.push(text(32, y + 110, p.abstract.slice(0, 60) + '...', 11, TEXT, { opacity: 0.65 }));
    // Cite count
    elements.push(text(32, y + 136, `◇ ${p.cite} citations`, 10, MUTED));
    // Save button
    elements.push(text(p.saved ? 338 : 338, y + 136, p.saved ? '★ Saved' : '☆ Save', 11, p.saved ? TERRA : MUTED, { anchor: 'end' }));
    // Divider before action row
    elements.push(line(32, y + 152, 358, y + 152, BORDER, { sw: 1 }));
    // Action row
    elements.push(text(32, y + 168, 'Read Abstract', 11, INDIGO));
    elements.push(text(160, y + 168, '·', 11, BORDER));
    elements.push(text(170, y + 168, 'Add to Synthesis', 11, INDIGO));
    elements.push(text(316, y + 168, 'PDF →', 11, TERRA, { fw: '600' }));
  });

  bottomNav(elements, 0);
  return elements;
}

// ──────────────────────────────────────────────────────
// SCREEN 3: Paper Detail — Deep read with AI annotation
// ──────────────────────────────────────────────────────
function screen3() {
  const elements = [];
  elements.push(rect(0, 0, W, H, BG));
  statusBar(elements);

  // Header
  elements.push(text(20, 75, '←', 18, TEXT));
  elements.push(text(W/2, 75, 'Paper Detail', 15, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(370, 75, '⋯', 18, MUTED, { anchor: 'end' }));

  // Match badge + journal
  elements.push(rect(20, 90, 48, 20, TERRA, { rx: 10, opacity: 0.1 }));
  elements.push(text(44, 104, '98% match', 10, TERRA, { anchor: 'middle', fw: '600' }));
  elements.push(rect(76, 90, 68, 20, INDIGO, { rx: 10, opacity: 0.1 }));
  elements.push(text(110, 104, 'NeurIPS 2017', 10, INDIGO, { anchor: 'middle', fw: '500' }));
  elements.push(rect(152, 90, 68, 20, LEAF, { rx: 10, opacity: 0.1 }));
  elements.push(text(186, 104, 'Open Access', 10, LEAF, { anchor: 'middle', fw: '500' }));

  // Paper title (large editorial serif)
  elements.push(text(20, 135, 'Attention Is All', 24, TEXT, { fw: '400', font: 'Georgia, serif' }));
  elements.push(text(20, 163, 'You Need', 24, TEXT, { fw: '400', font: 'Georgia, serif' }));
  elements.push(text(20, 185, 'Vaswani, Shazeer, Parmar, Uszkoreit et al., 2017', 11, MUTED));

  // Horizontal rule
  elements.push(line(20, 198, 370, 198, BORDER, { sw: 1 }));

  // Stats row
  const stats = [['97,421', 'Citations'], ['2017', 'Published'], ['15', 'Pages'], ['94', 'Ref. papers']];
  stats.forEach((s, i) => {
    const x = 20 + i * 88;
    elements.push(text(x + 44, 220, s[0], 16, TEXT, { anchor: 'middle', fw: '600' }));
    elements.push(text(x + 44, 235, s[1], 9, MUTED, { anchor: 'middle' }));
    if (i < 3) elements.push(line(x + 87, 208, x + 87, 242, BORDER, { sw: 1 }));
  });

  elements.push(line(20, 248, 370, 248, BORDER, { sw: 1 }));

  // AI Summary section
  elements.push(rect(20, 258, 350, 118, PARCH2, { rx: 8 }));
  elements.push(rect(20, 258, 3, 118, TERRA, { rx: 1.5 }));
  elements.push(text(32, 278, 'AI Summary', 10, TERRA, { fw: '700', ls: 1 }));
  elements.push(text(32, 296, 'This landmark paper introduces the Transformer', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 312, 'architecture, eliminating recurrence in favor of', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 328, 'self-attention. Achieves SOTA on WMT 2014', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 344, 'EN-DE with 28.4 BLEU. Now the backbone of', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 360, 'nearly all modern language models.', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));

  // Key concepts
  sectionLabel(elements, 20, 390, 'Key Concepts');
  const concepts = ['Self-Attention', 'Multi-Head Attention', 'Positional Encoding', 'Encoder-Decoder', 'Scaled Dot-Product'];
  let cx = 20;
  concepts.forEach((c, i) => {
    const w = c.length * 7 + 16;
    if (cx + w > 370) { cx = 20; }
    const row = cx === 20 && i > 0 ? 428 : 410;
    elements.push(rect(cx, row, w, 20, PARCH2, { rx: 10, stroke: BORDER, sw: 1 }));
    elements.push(text(cx + w/2, row + 14, c, 10, TEXT, { anchor: 'middle', opacity: 0.8 }));
    cx += w + 8;
  });

  // Related papers header
  sectionLabel(elements, 20, 458, 'Related Papers');

  const related = [
    { n: '01', title: 'BERT: Bidirectional Transformers', cite: '62k' },
    { n: '02', title: 'GPT-3: Language Models as Few-Shot Learners', cite: '41k' },
    { n: '03', title: 'Vision Transformer (ViT)', cite: '28k' },
  ];
  related.forEach((r, i) => {
    const y = 474 + i * 56;
    elements.push(rect(20, y, 350, 48, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(text(36, y + 20, r.n, 11, TERRA, { fw: '700', font: 'Georgia, serif', opacity: 0.7 }));
    elements.push(line(52, y + 10, 52, y + 38, BORDER, { sw: 1 }));
    elements.push(text(62, y + 22, r.title, 12, TEXT));
    elements.push(text(62, y + 36, `◇ ${r.cite} citations`, 10, MUTED));
    elements.push(text(362, y + 29, '→', 13, MUTED, { anchor: 'end' }));
  });

  // CTA buttons
  elements.push(rect(20, 726, 167, 42, TERRA, { rx: 8 }));
  elements.push(text(104, 752, 'Add to Synthesis', 13, SURF, { anchor: 'middle', fw: '600' }));
  elements.push(rect(196, 726, 174, 42, SURF, { rx: 8, stroke: BORDER, sw: 1.5 }));
  elements.push(text(283, 752, 'Read Full PDF →', 13, TEXT, { anchor: 'middle', fw: '500' }));

  bottomNav(elements, 0);
  return elements;
}

// ────────────────────────────────────────────────────────
// SCREEN 4: Synthesis — AI-generated literature review
// ────────────────────────────────────────────────────────
function screen4() {
  const elements = [];
  elements.push(rect(0, 0, W, H, BG));
  statusBar(elements);

  elements.push(text(20, 75, '←', 18, TEXT));
  elements.push(text(W/2, 75, 'Synthesis', 15, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(370, 75, '↑ Export', 13, TERRA, { anchor: 'end', fw: '600' }));

  // Topic header
  elements.push(text(20, 104, 'Transformer attention mechanisms in NLP', 14, TEXT, { fw: '600' }));
  elements.push(text(20, 122, '12 papers · Updated just now · 43 cited works', 11, MUTED));

  // Progress bar for synthesis completion
  elements.push(rect(20, 132, 350, 4, BORDER, { rx: 2 }));
  elements.push(rect(20, 132, 322, 4, TERRA, { rx: 2, opacity: 0.6 }));

  // Synthesis sections
  sectionLabel(elements, 20, 150, 'Introduction');
  elements.push(rect(20, 162, 350, 90, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
  elements.push(rect(20, 162, 3, 90, INDIGO, { rx: 1.5 }));
  elements.push(text(32, 180, 'Transformer architectures have fundamentally', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 196, 'reshaped natural language processing since', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 212, 'Vaswani et al. (2017) [1]. The elimination of', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 228, 'recurrence enabled unprecedented parallelism', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 244, 'and scale in language model training.', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));

  // Citation badge [1]
  elements.push(rect(319, 216, 36, 18, TERRA, { rx: 4, opacity: 0.1 }));
  elements.push(text(337, 229, '[1]', 10, TERRA, { anchor: 'middle', fw: '600' }));

  sectionLabel(elements, 20, 268, 'Key Findings');
  elements.push(rect(20, 280, 350, 108, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
  elements.push(rect(20, 280, 3, 108, LEAF, { rx: 1.5 }));

  const findings = [
    'Self-attention captures long-range dependencies that RNNs miss',
    'Multi-head attention enables attending to multiple positions',
    'Pre-training + fine-tuning paradigm democratised NLP capabilities',
  ];
  findings.forEach((f, i) => {
    const y = 296 + i * 30;
    elements.push(circle(31, y + 6, 4, LEAF, { opacity: 0.3 }));
    elements.push(text(42, y + 10, f, 11, TEXT, { opacity: 0.85 }));
  });

  sectionLabel(elements, 20, 402, 'Research Gaps');
  elements.push(rect(20, 414, 350, 88, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
  elements.push(rect(20, 414, 3, 88, TERRA, { rx: 1.5 }));
  elements.push(text(32, 432, 'Despite advances, computational complexity of', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 448, 'attention (O(n²)) remains a constraint for long', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 464, 'sequences. Sparse attention variants [8][12]', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
  elements.push(text(32, 480, 'address this partially but consensus is lacking.', 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));

  // Citations list
  sectionLabel(elements, 20, 514, 'Sources (12)');
  const cites = [
    '[1] Vaswani et al., 2017 — Attention Is All You Need',
    '[2] Devlin et al., 2019 — BERT',
    '[3] Brown et al., 2020 — GPT-3',
  ];
  cites.forEach((c, i) => {
    const y = 530 + i * 36;
    elements.push(rect(20, y, 350, 28, PARCH2, { rx: 6 }));
    elements.push(text(32, y + 18, c, 11, TEXT, { opacity: 0.75 }));
    elements.push(text(362, y + 18, '↗', 11, TERRA, { anchor: 'end' }));
  });

  // More citations indicator
  elements.push(text(W/2, 642, '+ 9 more papers', 11, TERRA, { anchor: 'middle' }));

  // Export CTA
  elements.push(rect(20, 660, 350, 46, TERRA, { rx: 8 }));
  elements.push(text(W/2, 689, 'Export as PDF · Word · BibTeX', 14, SURF, { anchor: 'middle', fw: '600' }));

  // Tags
  const tags = ['Add Section', 'AI Rewrite', 'Check Gaps', 'Citation Style'];
  let tx = 20;
  tags.forEach(t => {
    const w = t.length * 7 + 20;
    elements.push(rect(tx, 716, w, 26, SURF, { rx: 13, stroke: BORDER, sw: 1 }));
    elements.push(text(tx + w/2, 733, t, 11, TEXT, { anchor: 'middle', opacity: 0.75 }));
    tx += w + 8;
  });

  bottomNav(elements, 2);
  return elements;
}

// ────────────────────────────────────────────
// SCREEN 5: Library — Saved papers + collections
// ────────────────────────────────────────────
function screen5() {
  const elements = [];
  elements.push(rect(0, 0, W, H, BG));
  statusBar(elements);

  elements.push(text(W/2, 75, 'My Library', 16, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(370, 75, '+ New', 13, TERRA, { anchor: 'end', fw: '600' }));

  // Stats row
  elements.push(rect(20, 90, 350, 64, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
  const lstats = [['28', 'Saved Papers'], ['4', 'Syntheses'], ['3', 'Collections']];
  lstats.forEach((s, i) => {
    const x = 62 + i * 110;
    elements.push(text(x, 118, s[0], 20, TERRA, { anchor: 'middle', fw: '700' }));
    elements.push(text(x, 136, s[1], 10, MUTED, { anchor: 'middle' }));
    if (i < 2) elements.push(line(x + 50, 102, x + 50, 142, BORDER, { sw: 1 }));
  });

  // Collections
  sectionLabel(elements, 20, 168, 'Collections');

  const collections = [
    { name: 'NLP & Transformers', count: 12, color: INDIGO },
    { name: 'CRISPR Delivery', count: 8, color: LEAF },
    { name: 'Climate Science', count: 5, color: TERRA },
  ];
  collections.forEach((c, i) => {
    const y = 184 + i * 58;
    elements.push(rect(20, y, 350, 48, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(rect(20, y, 4, 48, c.color, { rx: 2 }));
    elements.push(text(36, y + 20, c.name, 13, TEXT, { fw: '600' }));
    elements.push(text(36, y + 36, `${c.count} papers`, 11, MUTED));
    elements.push(text(362, y + 29, '→', 14, MUTED, { anchor: 'end' }));
    // mini bars
    for (let b = 0; b < 5; b++) {
      const bh = 4 + Math.random() * 14;
      elements.push(rect(W - 70 + b * 10, y + 38 - bh, 6, bh, c.color, { rx: 2, opacity: 0.25 }));
    }
  });

  // Recent papers
  sectionLabel(elements, 20, 362, 'Recently Saved');

  const recent = [
    { title: 'Attention Is All You Need', journal: 'NeurIPS 2017', read: 80 },
    { title: 'BERT: Bidirectional Transformers for Language', journal: 'NAACL 2019', read: 45 },
    { title: 'Efficient Transformers: A Survey', journal: 'ACM Computing 2022', read: 20 },
    { title: 'FlashAttention: Fast Exact Attention', journal: 'NeurIPS 2022', read: 0 },
  ];
  recent.forEach((r, i) => {
    const y = 378 + i * 72;
    elements.push(rect(20, y, 350, 62, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
    // Read progress bar along top
    elements.push(rect(20, y, 350, 3, BORDER, { rx: 1.5 }));
    if (r.read > 0) elements.push(rect(20, y, Math.round(r.read/100 * 350), 3, LEAF, { rx: 1.5, opacity: 0.7 }));
    elements.push(text(32, y + 22, r.title, 12, TEXT, { fw: '600', font: 'Georgia, serif' }));
    elements.push(text(32, y + 38, r.journal, 10, MUTED));
    elements.push(text(32, y + 52, r.read === 0 ? '· Unread' : `· ${r.read}% read`, 10, r.read > 0 ? LEAF : MUTED, { opacity: r.read === 0 ? 0.6 : 1 }));
    elements.push(text(362, y + 32, '★', 14, TERRA, { anchor: 'end', opacity: 0.85 }));
  });

  bottomNav(elements, 1);
  return elements;
}

// ────────────────────────────────────────────────────
// SCREEN 6: Research Profile — Scholar identity + output
// ────────────────────────────────────────────────────
function screen6() {
  const elements = [];
  elements.push(rect(0, 0, W, H, BG));
  statusBar(elements);

  elements.push(text(W/2, 75, 'Your Profile', 15, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(370, 75, '⚙', 18, MUTED, { anchor: 'end' }));

  // Avatar + name block
  elements.push(rect(20, 90, 350, 100, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
  elements.push(circle(72, 140, 30, PARCH2));
  elements.push(text(72, 145, '◉', 22, TERRA, { anchor: 'middle' }));
  elements.push(text(120, 126, 'Dr. Amara Osei', 16, TEXT, { fw: '600' }));
  elements.push(text(120, 144, 'AI & Cognitive Systems', 12, MUTED));
  elements.push(text(120, 160, 'MIT CSAIL · Cambridge, MA', 11, MUTED, { opacity: 0.7 }));
  elements.push(rect(304, 110, 54, 22, TERRA, { rx: 11, opacity: 0.1 }));
  elements.push(text(331, 125, 'Pro Plan', 10, TERRA, { anchor: 'middle', fw: '600' }));

  // Output stats
  const ostats = [['847', 'Searches'], ['28', 'Papers Saved'], ['6', 'Syntheses'], ['4', 'Exports']];
  ostats.forEach((s, i) => {
    const x = 20 + i * 88;
    elements.push(rect(x, 200, 80, 58, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(text(x + 40, 224, s[0], 18, TEXT, { anchor: 'middle', fw: '700' }));
    elements.push(text(x + 40, 240, s[1], 9, MUTED, { anchor: 'middle' }));
  });

  // Research interests
  sectionLabel(elements, 20, 272, 'Research Interests');
  const interests = ['Large Language Models', 'Attention Mechanisms', 'Computational Linguistics', 'Knowledge Graphs', 'NLP Benchmarks'];
  let ix = 20, iy = 286;
  interests.forEach(tag => {
    const w = tag.length * 7 + 20;
    if (ix + w > 370) { ix = 20; iy += 30; }
    elements.push(rect(ix, iy, w, 22, PARCH2, { rx: 11, stroke: BORDER, sw: 1 }));
    elements.push(text(ix + w/2, iy + 15, tag, 10, TEXT, { anchor: 'middle', opacity: 0.8 }));
    ix += w + 8;
  });

  // Activity heatmap (weekly reading)
  sectionLabel(elements, 20, 342, 'Reading Activity (12 weeks)');
  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      const intensity = Math.random();
      const fill = intensity < 0.2 ? BORDER
        : intensity < 0.4 ? `rgba(184,92,56,0.2)`
        : intensity < 0.7 ? `rgba(184,92,56,0.5)`
        : TERRA;
      elements.push(rect(20 + week * 28, 358 + day * 12, 22, 10, fill, { rx: 2 }));
    }
  }

  // Recommended next
  sectionLabel(elements, 20, 450, 'Recommended For You');
  const recs = [
    { title: 'FlashAttention-2: Faster Attention', journal: 'ICLR 2024', why: 'Based on your Transformer searches' },
    { title: 'Mamba: Linear-Time Sequence Modeling', journal: 'arXiv 2023', why: 'Trending in your field' },
    { title: 'Mistral 7B: Open Language Model', journal: 'arXiv 2023', why: 'Related to BERT in your library' },
  ];
  recs.forEach((r, i) => {
    const y = 466 + i * 76;
    elements.push(rect(20, y, 350, 66, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(text(32, y + 20, r.title, 12, TEXT, { fw: '600', font: 'Georgia, serif' }));
    elements.push(text(32, y + 36, r.journal, 10, MUTED));
    elements.push(text(32, y + 52, r.why, 10, INDIGO, { opacity: 0.8 }));
    elements.push(text(362, y + 34, '+ Save', 11, TERRA, { anchor: 'end', fw: '600' }));
  });

  bottomNav(elements, 3);
  return elements;
}

// ─── Assemble pen ───
const screens = [
  { name: 'Search', elements: screen1() },
  { name: 'Results', elements: screen2() },
  { name: 'Paper Detail', elements: screen3() },
  { name: 'Synthesis', elements: screen4() },
  { name: 'Library', elements: screen5() },
  { name: 'Profile', elements: screen6() },
];

const total = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'THESIS — AI Research Assistant',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: total,
    palette: { BG, SURF, TEXT, TERRA, INDIGO, MUTED, BORDER },
    inspiration: [
      'AfterQuery (lapa.ninja/ai) — CMU Serif + terracotta on lavender-white',
      'Stripe Sessions (godly.website) — ultra-light Söhne (weight 250) on parchment',
      'Tavus (lapa.ninja/ai) — retro serif + warm parchment editorial warmth',
    ],
  },
  screens: screens.map((s, i) => ({
    id: `screen-${i+1}`,
    name: s.name,
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"/>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`THESIS: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
