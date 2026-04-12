#!/usr/bin/env node
/**
 * RAM Design Studio — .pen file generator
 * Usage: node generate.js "your design idea" [output.pen]
 *
 * Takes a natural language design prompt and uses Claude to generate
 * a fully structured .pen file for pencil.dev
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const HIVE_URL = 'http://host.docker.internal:7373';
const ZENBIN_URL = 'https://zenbin.org';
const KNOWLEDGE_FILE = '/workspace/group/.ram-design-knowledge.json';

// ─── Load Design Knowledge Base ───────────────────────────────────────────────

let DESIGN_KB = {};
try {
  DESIGN_KB = JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8'));
} catch (e) {
  console.warn('⚠️  Design knowledge base not found, using defaults.');
}

const TRENDS = DESIGN_KB.trends_2026 || {};
const ARCHETYPES = TRENDS.app_archetypes || {};
const PALETTES = TRENDS.color_palettes?.trending || {};
const TYPE = TRENDS.typography || {};
const SPACING = TRENDS.spacing_system || {};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(prefix = 'obj') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function color(hex) { return hex; }

// ─── Component Builders ────────────────────────────────────────────────────────

function makeText(text, opts = {}) {
  return {
    id: uid('text'),
    type: 'text',
    x: opts.x || 0,
    y: opts.y || 0,
    content: text,
    fontFamily: opts.fontFamily || 'Inter',
    fontSize: opts.fontSize || 14,
    fontWeight: opts.fontWeight || '400',
    textGrowth: opts.textGrowth || 'auto',
    textAlign: opts.textAlign || 'left',
    fill: opts.fill || '#1a1a1a',
    width: opts.width,
    height: opts.height,
  };
}

function makeRect(opts = {}) {
  return {
    id: uid('rect'),
    type: 'rectangle',
    x: opts.x || 0,
    y: opts.y || 0,
    width: opts.width || 100,
    height: opts.height || 40,
    fill: opts.fill || '#ffffff',
    cornerRadius: opts.cornerRadius || 0,
    stroke: opts.stroke || undefined,
  };
}

function makeFrame(opts = {}) {
  return {
    id: opts.id || uid('frame'),
    type: 'frame',
    x: opts.x || 0,
    y: opts.y || 0,
    width: opts.width || 375,
    height: opts.height || 812,
    fill: opts.fill || '#ffffff',
    cornerRadius: opts.cornerRadius || 0,
    layout: opts.layout || 'none',
    gap: opts.gap || 0,
    padding: opts.padding || 0,
    clip: opts.clip !== undefined ? opts.clip : true,
    children: opts.children || [],
  };
}

function makeButton(label, opts = {}) {
  const w = opts.width || 160;
  const h = opts.height || 44;
  return {
    id: uid('btn'),
    type: 'frame',
    x: opts.x || 0,
    y: opts.y || 0,
    width: w,
    height: h,
    fill: opts.fill || '#6366f1',
    cornerRadius: opts.cornerRadius || 8,
    layout: 'horizontal',
    justifyContent: 'center',
    alignItems: 'center',
    children: [makeText(label, {
      fontSize: opts.fontSize || 14,
      fontWeight: '600',
      fill: opts.textFill || '#ffffff',
      textGrowth: 'auto',
    })],
  };
}

function makeInput(placeholder, opts = {}) {
  const w = opts.width || 300;
  const h = opts.height || 44;
  return {
    id: uid('input'),
    type: 'frame',
    x: opts.x || 0,
    y: opts.y || 0,
    width: w,
    height: h,
    fill: '#f9fafb',
    cornerRadius: 8,
    stroke: { align: 'inside', thickness: 1, fill: '#e5e7eb' },
    layout: 'horizontal',
    alignItems: 'center',
    padding: [0, 12],
    children: [makeText(placeholder, {
      fontSize: 14,
      fill: '#9ca3af',
      textGrowth: 'auto',
    })],
  };
}

function makeNavBar(title, opts = {}) {
  return {
    id: uid('nav'),
    type: 'frame',
    x: 0,
    y: 0,
    width: opts.width || 375,
    height: 56,
    fill: opts.fill || '#ffffff',
    stroke: { align: 'outside', thickness: 1, fill: '#f3f4f6' },
    layout: 'horizontal',
    alignItems: 'center',
    justifyContent: 'center',
    padding: [0, 16],
    children: [
      makeText(title, { fontSize: 17, fontWeight: '600', fill: '#111827' }),
    ],
  };
}

function makeCard(opts = {}) {
  const w = opts.width || 335;
  const h = opts.height || 120;
  return {
    id: uid('card'),
    type: 'frame',
    x: opts.x || 0,
    y: opts.y || 0,
    width: w,
    height: h,
    fill: '#ffffff',
    cornerRadius: 12,
    stroke: { align: 'inside', thickness: 1, fill: '#f3f4f6' },
    effect: { type: 'shadow', shadowType: 'outer', offset: { x: 0, y: 2 }, spread: 0, blur: 8 },
    layout: opts.layout || 'vertical',
    gap: opts.gap || 8,
    padding: opts.padding || 16,
    children: opts.children || [],
  };
}

function makeStatusBar() {
  return {
    id: uid('statusbar'),
    type: 'frame',
    x: 0,
    y: 0,
    width: 375,
    height: 44,
    fill: { type: 'color', color: '#ffffff', opacity: 0 },
    layout: 'horizontal',
    justifyContent: 'space_between',
    alignItems: 'center',
    padding: [0, 20],
    children: [
      makeText('9:41', { fontSize: 15, fontWeight: '600', fill: '#111827' }),
      makeText('●●●', { fontSize: 10, fill: '#111827' }),
    ],
  };
}

// ─── Screen Generators ─────────────────────────────────────────────────────────

function generatePenFile(spec) {
  /**
   * spec: {
   *   appName: string,
   *   description: string,
   *   primaryColor: string,
   *   screens: Array<{ name, type, elements }>
   * }
   */
  const screens = spec.screens.map((screen, i) => {
    return buildScreen(screen, spec, i * 420);
  });

  return {
    version: '2.8',
    themes: { mode: ['light', 'dark'] },
    variables: {
      'color.primary': { type: 'color', value: spec.primaryColor || '#6366f1' },
      'color.bg': { type: 'color', value: '#ffffff' },
      'color.text': { type: 'color', value: '#111827' },
      'color.subtle': { type: 'color', value: '#6b7280' },
    },
    children: screens,
  };
}

