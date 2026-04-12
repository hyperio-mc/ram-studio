// telegram-setup.js — Generates telegram-setup.pen (7-screen mobile wizard)
// Run: node telegram-setup.js
const fs = require('fs');

const SW = 375, SH = 812, GAP = 100;

// ── Variables ──────────────────────────────────────────────────────────────
const variables = {
  bg:             { type: 'color', value: '#09090f' },
  surface:        { type: 'color', value: '#111120' },
  's2':           { type: 'color', value: '#191932' },
  purple:         { type: 'color', value: '#7c3aed' },
  'purple-light': { type: 'color', value: '#a78bfa' },
  'purple-dim':   { type: 'color', value: '#2d1b69' },
  border:         { type: 'color', value: '#1e1e38' },
  text:           { type: 'color', value: '#f1f5f9' },
  muted:          { type: 'color', value: '#8892a4' },
  success:        { type: 'color', value: '#10b981' },
  error:          { type: 'color', value: '#ef4444' },
  'code-bg':      { type: 'color', value: '#0c0c1e' },
  tg:             { type: 'color', value: '#229ED9' },
};

// ── Node helpers ────────────────────────────────────────────────────────────
const t = (name, content, opts = {}) => ({
  type: 'text', name, content,
  fontSize:     opts.fontSize     || 14,
  fontWeight:   opts.fontWeight   || '400',
  fill:         opts.fill         || '$text',
  textAlign:    opts.textAlign    || 'left',
  ...(opts.letterSpacing ? { letterSpacing: opts.letterSpacing } : {}),
  ...(opts.lineHeight    ? { lineHeight: opts.lineHeight }       : {}),
  ...(opts.width         ? { width: opts.width, textGrowth: 'fixed-width' } : {}),
});

const frame = (name, props, children = []) => ({
  type: 'frame', name, ...props,
  ...(children.length ? { children } : {}),
});

const hframe = (name, props, children = []) =>
  frame(name, { layout: 'horizontal', alignItems: 'center', ...props }, children);

const vframe = (name, props, children = []) =>
  frame(name, { layout: 'vertical', ...props }, children);

const btn = (name, label, color = '$purple', w = 335) =>
  vframe(name, { width: w, height: 52, cornerRadius: 12, fill: color,
    justifyContent: 'center', alignItems: 'center' },
    [t('lbl', label, { fontSize: 16, fontWeight: '600', fill: '#ffffff', textAlign: 'center' })]);

const ghostBtn = (name, label, w = 335) =>
  vframe(name, { width: w, height: 48, cornerRadius: 12,
    fill: '$s2', stroke: { fill: '$border', thickness: 1 },
    justifyContent: 'center', alignItems: 'center' },
    [t('lbl', label, { fontSize: 15, fontWeight: '500', fill: '$muted', textAlign: 'center' })]);

const divider = (name) =>
  frame(name, { width: 335, height: 1, fill: '$border' });

const glow = (x, y, w, h, color = '#7c3aed', opacity = 0.28) => ({
  type: 'ellipse', name: 'Glow',
  x, y, width: w, height: h, opacity,
  fill: { type: 'gradient', gradientType: 'radial',
    colors: [{ color, position: 0 }, { color: color + '00', position: 1 }] },
});

// Progress bar (layout:none so fill overlays the track)
const progressBar = (step, total) => {
  const w = Math.round(SW * step / total);
  return frame('Progress', { x: 0, y: 0, width: SW, height: 3, fill: '$border' }, [
    frame('Fill', { x: 0, y: 0, width: w, height: 3, fill: '$purple' }),
  ]);
};

// Nav row with back arrow + step label
const navRow = (stepLabel, y = 3) =>
  hframe('Nav', { x: 0, y, width: SW, height: 48, padding: [0, 20], gap: 10 }, [
    hframe('Back', { width: 32, height: 32, cornerRadius: 8, fill: '$surface',
      justifyContent: 'center' },
      [t('←', '←', { fontSize: 16, fill: '$muted', textAlign: 'center' })]),
    t('Step', stepLabel, { fontSize: 13, fill: '$muted' }),
  ]);

