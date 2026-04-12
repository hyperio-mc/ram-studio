#!/usr/bin/env node
/**
 * RAM Design Studio — Slideshow Generator
 * Generates a .pen file with 16:9 presentation slides
 */

const fs = require('fs');

const W = 1280;
const H = 720;
const GAP = W + 80;

function uid(p = 'el') { return `${p}_${Math.random().toString(36).slice(2,10)}`; }

// ─── Primitives ────────────────────────────────────────────────────────────────

function text(content, opts = {}) {
  return {
    id: uid('txt'), type: 'text',
    x: opts.x || 0, y: opts.y || 0,
    width: opts.width, height: opts.height,
    content,
    fontFamily: opts.font || 'Inter',
    fontSize: opts.size || 16,
    fontWeight: opts.weight || '400',
    fill: opts.color || '#ffffff',
    textAlign: opts.align || 'left',
    textGrowth: opts.width ? 'fixed-width' : 'auto',
  };
}

function rect(opts = {}) {
  return {
    id: uid('rect'), type: 'rectangle',
    x: opts.x || 0, y: opts.y || 0,
    width: opts.w || 100, height: opts.h || 40,
    fill: opts.fill || '#ffffff',
    cornerRadius: opts.r || 0,
    stroke: opts.stroke,
  };
}

function frame(opts = {}) {
  return {
    id: opts.id || uid('frame'), type: 'frame',
    x: opts.x || 0, y: opts.y || 0,
    width: opts.w || 200, height: opts.h || 100,
    fill: opts.fill || 'transparent',
    cornerRadius: opts.r || 0,
    layout: opts.layout || 'none',
    gap: opts.gap || 0,
    padding: opts.pad || 0,
    justifyContent: opts.jc || 'start',
    alignItems: opts.ai || 'start',
    children: opts.children || [],
    clip: opts.clip !== undefined ? opts.clip : false,
  };
}

function pill(label, opts = {}) {
  return frame({
    x: opts.x, y: opts.y, w: opts.w || 160, h: 36,
    fill: opts.fill || 'rgba(255,255,255,0.1)',
    r: 999,
    layout: 'horizontal', jc: 'center', ai: 'center',
    children: [text(label, { size: 13, weight: '600', color: opts.color || '#ffffff' })],
  });
}

function divider(opts = {}) {
  return rect({ x: opts.x||0, y: opts.y||0, w: opts.w||60, h: 3, fill: opts.fill||'#00ffcc', r: 2 });
}

function dot(x, y, active, color) {
  return rect({ x, y, w: active ? 24 : 8, h: 8, fill: active ? color : 'rgba(255,255,255,0.25)', r: 4 });
}

function logo(x, y) {
  return frame({
    x, y, w: 120, h: 28, layout: 'horizontal', ai: 'center', gap: 8,
    children: [
      rect({ w: 8, h: 24, fill: '#00ffcc', r: 2 }),
      text('RAM STUDIO', { size: 12, weight: '700', color: '#00ffcc' }),
    ],
  });
}

function slideNum(n, x, y) {
  return text(`0${n} / 05`, { x, y, size: 12, weight: '500', color: 'rgba(255,255,255,0.3)', align: 'right' });
}

// ─── Slide backgrounds ─────────────────────────────────────────────────────────

function darkBg(xOffset) {
  return [
    rect({ x: xOffset, w: W, h: H, fill: '#080810' }),
    // subtle grid lines
    rect({ x: xOffset, y: 0, w: W, h: 1, fill: 'rgba(255,255,255,0.03)' }),
    rect({ x: xOffset + W/2, y: 0, w: 1, h: H, fill: 'rgba(255,255,255,0.03)' }),
    // accent glow
    { ...rect({ x: xOffset - 200, y: -200, w: 600, h: 600, fill: '#00ffcc', r: 300 }),
      fill: { type: 'color', color: '#00ffcc', opacity: 0.04 } },
  ];
}

function progressBar(xOffset, slideN, color = '#00ffcc') {
  const barW = Math.round((slideN / 5) * W);
  return rect({ x: xOffset, y: H - 3, w: barW, h: 3, fill: color });
}

// ─── Slides ────────────────────────────────────────────────────────────────────