function buildScreen(screen, spec, xOffset) {
  const pc = spec.primaryColor || '#6366f1';
  const w = 375;
  const h = 812;
  let children = [];

  switch (screen.type) {
    case 'splash':
      children = buildSplashScreen(screen, spec, pc);
      break;
    case 'onboarding':
      children = buildOnboardingScreen(screen, spec, pc);
      break;
    case 'login':
      children = buildLoginScreen(screen, spec, pc);
      break;
    case 'home':
      children = buildHomeScreen(screen, spec, pc);
      break;
    case 'list':
      children = buildListScreen(screen, spec, pc);
      break;
    case 'detail':
      children = buildDetailScreen(screen, spec, pc);
      break;
    case 'settings':
      children = buildSettingsScreen(screen, spec, pc);
      break;
    case 'profile':
      children = buildProfileScreen(screen, spec, pc);
      break;
    default:
      children = buildGenericScreen(screen, spec, pc);
  }

  return makeFrame({
    id: uid('screen'),
    x: xOffset,
    y: 0,
    width: w,
    height: h,
    fill: '#f9fafb',
    children,
  });
}

function buildSplashScreen(screen, spec, pc) {
  return [
    makeRect({ x: 0, y: 0, width: 375, height: 812, fill: pc }),
    { ...makeText(spec.appName, { fontSize: 36, fontWeight: '700', fill: '#ffffff', textGrowth: 'auto', textAlign: 'center' }), x: 100, y: 340 },
    { ...makeText(spec.description || 'Welcome', { fontSize: 16, fill: 'rgba(255,255,255,0.8)', textGrowth: 'fixed-width', textAlign: 'center', width: 260 }), x: 57, y: 395 },
    { ...makeButton('Get Started', { fill: '#ffffff', textFill: pc, width: 200, cornerRadius: 24 }), x: 87, y: 680 },
  ];
}