// Section heading block
const sectionHead = (title, sub, x, y, titleSize = 24) =>
  vframe('Head', { x, y, width: 335, gap: 8 }, [
    t('title', title, { fontSize: titleSize, fontWeight: '700', lineHeight: 1.2,
      width: 335, textAlign: 'left' }),
    ...(sub ? [t('sub', sub, { fontSize: 14, fill: '$muted', lineHeight: 1.5, width: 335 })] : []),
  ]);

// Input field
const inputField = (name, label, placeholder, y, optional = false) =>
  vframe(name, { x: 20, y, width: 335, gap: 6 }, [
    hframe('LR', { width: 335, gap: 6 }, [
      t('lbl', label, { fontSize: 13, fontWeight: '500' }),
      ...(optional ? [t('opt', '(optional)', { fontSize: 12, fill: '$muted' })] : []),
    ]),
    hframe('box', { width: 335, height: 48, cornerRadius: 10, fill: '$surface',
      stroke: { fill: '$border', thickness: 1 }, padding: [0, 14] }, [
      t('ph', placeholder, { fontSize: 14, fill: '$muted', width: 283 }),
    ]),
  ]);

// Code block
const codeBlock = (name, code, x, y, height = 72) =>
  vframe(name, { x, y, width: 335, height, cornerRadius: 10,
    fill: '$code-bg', stroke: { fill: '$border', thickness: 1 }, padding: 16 }, [
    t('code', code, { fontSize: 12, fill: '$purple-light',
      lineHeight: 1.6, width: 303 }),
  ]);

// Feature row (✓ + text)
const featureRow = (text) =>
  hframe('feat', { width: 335, gap: 10 }, [
    vframe('check', { width: 22, height: 22, cornerRadius: 11,
      fill: '$purple-dim', justifyContent: 'center', alignItems: 'center' },
      [t('✓', '✓', { fontSize: 11, fontWeight: '700', fill: '$purple-light', textAlign: 'center' })]),
    t('tx', text, { fontSize: 14, fill: '$text' }),
  ]);

// Flow step pill (numbered + label + arrow)
const flowPill = (num, label, color = '$purple') =>
  hframe('pill', { height: 44, cornerRadius: 10, fill: '$s2',
    stroke: { fill: color, thickness: 1 }, padding: [0, 14], gap: 10 }, [
    vframe('num', { width: 24, height: 24, cornerRadius: 12, fill: color,
      justifyContent: 'center', alignItems: 'center' },
      [t('n', num, { fontSize: 11, fontWeight: '700', fill: '#fff', textAlign: 'center' })]),
    t('lbl', label, { fontSize: 14, fontWeight: '500' }),
  ]);

// Verification step row
const verifyRow = (num, label, done = false) =>
  hframe('vr', { width: 335, gap: 12 }, [
    vframe('num', { width: 28, height: 28, cornerRadius: 14,
      fill: done ? '$success' : '$s2',
      stroke: done ? undefined : { fill: '$border', thickness: 1 },
      justifyContent: 'center', alignItems: 'center' },
      [t('n', done ? '✓' : String(num),
        { fontSize: 12, fontWeight: '700', fill: done ? '#fff' : '$muted', textAlign: 'center' })]),
    t('l', label, { fontSize: 14, fill: done ? '$text' : '$muted' }),
  ]);

// Badge pill
const badge = (label, color = '$purple-dim', textColor = '$purple-light') =>
  hframe('badge', { height: 26, cornerRadius: 99, fill: color, padding: [0, 12] }, [
    t('l', label, { fontSize: 11, fontWeight: '600', fill: textColor, letterSpacing: 0.5 }),
  ]);