function slide1(i) {
  const x = i * GAP;
  const PC = '#00ffcc';
  return frame({
    id: uid('slide'), x, y: 0, w: W, h: H, fill: '#080810', clip: true,
    children: [
      // bg layers
      { ...rect({ x: -100, y: -100, w: 700, h: 700, r: 350, fill: '#00ffcc' }),
        fill: { type: 'color', color: '#00ffcc', opacity: 0.05 } },
      { ...rect({ x: W - 300, y: H - 300, w: 500, h: 500, r: 250, fill: '#6366f1' }),
        fill: { type: 'color', color: '#6366f1', opacity: 0.08 } },
      rect({ x: 0, y: H-3, w: W, h: 3, fill: PC }),

      logo(60, 48),
      slideNum(1, W - 80, 52),

      // eyebrow
      pill('Introducing', { x: 60, y: 160, w: 130, fill: 'rgba(0,255,204,0.12)', color: PC }),

      // headline
      text('RAM', { x: 60, y: 210, size: 120, weight: '800', color: '#ffffff' }),
      text('Design Studio.', { x: 60, y: 330, size: 72, weight: '700', color: PC }),

      // tagline
      text('Prompt → Screens → Canvas → Download.', {
        x: 62, y: 436, size: 22, weight: '400',
        color: 'rgba(255,255,255,0.55)', width: 700,
      }),

      divider({ x: 62, y: 490, w: 80, fill: PC }),

      text('Built for the Grid. Powered by 2026 design intelligence.', {
        x: 62, y: 514, size: 15, weight: '400',
        color: 'rgba(255,255,255,0.35)', width: 600,
      }),

      // slide dots
      dot(60, H - 30, true, PC),
      dot(92, H - 30, false, PC),
      dot(108, H - 30, false, PC),
      dot(124, H - 30, false, PC),
      dot(140, H - 30, false, PC),
    ],
  });
}

function slide2(i) {
  const x = i * GAP;
  const PC = '#6366f1';

  const steps = [
    { n: '01', label: 'Describe your app', sub: 'Plain English prompt' },
    { n: '02', label: 'Archetype detected', sub: '10 app types, 2026 palettes' },
    { n: '03', label: '.pen file generated', sub: 'pencil.dev v2.8 format' },
    { n: '04', label: 'Canvas rendered', sub: 'Live preview in browser' },
    { n: '05', label: 'Download & edit', sub: 'Open in pencil.dev' },
  ];

  const stepEls = steps.flatMap(({ n, label, sub }, idx) => {
    const sy = 200 + idx * 90;
    return [
      rect({ x: 100, y: sy + 8, w: 40, h: 40, fill: idx === 0 ? PC : 'rgba(99,102,241,0.15)', r: 20 }),
      text(n, { x: 112, y: sy + 18, size: 13, weight: '700', color: idx === 0 ? '#fff' : 'rgba(255,255,255,0.4)' }),
      text(label, { x: 160, y: sy + 10, size: 18, weight: '600', color: idx === 0 ? '#ffffff' : 'rgba(255,255,255,0.5)' }),
      text(sub, { x: 160, y: sy + 34, size: 13, color: 'rgba(255,255,255,0.3)' }),
      ...(idx < 4 ? [rect({ x: 119, y: sy + 50, w: 2, h: 38, fill: 'rgba(99,102,241,0.3)' })] : []),
    ];
  });

  return frame({
    id: uid('slide'), x, y: 0, w: W, h: H, fill: '#080810', clip: true,
    children: [
      { ...rect({ x: W - 400, y: -50, w: 600, h: 600, r: 300, fill: PC }),
        fill: { type: 'color', color: PC, opacity: 0.06 } },
      progressBar(x, 2, PC),
      logo(60, 48),
      slideNum(2, W - 80, 52),

      pill('How it works', { x: 60, y: 120, w: 140, fill: 'rgba(99,102,241,0.15)', color: PC }),
      text('From idea to', { x: 60, y: 160, size: 52, weight: '800', color: '#fff' }),
      text('screens in seconds.', { x: 60, y: 216, size: 52, weight: '800', color: PC }),

      ...stepEls,

      // Right side graphic
      rect({ x: W - 380, y: 160, w: 300, h: 420, fill: '#0d0d1a', r: 16,
             stroke: { thickness: 1, fill: 'rgba(99,102,241,0.3)' } }),
      text('"A fintech app called\nWealthTrack for\ntracking investments"', {
        x: W - 360, y: 190, size: 14, weight: '500', color: 'rgba(255,255,255,0.7)', width: 260,
      }),
      rect({ x: W - 380, y: 280, w: 300, h: 1, fill: 'rgba(255,255,255,0.08)' }),
      text('✅ WealthTrack', { x: W - 360, y: 300, size: 13, weight: '600', color: PC }),
      text('🎨 fintech archetype → #3b82f6', { x: W - 360, y: 326, size: 12, color: 'rgba(255,255,255,0.5)' }),
      text('📱 4 screens generated', { x: W - 360, y: 350, size: 12, color: 'rgba(255,255,255,0.5)' }),
      text('📦 28.1 KB .pen file', { x: W - 360, y: 374, size: 12, color: 'rgba(255,255,255,0.5)' }),
      text('🔗 Published to Zenbin', { x: W - 360, y: 398, size: 12, color: 'rgba(255,255,255,0.5)' }),

      dot(60, H - 30, false, PC), dot(76, H - 30, true, PC),
      dot(108, H - 30, false, PC), dot(124, H - 30, false, PC), dot(140, H - 30, false, PC),
    ],
  });
}