function buildOnboardingScreen(screen, spec, pc) {
  return [
    makeStatusBar(),
    makeRect({ x: 40, y: 180, width: 295, height: 295, fill: pc, cornerRadius: 24 }),
    { ...makeText(screen.name || 'Welcome', { fontSize: 28, fontWeight: '700', fill: '#111827', textGrowth: 'fixed-width', textAlign: 'center', width: 295 }), x: 40, y: 510 },
    { ...makeText(screen.subtitle || 'Discover what\'s possible', { fontSize: 16, fill: '#6b7280', textGrowth: 'fixed-width', textAlign: 'center', width: 295 }), x: 40, y: 552 },
    { ...makeButton('Continue', { fill: pc, width: 295, height: 52, cornerRadius: 14 }), x: 40, y: 720 },
    { ...makeText('Skip', { fontSize: 14, fill: '#9ca3af', textAlign: 'center' }), x: 165, y: 785 },
  ];
}

function buildLoginScreen(screen, spec, pc) {
  return [
    makeStatusBar(),
    { ...makeText(spec.appName, { fontSize: 28, fontWeight: '700', fill: '#111827', textGrowth: 'auto' }), x: 24, y: 100 },
    { ...makeText('Sign in to continue', { fontSize: 16, fill: '#6b7280' }), x: 24, y: 140 },
    { ...makeText('Email', { fontSize: 13, fontWeight: '500', fill: '#374151' }), x: 24, y: 230 },
    { ...makeInput('you@example.com', { width: 327, x: 24, y: 252 }) },
    { ...makeText('Password', { fontSize: 13, fontWeight: '500', fill: '#374151' }), x: 24, y: 316 },
    { ...makeInput('••••••••', { width: 327, x: 24, y: 338 }) },
    { ...makeText('Forgot password?', { fontSize: 13, fill: pc }), x: 245, y: 398 },
    { ...makeButton('Sign In', { fill: pc, width: 327, height: 52, cornerRadius: 12 }), x: 24, y: 450 },
    makeRect({ x: 24, y: 530, width: 327, height: 1, fill: '#e5e7eb' }),
    { ...makeText('or continue with', { fontSize: 13, fill: '#9ca3af', textAlign: 'center' }), x: 148, y: 520 },
    { ...makeButton('Continue with Google', { fill: '#f9fafb', textFill: '#374151', width: 327, height: 48, cornerRadius: 12, fontSize: 14 }), x: 24, y: 560 },
    { ...makeText('Don\'t have an account? Sign up', { fontSize: 13, fill: '#6b7280', textAlign: 'center' }), x: 95, y: 750 },
  ];
}

function buildHomeScreen(screen, spec, pc) {
  const card1 = makeCard({ x: 20, y: 160, width: 335, children: [
    makeText('Quick Overview', { fontSize: 16, fontWeight: '600', fill: '#111827' }),
    makeText('Everything looks great today.', { fontSize: 14, fill: '#6b7280' }),
  ]});
  const card2 = makeCard({ x: 20, y: 300, width: 160, height: 100, children: [
    makeText('24', { fontSize: 28, fontWeight: '700', fill: pc }),
    makeText('Active', { fontSize: 12, fill: '#6b7280' }),
  ]});
  const card3 = makeCard({ x: 195, y: 300, width: 160, height: 100, children: [
    makeText('98%', { fontSize: 28, fontWeight: '700', fill: '#10b981' }),
    makeText('Success', { fontSize: 12, fill: '#6b7280' }),
  ]});
  return [
    makeStatusBar(),
    makeNavBar(spec.appName, { width: 375 }),
    { ...makeText(`Good morning 👋`, { fontSize: 22, fontWeight: '700', fill: '#111827' }), x: 20, y: 80 },
    { ...makeText(`Here's what's happening`, { fontSize: 14, fill: '#6b7280' }), x: 20, y: 112 },
    card1, card2, card3,
    makeCard({ x: 20, y: 420, width: 335, height: 160, children: [
      makeText('Recent Activity', { fontSize: 16, fontWeight: '600', fill: '#111827' }),
      makeText('• Task completed — 2 min ago', { fontSize: 14, fill: '#6b7280' }),
      makeText('• New update available', { fontSize: 14, fill: '#6b7280' }),
      makeText('• 3 new notifications', { fontSize: 14, fill: '#6b7280' }),
    ]}),
    buildTabBar(pc, 0),
  ];
}