// ── SCREEN 1 — WELCOME ─────────────────────────────────────────────────────
function screen1() {
  return frame('Step 1 — Welcome', {
    x: 0, y: 0, width: SW, height: SH, fill: '$bg',
  }, [
    // Background glow
    glow(SW / 2 - 160, 40, 320, 280, '#7c3aed', 0.22),

    progressBar(1, 7),

    // Brand row
    hframe('Brand', { x: 0, y: 22, width: SW, justifyContent: 'center', gap: 6 }, [
      t('b', 'ScoutOS × Telegram', { fontSize: 12, fontWeight: '500', fill: '$muted', letterSpacing: 0.8 }),
    ]),

    // Icons row
    hframe('Icons', { x: SW / 2 - 106, y: 62, gap: 16, justifyContent: 'center' }, [
      // Telegram icon
      vframe('TG', { width: 72, height: 72, cornerRadius: 22, fill: '$tg',
        justifyContent: 'center', alignItems: 'center' },
        [t('ic', '✈', { fontSize: 32, textAlign: 'center', fill: '#fff' })]),
      vframe('x', { width: 28, height: 28, cornerRadius: 14, fill: '$border',
        justifyContent: 'center', alignItems: 'center' },
        [t('×', '×', { fontSize: 14, fontWeight: '700', fill: '$muted', textAlign: 'center' })]),
      // Scout icon
      vframe('SC', { width: 72, height: 72, cornerRadius: 22, fill: '$purple',
        justifyContent: 'center', alignItems: 'center' },
        [t('ic', '◈', { fontSize: 32, textAlign: 'center', fill: '#fff' })]),
    ]),

    // Title
    t('title', 'Connect Telegram\nto your Scout agent', {
      fontSize: 30, fontWeight: '700', fill: '$text', lineHeight: 1.15, textAlign: 'center',
      width: 295, x: 40, y: 168,
    }),

    // Subtitle
    t('sub', 'Set up in under 5 minutes', {
      fontSize: 15, fill: '$muted', textAlign: 'center', width: 335,
      x: 20, y: 252,
    }),

    // Features card
    vframe('Features', {
      x: 20, y: 290, width: 335, cornerRadius: 14,
      fill: '$surface', stroke: { fill: '$border', thickness: 1 },
      padding: 20, gap: 16,
    }, [
      featureRow('Automated responses in any language'),
      divider('div1'),
      featureRow('Live inside Telegram in under 5 mins'),
      divider('div2'),
      featureRow('Monitor & improve from your dashboard'),
    ]),

    // CTA
    { ...btn('CTA', 'Get Started  →'), x: 20, y: 628 },

    // Privacy note
    t('priv', 'No credit card required · Free to start', {
      fontSize: 12, fill: '$muted', textAlign: 'center', width: 335,
      x: 20, y: 696,
    }),

    // Step indicator dots
    hframe('Dots', { x: SW / 2 - 32, y: 754, gap: 6, justifyContent: 'center' }, [
      ...[1,2,3,4,5,6,7].map((n) =>
        frame(`d${n}`, { width: n === 1 ? 18 : 6, height: 6,
          cornerRadius: 3, fill: n === 1 ? '$purple' : '$border' })),
    ]),
  ]);
}

// ── SCREEN 2 — CREDENTIALS ────────────────────────────────────────────────
function screen2() {
  const sx = SW + GAP;
  return frame('Step 2 — Credentials', {
    x: sx, y: 0, width: SW, height: SH, fill: '$bg',
  }, [
    progressBar(2, 7),
    navRow('Step 2 of 7'),

    // Heading
    vframe('Head', { x: 20, y: 64, width: 335, gap: 8 }, [
      badge('Credentials'),
      t('title', 'Enter your credentials', { fontSize: 24, fontWeight: '700', lineHeight: 1.2, width: 335 }),
      t('sub', "You'll find these in your ScoutOS dashboard and Telegram BotFather.", {
        fontSize: 14, fill: '$muted', lineHeight: 1.5, width: 335 }),
    ]),

    inputField('API Key', 'ScoutOS API Key', 'sk-scout-xxxxxxxx…', 196),

    inputField('Bot Token', 'Telegram Bot Token', '123456789:ABCdef…', 280),

    inputField('Agent ID', 'Agent ID', 'agent_xxxxxxxx', 364, true),

    // Helper note
    hframe('help', { x: 20, y: 440, width: 335, gap: 8, cornerRadius: 10,
      fill: '$purple-dim', padding: 14 }, [
      t('i', 'ℹ', { fontSize: 14, fill: '$purple-light' }),
      t('tx', 'Leave Agent ID blank to use your default agent.', {
        fontSize: 13, fill: '$purple-light', lineHeight: 1.4, width: 283 }),
    ]),

    // CTA
    { ...btn('Continue', 'Continue  →'), x: 20, y: 692 },
    { ...ghostBtn('Back', '← Back'), x: 20, y: 752 },
  ]);
}