function slide3(i) {
  const x = i * GAP;
  const PC = '#14b8a6';

  const trends = [
    { icon: '🪟', title: 'Glassmorphism', desc: 'Frosted glass surfaces & layered depth' },
    { icon: '🎨', title: 'Dopamine Design', desc: 'Bold, saturated 2026 palettes' },
    { icon: '⊞', title: 'Bento Grid', desc: 'Modular dashboard layouts' },
    { icon: '✦', title: 'Soft-Glow Gradients', desc: 'Atmospheric mesh gradients' },
    { icon: '🌑', title: 'Dark Mode First', desc: 'Premium brand expression' },
    { icon: '📐', title: 'Auto-Layout', desc: 'Flexbox-style responsive frames' },
  ];

  const cards = trends.map(({ icon, title, desc }, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const cx = 60 + col * 240;
    const cy = 260 + row * 160;
    return [
      rect({ x: cx, y: cy, w: 210, h: 130, fill: '#0d0d1a', r: 12,
             stroke: { thickness: 1, fill: 'rgba(20,184,166,0.2)' } }),
      text(icon, { x: cx + 16, y: cy + 16, size: 24 }),
      text(title, { x: cx + 16, y: cy + 56, size: 15, weight: '700', color: '#fff' }),
      text(desc, { x: cx + 16, y: cy + 80, size: 12, color: 'rgba(255,255,255,0.4)', width: 178 }),
    ];
  }).flat();

  return frame({
    id: uid('slide'), x, y: 0, w: W, h: H, fill: '#080810', clip: true,
    children: [
      { ...rect({ x: 200, y: -100, w: 500, h: 500, r: 250, fill: PC }),
        fill: { type: 'color', color: PC, opacity: 0.05 } },
      progressBar(x, 3, PC),
      logo(60, 48),
      slideNum(3, W - 80, 52),

      pill('Design knowledge', { x: 60, y: 120, w: 180, fill: 'rgba(20,184,166,0.12)', color: PC }),
      text('2026 trends.', { x: 60, y: 160, size: 52, weight: '800', color: '#fff' }),
      text('Built right in.', { x: 60, y: 216, size: 52, weight: '800', color: PC }),

      // right stat
      rect({ x: W - 200, y: 120, w: 160, h: 90, fill: '#0d0d1a', r: 12,
             stroke: { thickness: 1, fill: 'rgba(20,184,166,0.2)' } }),
      text('10', { x: W - 180, y: 132, size: 48, weight: '800', color: PC }),
      text('app archetypes', { x: W - 180, y: 186, size: 12, color: 'rgba(255,255,255,0.4)' }),

      ...cards,

      dot(60, H-30, false, PC), dot(76, H-30, false, PC),
      dot(92, H-30, true, PC), dot(108+16, H-30, false, PC), dot(124+16, H-30, false, PC),
    ],
  });
}