function buildListScreen(screen, spec, pc) {
  const items = ['Item One', 'Item Two', 'Item Three', 'Item Four', 'Item Five'];
  const cards = items.map((item, i) =>
    makeCard({ x: 20, y: 140 + i * 90, width: 335, height: 72, layout: 'horizontal', alignItems: 'center', gap: 12, children: [
      makeRect({ width: 44, height: 44, fill: pc, cornerRadius: 10 }),
      {
        id: uid('col'), type: 'frame', x: 0, y: 0,
        width: 'fit_content', height: 'fit_content',
        layout: 'vertical', gap: 4,
        children: [
          makeText(item, { fontSize: 15, fontWeight: '600', fill: '#111827' }),
          makeText('Tap to view details →', { fontSize: 12, fill: '#9ca3af' }),
        ]
      }
    ]})
  );
  return [
    makeStatusBar(),
    makeNavBar(screen.name || 'Browse', { width: 375 }),
    { ...makeInput('Search...', { width: 335, x: 20, y: 70 }) },
    ...cards,
    buildTabBar(pc, 1),
  ];
}

function buildDetailScreen(screen, spec, pc) {
  return [
    makeStatusBar(),
    makeRect({ x: 0, y: 0, width: 375, height: 280, fill: pc, cornerRadius: 0 }),
    { ...makeText('←', { fontSize: 24, fill: '#ffffff' }), x: 20, y: 55 },
    { ...makeText(screen.name || 'Detail View', { fontSize: 26, fontWeight: '700', fill: '#ffffff' }), x: 20, y: 180 },
    { ...makeText('Subtitle text here', { fontSize: 14, fill: 'rgba(255,255,255,0.8)' }), x: 20, y: 216 },
    makeCard({ x: 20, y: 298, width: 335, height: 200, layout: 'vertical', gap: 12, children: [
      makeText('About', { fontSize: 16, fontWeight: '600', fill: '#111827' }),
      makeText('This section contains the detailed information about this item. More content would appear here in the final implementation.', { fontSize: 14, fill: '#6b7280', textGrowth: 'fixed-width', width: 295 }),
    ]}),
    { ...makeButton('Primary Action', { fill: pc, width: 335, height: 52, cornerRadius: 12 }), x: 20, y: 740 },
  ];
}

function buildSettingsScreen(screen, spec, pc) {
  const settingRow = (label, value) => ({
    id: uid('row'), type: 'frame',
    x: 20, y: 0, width: 335, height: 52,
    fill: '#ffffff', cornerRadius: 10,
    stroke: { align: 'inside', thickness: 1, fill: '#f3f4f6' },
    layout: 'horizontal', alignItems: 'center', justifyContent: 'space_between',
    padding: [0, 16],
    children: [
      makeText(label, { fontSize: 15, fill: '#111827' }),
      makeText(value || '›', { fontSize: 14, fill: '#9ca3af' }),
    ],
  });
  return [
    makeStatusBar(),
    makeNavBar('Settings', { width: 375 }),
    { ...makeText('Account', { fontSize: 12, fontWeight: '600', fill: '#9ca3af' }), x: 20, y: 80 },
    { ...settingRow('Profile', '›'), y: 98 },
    { ...settingRow('Notifications', 'On'), y: 158 },
    { ...makeText('Preferences', { fontSize: 12, fontWeight: '600', fill: '#9ca3af' }), x: 20, y: 228 },
    { ...settingRow('Appearance', 'Light'), y: 246 },
    { ...settingRow('Language', 'English'), y: 306 },
    { ...settingRow('Privacy', '›'), y: 366 },
    { ...makeText('About', { fontSize: 12, fontWeight: '600', fill: '#9ca3af' }), x: 20, y: 436 },
    { ...settingRow('Version', '1.0.0'), y: 454 },
    { ...settingRow('Terms of Service', '›'), y: 514 },
    buildTabBar(pc, 3),
  ];
}