// ── SCREEN 3 — CREATE WORKFLOW ────────────────────────────────────────────
function screen3() {
  const sx = 2 * (SW + GAP);
  return frame('Step 3 — Create Workflow', {
    x: sx, y: 0, width: SW, height: SH, fill: '$bg',
  }, [
    glow(SW / 2 - 140, 200, 280, 200, '#7c3aed', 0.15),

    progressBar(3, 7),
    navRow('Step 3 of 7'),

    vframe('Head', { x: 20, y: 64, width: 335, gap: 8 }, [
      badge('Workflow'),
      t('title', 'Create your workflow', { fontSize: 24, fontWeight: '700', lineHeight: 1.2, width: 335 }),
      t('sub', "We'll wire your Telegram bot to your Scout agent automatically.", {
        fontSize: 14, fill: '$muted', lineHeight: 1.5, width: 335 }),
    ]),

    // Flow diagram card
    vframe('Flow', { x: 20, y: 184, width: 335, cornerRadius: 14,
      fill: '$surface', stroke: { fill: '$border', thickness: 1 }, padding: 20, gap: 14 }, [
      t('title', 'Your workflow will look like this:', { fontSize: 13, fill: '$muted' }),
      hframe('row', { width: 295, gap: 8, alignItems: 'center' }, [
        // Step pills
        flowPill('1', 'Telegram Message', '$tg'),
        t('→', '→', { fontSize: 16, fill: '$muted' }),
      ]),
      hframe('row2', { width: 295, gap: 8, alignItems: 'center' }, [
        flowPill('2', 'Scout Agent', '$purple'),
        t('→', '→', { fontSize: 16, fill: '$muted' }),
      ]),
      hframe('row3', { width: 295, gap: 8 }, [
        flowPill('3', 'Reply via Webhook', '$success'),
      ]),
      divider('div'),
      hframe('meta', { width: 295, gap: 8 }, [
        t('m', '⚡ Runs on your Scout infrastructure · Fully managed', {
          fontSize: 12, fill: '$muted', width: 295 }),
      ]),
    ]),

    // Checklist
    vframe('checks', { x: 20, y: 424, width: 335, gap: 12 }, [
      featureRow('Webhook endpoint auto-provisioned'),
      featureRow('Telegram bot registered automatically'),
      featureRow('Agent connected to incoming messages'),
    ]),

    // CTA
    { ...btn('Create', 'Create Workflow  →'), x: 20, y: 692 },
    { ...ghostBtn('Back', '← Back'), x: 20, y: 752 },
  ]);
}