function slide4(i) {
  const x = i * GAP;
  const PC = '#f97316';

  return frame({
    id: uid('slide'), x, y: 0, w: W, h: H, fill: '#080810', clip: true,
    children: [
      { ...rect({ x: -50, y: H - 400, w: 600, h: 600, r: 300, fill: PC }),
        fill: { type: 'color', color: PC, opacity: 0.06 } },
      progressBar(x, 4, PC),
      logo(60, 48),
      slideNum(4, W - 80, 52),

      pill('Zero dependencies', { x: 60, y: 120, w: 190, fill: 'rgba(249,115,22,0.12)', color: PC }),
      text('No install.', { x: 60, y: 160, size: 52, weight: '800', color: '#fff' }),
      text('No login. No limits.', { x: 60, y: 216, size: 52, weight: '800', color: PC }),

      // Three big feature blocks
      ...[
        { icon: '⚡', title: 'Instant Canvas', body: 'Every design renders live in the browser. Pure HTML Canvas — no pencil.dev required to preview.', y: 310 },
        { icon: '⬇', title: 'One-Click Download', body: 'Hit download and get a valid .pen file. Open it in pencil.dev to continue editing with full fidelity.', y: 440 },
        { icon: '🤖', title: 'Agent-Native', body: '@mention RAM on the Hive and get a full design back in 30 minutes. Fully autonomous, end to end.', y: 570 },
      ].flatMap(({ icon, title, body, y: fy }) => [
        rect({ x: 60, y: fy, w: 54, h: 54, fill: 'rgba(249,115,22,0.15)', r: 12 }),
        text(icon, { x: 76, y: fy + 14, size: 22 }),
        text(title, { x: 130, y: fy + 6, size: 18, weight: '700', color: '#fff' }),
        text(body, { x: 130, y: fy + 30, size: 13, color: 'rgba(255,255,255,0.45)', width: 520 }),
      ]),

      // Right graphic
      rect({ x: W - 340, y: 150, w: 280, h: 480, fill: '#0d0d1a', r: 20,
             stroke: { thickness: 1, fill: 'rgba(249,115,22,0.25)' } }),
      text('generate.js', { x: W - 320, y: 170, size: 11, weight: '600', color: 'rgba(255,255,255,0.3)' }),
      ...['const spec = parsePrompt(prompt);', 'const pen = generatePenFile(spec);',  '', 'fs.writeFileSync(out, pen);', 'publish(pen, slug);', '', '// → https://zenbin.org/p/...'].map((line, li) =>
        text(line, { x: W - 320, y: 200 + li * 22, size: 12, weight: line.startsWith('//') ? '400' : '500',
                     color: line.startsWith('//') ? 'rgba(255,255,255,0.25)' : line.startsWith('const') ? '#93c5fd' : line.startsWith('fs') || line.startsWith('pub') ? '#6ee7b7' : 'rgba(255,255,255,0.6)' })
      ),

      dot(60, H-30, false, PC), dot(76, H-30, false, PC),
      dot(92, H-30, false, PC), dot(108, H-30, true, PC), dot(140, H-30, false, PC),
    ],
  });
}

function slide5(i) {
  const x = i * GAP;
  const PC = '#00ffcc';

  return frame({
    id: uid('slide'), x, y: 0, w: W, h: H, fill: '#080810', clip: true,
    children: [
      { ...rect({ x: W/2 - 300, y: H/2 - 300, w: 600, h: 600, r: 300, fill: PC }),
        fill: { type: 'color', color: PC, opacity: 0.06 } },
      progressBar(x, 5, PC),
      logo(60, 48),
      slideNum(5, W - 80, 52),

      // Center everything
      text('The Grid has', { x: W/2 - 320, y: 220, size: 64, weight: '800', color: 'rgba(255,255,255,0.6)', align: 'center', width: 640 }),
      text('a design studio.', { x: W/2 - 320, y: 294, size: 64, weight: '800', color: PC, align: 'center', width: 640 }),

      divider({ x: W/2 - 40, y: 390, w: 80, fill: PC }),

      text('Prompt it. Preview it. Download it. Ship it.', {
        x: W/2 - 320, y: 420, size: 20, weight: '500',
        color: 'rgba(255,255,255,0.5)', align: 'center', width: 640,
      }),

      // CTA pill
      frame({
        x: W/2 - 140, y: 480, w: 280, h: 52,
        fill: PC, r: 26,
        layout: 'horizontal', jc: 'center', ai: 'center',
        children: [text('@ram design: your app idea', { size: 14, weight: '700', color: '#080810' })],
      }),

      // Bottom credits
      text('Built by RAM ⚡ · Powered by Hive · Hosted on Zenbin · Rendered on Canvas', {
        x: 0, y: H - 50, size: 11, weight: '400',
        color: 'rgba(255,255,255,0.2)', align: 'center', width: W,
      }),

      dot(60, H-30, false, PC), dot(76, H-30, false, PC),
      dot(92, H-30, false, PC), dot(108, H-30, false, PC), dot(124, H-30, true, PC),
    ],
  });
}

// ─── Assemble & write ──────────────────────────────────────────────────────────

const penDoc = {
  version: '2.8',
  themes: { mode: ['light', 'dark'] },
  variables: {
    'color.primary': { type: 'color', value: '#00ffcc' },
    'color.bg': { type: 'color', value: '#080810' },
    'color.text': { type: 'color', value: '#ffffff' },
  },
  children: [slide1(0), slide2(1), slide3(2), slide4(3), slide5(4)],
};

const outFile = process.argv[2] || '/tmp/ram-design-studio-pitch.pen';
fs.writeFileSync(outFile, JSON.stringify(penDoc, null, 2));
console.log(`✅ Slideshow: ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);
console.log(`📊 5 slides generated`);