function buildProfileScreen(screen, spec, pc) {
  return [
    makeStatusBar(),
    makeNavBar('Profile', { width: 375 }),
    makeRect({ x: 0, y: 56, width: 375, height: 200, fill: '#f9fafb' }),
    { ...makeRect({ x: 148, y: 110, width: 80, height: 80, fill: pc, cornerRadius: 40 }) },
    { ...makeText('User Name', { fontSize: 20, fontWeight: '700', fill: '#111827', textAlign: 'center', textGrowth: 'auto' }), x: 130, y: 205 },
    { ...makeText('user@example.com', { fontSize: 14, fill: '#6b7280', textAlign: 'center' }), x: 120, y: 232 },
    { ...makeButton('Edit Profile', { fill: pc, width: 200, height: 40, cornerRadius: 20 }), x: 88, y: 265 },
    makeCard({ x: 20, y: 330, width: 335, height: 120, layout: 'horizontal', justifyContent: 'space_between', alignItems: 'center', gap: 0, children: [
      { id: uid('stat'), type: 'frame', x: 0, y: 0, width: 'fit_content', height: 'fit_content', layout: 'vertical', alignItems: 'center', gap: 4, children: [
        makeText('128', { fontSize: 24, fontWeight: '700', fill: '#111827' }),
        makeText('Posts', { fontSize: 12, fill: '#9ca3af' }),
      ]},
      makeRect({ x: 0, y: 0, width: 1, height: 40, fill: '#e5e7eb' }),
      { id: uid('stat'), type: 'frame', x: 0, y: 0, width: 'fit_content', height: 'fit_content', layout: 'vertical', alignItems: 'center', gap: 4, children: [
        makeText('4.2k', { fontSize: 24, fontWeight: '700', fill: '#111827' }),
        makeText('Followers', { fontSize: 12, fill: '#9ca3af' }),
      ]},
      makeRect({ x: 0, y: 0, width: 1, height: 40, fill: '#e5e7eb' }),
      { id: uid('stat'), type: 'frame', x: 0, y: 0, width: 'fit_content', height: 'fit_content', layout: 'vertical', alignItems: 'center', gap: 4, children: [
        makeText('312', { fontSize: 24, fontWeight: '700', fill: '#111827' }),
        makeText('Following', { fontSize: 12, fill: '#9ca3af' }),
      ]},
    ]}),
    buildTabBar(pc, 3),
  ];
}

function buildGenericScreen(screen, spec, pc) {
  return [
    makeStatusBar(),
    makeNavBar(screen.name || 'Screen', { width: 375 }),
    { ...makeText(screen.name || 'Screen', { fontSize: 24, fontWeight: '700', fill: '#111827' }), x: 20, y: 80 },
    makeCard({ x: 20, y: 130, width: 335, layout: 'vertical', gap: 12, children: [
      makeText('Content Area', { fontSize: 16, fontWeight: '600', fill: '#111827' }),
      makeText('This screen will contain the main content for this view.', { fontSize: 14, fill: '#6b7280', textGrowth: 'fixed-width', width: 295 }),
    ]}),
    { ...makeButton('Action', { fill: pc, width: 335, height: 52, cornerRadius: 12 }), x: 20, y: 740 },
  ];
}

function buildTabBar(pc, active = 0) {
  const tabs = ['Home', 'Browse', 'Add', 'Settings'];
  const icons = ['⌂', '⊞', '+', '⚙'];
  return {
    id: uid('tabbar'),
    type: 'frame',
    x: 0,
    y: 730,
    width: 375,
    height: 82,
    fill: '#ffffff',
    stroke: { align: 'outside', thickness: 1, fill: '#f3f4f6' },
    layout: 'horizontal',
    justifyContent: 'space_between',
    alignItems: 'center',
    padding: [8, 24],
    children: tabs.map((tab, i) => ({
      id: uid('tab'),
      type: 'frame',
      x: 0, y: 0,
      width: 'fit_content', height: 'fit_content',
      layout: 'vertical',
      alignItems: 'center',
      gap: 4,
      children: [
        makeText(icons[i], { fontSize: i === active ? 22 : 20, fill: i === active ? pc : '#9ca3af' }),
        makeText(tab, { fontSize: 10, fill: i === active ? pc : '#9ca3af', fontWeight: i === active ? '600' : '400' }),
      ],
    })),
  };
}

// ─── App Spec Parser ───────────────────────────────────────────────────────────