// ── SCREEN 4 — REGISTER WEBHOOK ───────────────────────────────────────────
function screen4() {
  const sx = 3 * (SW + GAP);
  return frame('Step 4 — Register Webhook', {
    x: sx, y: 0, width: SW, height: SH, fill: '$bg',
  }, [
    progressBar(4, 7),
    navRow('Step 4 of 7'),

    // Success chip
    hframe('success', { x: 20, y: 72, height: 42, cornerRadius: 10,
      fill: { type: 'color', color: '#10b981', opacity: 0.12 },
      stroke: { fill: { type: 'color', color: '#10b981', opacity: 0.3 }, thickness: 1 },
      padding: [0, 14], gap: 8 }, [
      t('✓', '✓', { fontSize: 14, fontWeight: '700', fill: '$success' }),
      t('l', 'Workflow created successfully!', { fontSize: 14, fontWeight: '500', fill: '$success' }),
    ]),

    vframe('Head', { x: 20, y: 128, width: 335, gap: 8 }, [
      badge('Webhook URL'),
      t('title', 'Register your webhook', { fontSize: 24, fontWeight: '700', lineHeight: 1.2, width: 335 }),
      t('sub', 'Copy this URL and register it with Telegram so messages reach your agent.',
        { fontSize: 14, fill: '$muted', lineHeight: 1.5, width: 335 }),
    ]),

    // URL code box
    vframe('urlBox', { x: 20, y: 248, width: 335, cornerRadius: 12,
      fill: '$code-bg', stroke: { fill: '$border', thickness: 1 }, padding: 16, gap: 12 }, [
      t('label', 'WEBHOOK URL', { fontSize: 11, fontWeight: '600', fill: '$muted', letterSpacing: 1 }),
      t('url', 'https://api.scoutos.com\n/webhooks/tg_abc123xyz', {
        fontSize: 13, fill: '$purple-light', lineHeight: 1.5, width: 303 }),
      hframe('copy-row', { width: 303, justifyContent: 'flex-end' }, [
        hframe('copy-btn', { height: 30, cornerRadius: 6, fill: '$purple-dim', padding: [0, 12], gap: 6 }, [
          t('ic', '⎘', { fontSize: 12, fill: '$purple-light' }),
          t('l', 'Copy URL', { fontSize: 12, fontWeight: '500', fill: '$purple-light' }),
        ]),
      ]),
    ]),

    // Instructions
    vframe('instr', { x: 20, y: 368, width: 335, cornerRadius: 12,
      fill: '$surface', stroke: { fill: '$border', thickness: 1 }, padding: 16, gap: 10 }, [
      t('h', 'How to register in Telegram', { fontSize: 14, fontWeight: '600' }),
      t('1', '1. Open BotFather in Telegram', { fontSize: 13, fill: '$muted' }),
      t('2', '2. Send /setwebhook to your bot', { fontSize: 13, fill: '$muted' }),
      t('3', '3. Paste the URL above when prompted', { fontSize: 13, fill: '$muted' }),
    ]),

    { ...btn('Continue', 'Continue  →'), x: 20, y: 692 },
    { ...ghostBtn('Back', '← Back'), x: 20, y: 752 },
  ]);
}

// ── SCREEN 5 — ADD SKILL ──────────────────────────────────────────────────
function screen5() {
  const sx = 4 * (SW + GAP);
  return frame('Step 5 — Add Skill', {
    x: sx, y: 0, width: SW, height: SH, fill: '$bg',
  }, [
    progressBar(5, 7),
    navRow('Step 5 of 7'),

    vframe('Head', { x: 20, y: 64, width: 335, gap: 8 }, [
      badge('Agent Skill'),
      t('title', 'Add skill to your agent', { fontSize: 24, fontWeight: '700', lineHeight: 1.2, width: 335 }),
      t('sub', 'Paste this snippet into your agent configuration to enable Telegram replies.',
        { fontSize: 14, fill: '$muted', lineHeight: 1.5, width: 335 }),
    ]),

    // Code block
    vframe('code', { x: 20, y: 184, width: 335, cornerRadius: 12,
      fill: '$code-bg', stroke: { fill: '$border', thickness: 1 }, padding: 16, gap: 12 }, [
      hframe('code-header', { width: 303, justifyContent: 'space-between' }, [
        t('lang', 'YAML · skill config', { fontSize: 11, fontWeight: '500', fill: '$muted', letterSpacing: 0.5 }),
        hframe('copy-btn', { height: 26, cornerRadius: 6, fill: '$purple-dim', padding: [0, 10], gap: 5 }, [
          t('ic', '⎘', { fontSize: 11, fill: '$purple-light' }),
          t('l', 'Copy', { fontSize: 11, fontWeight: '500', fill: '$purple-light' }),
        ]),
      ]),
      t('code', 'skills:\n  - name: telegram-reply\n    type: webhook\n    config:\n      url: ${WEBHOOK_URL}\n      method: POST\n      auth: bearer', {
        fontSize: 12, fill: '$purple-light', lineHeight: 1.7, width: 303 }),
    ]),

    // Instructions card
    vframe('instr', { x: 20, y: 376, width: 335, cornerRadius: 12,
      fill: '$surface', stroke: { fill: '$border', thickness: 1 }, padding: 16, gap: 10 }, [
      t('h', 'Where to add this', { fontSize: 14, fontWeight: '600' }),
      t('1', '1. Open your agent in Scout Studio', { fontSize: 13, fill: '$muted' }),
      t('2', '2. Navigate to Skills → Add skill', { fontSize: 13, fill: '$muted' }),
      t('3', '3. Paste the YAML and save', { fontSize: 13, fill: '$muted' }),
    ]),

    // Tip
    hframe('tip', { x: 20, y: 500, width: 335, gap: 8, cornerRadius: 10,
      fill: '$purple-dim', padding: 14 }, [
      t('i', 'ℹ', { fontSize: 14, fill: '$purple-light' }),
      t('tx', 'The ${WEBHOOK_URL} variable is auto-filled using your registered webhook.',
        { fontSize: 13, fill: '$purple-light', lineHeight: 1.4, width: 283 }),
    ]),

    { ...btn('Done, Continue', 'Done, Continue  →'), x: 20, y: 692 },
    { ...ghostBtn('Back', '← Back'), x: 20, y: 752 },
  ]);
}

// ── SCREEN 6 — TEST ───────────────────────────────────────────────────────
function screen6() {
  const sx = 5 * (SW + GAP);
  return frame('Step 6 — Test Integration', {
    x: sx, y: 0, width: SW, height: SH, fill: '$bg',
  }, [
    glow(SW / 2 - 100, 300, 200, 200, '#10b981', 0.12),

    progressBar(6, 7),
    navRow('Step 6 of 7'),

    vframe('Head', { x: 20, y: 64, width: 335, gap: 8 }, [
      badge('Almost there!', { type: 'color', color: '#10b981', opacity: 0.15 }, '$success'),
      t('title', "Test your integration", { fontSize: 24, fontWeight: '700', lineHeight: 1.2, width: 335 }),
      t('sub', "Let's confirm everything is wired up before you go live.",
        { fontSize: 14, fill: '$muted', lineHeight: 1.5, width: 335 }),
    ]),

    // Steps card
    vframe('Steps', { x: 20, y: 180, width: 335, cornerRadius: 12,
      fill: '$surface', stroke: { fill: '$border', thickness: 1 }, padding: 20, gap: 16 }, [
      t('h', 'Follow these steps:', { fontSize: 14, fontWeight: '600' }),
      verifyRow(1, 'Open Telegram and find your bot', true),
      verifyRow(2, 'Send any message to it', true),
      verifyRow(3, 'Enter your Telegram chat ID below'),
    ]),

    // Chat ID input
    vframe('chatid', { x: 20, y: 370, width: 335, gap: 8 }, [
      t('lbl', 'Your Telegram Chat ID', { fontSize: 13, fontWeight: '500' }),
      hframe('box', { width: 335, height: 48, cornerRadius: 10, fill: '$surface',
        stroke: { fill: '$border', thickness: 1 }, padding: [0, 14] }, [
        t('ph', 'e.g. 123456789', { fontSize: 14, fill: '$muted', width: 283 }),
      ]),
      t('hint', 'Message @userinfobot in Telegram to get your chat ID.',
        { fontSize: 12, fill: '$muted', lineHeight: 1.4, width: 335 }),
    ]),

    // Test button (success-colored)
    { ...btn('Send Test', '⚡  Send Test Message', '$success'), x: 20, y: 540 },

    // Live status indicator
    hframe('status', { x: 20, y: 608, width: 335, height: 44, cornerRadius: 10,
      fill: '$surface', stroke: { fill: '$border', thickness: 1 }, padding: [0, 16], gap: 10 }, [
      frame('dot', { width: 8, height: 8, cornerRadius: 4,
        fill: { type: 'color', color: '#10b981', opacity: 0.8 } }),
      t('s', 'Waiting for test message…', { fontSize: 13, fill: '$muted' }),
    ]),

    { ...btn('Skip, Continue', 'Continue  →'), x: 20, y: 692 },
    { ...ghostBtn('Back', '← Back'), x: 20, y: 752 },
  ]);
}