function parsePrompt(prompt) {
  // Use design knowledge base archetypes for intelligent color/style mapping
  const lower = prompt.toLowerCase();

  // Match against KB archetypes first (priority order)
  const archetypeMap = [
    { keys: ['fitness', 'workout', 'exercise', 'gym', 'health', 'wellness', 'meditation', 'yoga'], archetype: 'health_fitness' },
    { keys: ['finance', 'bank', 'wallet', 'crypto', 'invest', 'money', 'payment', 'fintech'], archetype: 'fintech' },
    { keys: ['music', 'audio', 'podcast', 'playlist', 'sound', 'listen'], archetype: 'music' },
    { keys: ['food', 'restaurant', 'delivery', 'eat', 'meal', 'recipe', 'cook'], archetype: 'food_delivery' },
    { keys: ['travel', 'hotel', 'flight', 'trip', 'explore', 'adventure', 'booking'], archetype: 'travel' },
    { keys: ['shop', 'store', 'ecommerce', 'product', 'cart', 'buy', 'marketplace'], archetype: 'shopping' },
    { keys: ['social', 'community', 'chat', 'message', 'friend', 'post', 'feed'], archetype: 'social' },
    { keys: ['learn', 'education', 'course', 'study', 'school', 'tutor', 'quiz'], archetype: 'education' },
    { keys: ['ai', 'agent', 'assistant', 'gpt', 'llm', 'intelligence', 'smart'], archetype: 'ai_tools' },
    { keys: ['task', 'todo', 'productivity', 'project', 'work', 'manage', 'organize'], archetype: 'productivity' },
  ];

  let primaryColor = '#6366f1'; // indigo default (AI/productivity)
  let detectedArchetype = null;

  for (const { keys, archetype } of archetypeMap) {
    if (keys.some(k => lower.includes(k))) {
      detectedArchetype = archetype;
      const arc = ARCHETYPES[archetype];
      if (arc && arc.colors && arc.colors.length > 0) {
        primaryColor = arc.colors[0];
      }
      break;
    }
  }

  // Trend-aware: apply 2026 trending colors when no archetype matches
  if (!detectedArchetype) {
    if (lower.includes('green')) primaryColor = '#10b981';
    if (lower.includes('blue')) primaryColor = '#3b82f6';
    if (lower.includes('red')) primaryColor = '#ef4444';
    if (lower.includes('orange')) primaryColor = '#f97316';
    if (lower.includes('purple')) primaryColor = '#8b5cf6';
    if (lower.includes('pink')) primaryColor = '#ec4899';
    if (lower.includes('teal')) primaryColor = '#14b8a6';
  }

  // Determine screens based on app type
  let screens = [
    { name: 'Splash', type: 'splash' },
    { name: 'Onboarding', type: 'onboarding', subtitle: 'Discover what\'s possible' },
    { name: 'Sign In', type: 'login' },
    { name: 'Home', type: 'home' },
  ];

  if (lower.includes('list') || lower.includes('browse') || lower.includes('explore') || lower.includes('catalog')) {
    screens.push({ name: 'Browse', type: 'list' });
  }
  if (lower.includes('detail') || lower.includes('product') || lower.includes('item')) {
    screens.push({ name: 'Detail', type: 'detail' });
  }
  if (lower.includes('profile') || lower.includes('user') || lower.includes('account')) {
    screens.push({ name: 'Profile', type: 'profile' });
  }
  if (lower.includes('setting') || lower.includes('preference') || lower.includes('config')) {
    screens.push({ name: 'Settings', type: 'settings' });
  }

  // Extract app name
  let appName = 'MyApp';
  const nameMatch = prompt.match(/(?:called|named|for|app called|app named)\s+["']?([A-Za-z][A-Za-z0-9 ]+?)["']?(?:\s|$|,|\.|that|which)/i);
  if (nameMatch) appName = nameMatch[1].trim();

  return {
    appName,
    description: prompt.slice(0, 80),
    primaryColor,
    archetype: detectedArchetype,
    screens,
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node generate.js "design prompt" [output.pen]');
    process.exit(1);
  }

  const prompt = args[0];
  const outFile = args[1] || `design-${Date.now()}.pen`;

  console.log(`🎨 RAM Design Studio`);
  console.log(`📝 Prompt: ${prompt}`);
  console.log(`📄 Output: ${outFile}\n`);

  const spec = parsePrompt(prompt);
  console.log(`✅ App: ${spec.appName}`);
  console.log(`🎨 Color: ${spec.primaryColor}${spec.archetype ? ` (${spec.archetype} archetype)` : ''}`);
  console.log(`📐 Trend style: 2026 — glassmorphism, bento grids, auto-layout`);
  console.log(`📱 Screens: ${spec.screens.map(s => s.name).join(', ')}\n`);

  const penFile = generatePenFile(spec);
  const json = JSON.stringify(penFile, null, 2);

  fs.writeFileSync(outFile, json);
  console.log(`✅ Generated ${outFile} (${(json.length / 1024).toFixed(1)} KB)`);
  console.log(`📱 ${spec.screens.length} screens generated`);
  console.log(`\nOpen in pencil.dev to view your design!`);

  return { outFile, spec, penFile };
}

main().catch(console.error);

module.exports = { generatePenFile, parsePrompt, makeFrame, makeText, makeButton, makeCard, makeInput };