// ── SCREEN 7 — DONE ───────────────────────────────────────────────────────
function screen7() {
  const sx = 6 * (SW + GAP);
  return frame('Step 7 — Done', {
    x: sx, y: 0, width: SW, height: SH,
    fill: [
      '$bg',
      { type: 'gradient', gradientType: 'radial', enabled: true,
        center: { x: 0.5, y: 0.35 },
        size: { width: 0.8, height: 0.55 },
        colors: [{ color: '#7c3aed18', position: 0 }, { color: '#7c3aed00', position: 1 }] },
    ],
  }, [
    progressBar(7, 7),

    // Celebration
    vframe('party', { x: SW / 2 - 48, y: 80, width: 96, height: 96, cornerRadius: 28,
      fill: { type: 'gradient', gradientType: 'linear', rotation: 135,
        colors: [{ color: '#7c3aed', position: 0 }, { color: '#a78bfa', position: 1 }] },
      justifyContent: 'center', alignItems: 'center' }, [
      t('ic', '🎉', { fontSize: 40, textAlign: 'center' }),
    ]),

    t('title', "You're all set!", {
      fontSize: 30, fontWeight: '700', fill: '$text', textAlign: 'center', lineHeight: 1.15,
      width: 335, x: 20, y: 200,
    }),
    t('sub', 'Your Telegram bot is connected and ready.\nMessages will be handled by your Scout agent.',
      { fontSize: 15, fill: '$muted', textAlign: 'center', lineHeight: 1.5, width: 335, x: 20, y: 254 }),

    // Stats row
    hframe('stats', { x: 20, y: 330, width: 335, gap: 12 }, [
      vframe('s1', { width: 100, height: 76, cornerRadius: 12, fill: '$surface',
        stroke: { fill: '$border', thickness: 1 }, justifyContent: 'center', alignItems: 'center', gap: 4 }, [
        t('v', '< 200ms', { fontSize: 16, fontWeight: '700', fill: '$purple-light', textAlign: 'center' }),
        t('l', 'Response', { fontSize: 11, fill: '$muted', textAlign: 'center' }),
      ]),
      vframe('s2', { width: 100, height: 76, cornerRadius: 12, fill: '$surface',
        stroke: { fill: '$border', thickness: 1 }, justifyContent: 'center', alignItems: 'center', gap: 4 }, [
        t('v', '99.9%', { fontSize: 16, fontWeight: '700', fill: '$success', textAlign: 'center' }),
        t('l', 'Uptime', { fontSize: 11, fill: '$muted', textAlign: 'center' }),
      ]),
      vframe('s3', { width: 99, height: 76, cornerRadius: 12, fill: '$surface',
        stroke: { fill: '$border', thickness: 1 }, justifyContent: 'center', alignItems: 'center', gap: 4 }, [
        t('v', '24 / 7', { fontSize: 16, fontWeight: '700', fill: '$tg', textAlign: 'center' }),
        t('l', 'Always on', { fontSize: 11, fill: '$muted', textAlign: 'center' }),
      ]),
    ]),

    // Next steps card
    vframe('next', { x: 20, y: 426, width: 335, cornerRadius: 12,
      fill: '$surface', stroke: { fill: '$border', thickness: 1 }, padding: 20, gap: 12 }, [
      t('h', 'What\'s next?', { fontSize: 15, fontWeight: '600' }),
      featureRow('Test your bot live in Telegram'),
      featureRow('Monitor chats in the Scout dashboard'),
      featureRow('Invite teammates to collaborate'),
    ]),

    // CTA
    { ...btn('Dashboard', 'Go to Dashboard  →'), x: 20, y: 644 },
    hframe('invite', { x: 20, y: 710, width: 335, justifyContent: 'center' }, [
      t('tx', 'Invite a teammate  →',
        { fontSize: 14, fontWeight: '500', fill: '$purple-light', textAlign: 'center' }),
    ]),
  ]);
}

// ── Assemble & write ───────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  variables,
  children: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
    screen6(),
    screen7(),
  ],
};

const json = JSON.stringify(doc, null, 2);
fs.writeFileSync('telegram-setup.pen', json);
console.log(`✅ Written telegram-setup.pen (${(json.length / 1024).toFixed(1)}KB)`);
console.log(`   Screens: ${doc.children.length}`);
console.log(`   Variables: ${Object.keys(variables).length}`);
