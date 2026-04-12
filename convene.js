#!/usr/bin/env node
// convene.js — Convene redesign .pen generator
// Redesign goals:
//   1. Compact, focused hero — no full-viewport illustrations
//   2. Clear step indicators in "How it works"
//   3. Meeting context on join page
//   4. Proper error states with recovery
//   5. Dark, premium aesthetic (Linear/Vercel-inspired)
//   6. Desktop web screens (1280×800)

const fs = require('fs');
const path = require('path');

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  BG:       '#09090b',   // near-black
  SURFACE:  '#111116',   // card surface
  SURFACE2: '#18181f',   // slightly lighter surface
  BORDER:   '#1e1e2a',   // subtle border
  BORDER2:  '#2a2a3a',   // visible border
  TEXT:     '#e8eaf0',   // primary text
  MUTED:    '#71717a',   // muted text
  MUTED2:   '#a1a1aa',   // slightly less muted
  PRIMARY:  '#7c3aed',   // violet primary
  PRIMARY2: '#6d28d9',   // darker violet
  PRIMARY_L:'#a78bfa',   // light violet
  PRIMARY_G:'#4f46e5',   // indigo (gradient end)
  TEAL:     '#14b8a6',   // teal accent
  PINK:     '#ec4899',   // pink accent
  GREEN:    '#10b981',   // success
  RED:      '#ef4444',   // error
  YELLOW:   '#f59e0b',   // warning
  WHITE:    '#ffffff',
  // Desktop screen
  W:        1280,
  H:        800,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const frame = (name, props, children=[]) => ({ type:'frame', name, ...props, children });
const rect  = (props)                     => ({ type:'rectangle', ...props });
const text  = (content, props)            => ({ type:'text', content, ...props });
const col   = (children, props={})        => frame('col', { layout:'vertical', ...props }, children);
const row   = (children, props={})        => frame('row', { layout:'horizontal', ...props }, children);

const pill = (label, color=T.PRIMARY, textColor=T.WHITE) => frame('pill', {
  layout: 'horizontal',
  padding: [5, 14, 5, 14],
  fill: color,
  cornerRadius: 99,
  alignItems: 'center',
}, [text(label, { fontSize:12, fontWeight:'600', fill: textColor })]);

const tag = (label) => frame('tag', {
  layout: 'horizontal',
  padding: [4, 10, 4, 10],
  fill: { type:'color', color: T.PRIMARY, opacity: 0.12 },
  cornerRadius: 99,
  stroke: { fill: { type:'color', color: T.PRIMARY_L, opacity: 0.3 }, thickness: 1 },
}, [text(label, { fontSize:11, fontWeight:'600', fill: T.PRIMARY_L })]);

const divider = (props={}) => rect({ width: T.W - 80, height: 1, fill: T.BORDER, ...props });

const avatar = (initials, color, size=36) => frame(`av-${initials}`, {
  width: size, height: size,
  fill: { type:'color', color, opacity: 0.2 },
  cornerRadius: size/2,
  layout: 'horizontal',
  alignItems: 'center',
  justifyContent: 'center',
}, [text(initials, { fontSize: size*0.35, fontWeight:'700', fill: color, textAlign:'center' })]);

const input = (placeholder, value='', icon='') => frame('input', {
  layout: 'horizontal',
  width: 360,
  height: 48,
  fill: T.SURFACE2,
  cornerRadius: 10,
  stroke: { fill: T.BORDER2, thickness: 1 },
  alignItems: 'center',
  padding: [0, 16, 0, 16],
  gap: 8,
}, [
  ...(icon ? [text(icon, { fontSize:15, fill: T.MUTED })] : []),
  text(value || placeholder, { fontSize:14, fill: value ? T.TEXT : T.MUTED }),
]);

const btn = (label, style='primary', w=160, h=44) => {
  const fills = {
    primary: T.PRIMARY,
    secondary: T.SURFACE2,
    ghost: 'transparent',
    danger: { type:'color', color: T.RED, opacity: 0.15 },
  };
  const textColors = {
    primary: T.WHITE,
    secondary: T.TEXT,
    ghost: T.MUTED2,
    danger: T.RED,
  };
  return frame('btn', {
    layout: 'horizontal',
    width: w,
    height: h,
    fill: fills[style],
    cornerRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...(style === 'ghost' ? {} : {}),
  }, [text(label, { fontSize: 13, fontWeight:'600', fill: textColors[style], textAlign:'center' })]);
};

const card = (children, props={}) => frame('card', {
  layout: 'vertical',
  fill: T.SURFACE,
  cornerRadius: 14,
  stroke: { fill: T.BORDER, thickness: 1 },
  padding: 24,
  gap: 16,
  ...props,
}, children);

// ── NAV ──────────────────────────────────────────────────────────────────────
const navbar = () => frame('nav', {
  width: T.W,
  height: 60,
  fill: { type:'color', color: T.BG, opacity: 0.95 },
  layout: 'horizontal',
  alignItems: 'center',
  justifyContent: 'space_between',
  padding: [0, 40, 0, 40],
  stroke: { fill: T.BORDER, thickness: 1 },
}, [
  // Logo
  row([
    rect({ width: 28, height: 28, fill: T.PRIMARY, cornerRadius: 8 }),
    text('Convene', { fontSize: 15, fontWeight: '700', fill: T.WHITE }),
  ], { layout:'horizontal', gap: 10, alignItems:'center' }),
  // Nav links
  row([
    text('How it works', { fontSize: 13, fill: T.MUTED }),
    text('Pricing', { fontSize: 13, fill: T.MUTED }),
    btn('Create meeting', 'primary', 148, 36),
  ], { layout:'horizontal', gap: 24, alignItems:'center' }),
]);

// ── STEP INDICATOR ────────────────────────────────────────────────────────────
const stepNum = (n, active=false) => frame(`step-${n}`, {
  width: 32, height: 32,
  fill: active ? T.PRIMARY : T.SURFACE2,
  cornerRadius: 16,
  layout: 'horizontal',
  alignItems: 'center',
  justifyContent: 'center',
  stroke: active ? undefined : { fill: T.BORDER2, thickness: 1 },
}, [text(String(n), { fontSize: 13, fontWeight:'700', fill: active ? T.WHITE : T.MUTED, textAlign:'center' })]);

const step = (n, title, desc, active=false) => row([
  stepNum(n, active),
  col([
    text(title, { fontSize: 14, fontWeight: '600', fill: active ? T.TEXT : T.MUTED2 }),
    text(desc, { fontSize: 12, fill: T.MUTED }),
  ], { gap: 2 }),
], { gap: 14, alignItems: 'start', layout: 'horizontal' });

// ── CALENDAR SLOT ─────────────────────────────────────────────────────────────
const timeSlot = (label, selected=false) => frame('slot', {
  layout: 'horizontal',
  width: 72,
  height: 32,
  fill: selected
    ? { type:'color', color: T.PRIMARY, opacity: 1 }
    : T.SURFACE2,
  cornerRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  stroke: selected ? undefined : { fill: T.BORDER2, thickness: 1 },
}, [text(label, { fontSize: 11, fontWeight: selected?'600':'400', fill: selected ? T.WHITE : T.MUTED2, textAlign:'center' })]);

const calDay = (day, date, slots=[], highlight=false) => col([
  col([
    text(day, { fontSize: 11, fill: T.MUTED, textAlign:'center' }),
    text(date, { fontSize: 16, fontWeight: '600', fill: highlight ? T.PRIMARY_L : T.TEXT, textAlign:'center' }),
  ], { gap: 2, alignItems: 'center' }),
  ...slots.map(s => timeSlot(s.t, s.sel)),
], { gap: 8, alignItems: 'center', layout: 'vertical' });

// ── SCREENS ───────────────────────────────────────────────────────────────────

// 1. LANDING PAGE (before redesign = current; after = our proposal)
const screenLanding = () => frame('Landing Page', {
  type: 'frame',
  width: T.W,
  height: T.H,
  fill: T.BG,
  layout: 'vertical',
  gap: 0,
}, [
  navbar(),

  // Main content: hero + form side by side
  frame('content', {
    layout: 'horizontal',
    width: T.W,
    height: T.H - 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80,
    padding: [0, 80, 0, 80],
  }, [
    // Hero left
    col([
      tag('Fast · Free · No sign-up'),
      text('Find time to\nmeet, fast', {
        fontSize: 52,
        fontWeight: '800',
        fill: T.WHITE,
        width: 460,
      }),
      text('Share a link. Participants mark their availability.\nConvene finds the best time. Done in 48 hours.', {
        fontSize: 15,
        fill: T.MUTED2,
        width: 420,
      }),
      row([
        row([
          avatar('S', T.TEAL, 32),
          avatar('M', T.PRIMARY_L, 32),
          avatar('J', T.PINK, 32),
        ], { gap: -8, layout:'horizontal' }),
        text('Join 2,400+ teams who skip the email chains', { fontSize: 12, fill: T.MUTED }),
      ], { gap: 12, alignItems: 'center', layout: 'horizontal' }),
    ], { gap: 24 }),

    // Create meeting form card
    card([
      text('New meeting', { fontSize: 18, fontWeight: '700', fill: T.WHITE }),
      text('Takes 30 seconds to set up.', { fontSize: 13, fill: T.MUTED }),

      divider({ width: 340 }),

      col([
        text('Meeting title', { fontSize: 12, fontWeight: '500', fill: T.MUTED2 }),
        input('e.g. Q2 Planning', '', '📋'),
      ], { gap: 6 }),
      col([
        text('Your email', { fontSize: 12, fontWeight: '500', fill: T.MUTED2 }),
        input('you@company.com', '', '✉'),
      ], { gap: 6 }),

      row([
        col([
          text('Start date', { fontSize: 12, fontWeight: '500', fill: T.MUTED2 }),
          input('Mar 15', '', '📅'),
        ], { gap: 6, width: 158 }),
        col([
          text('End date', { fontSize: 12, fontWeight: '500', fill: T.MUTED2 }),
          input('Mar 20', '', '📅'),
        ], { gap: 6, width: 158 }),
      ], { gap: 12, layout: 'horizontal', alignItems: 'start' }),

      btn('Create meeting link →', 'primary', 340, 48),

      text('Session expires in 48 hours · No account required', { fontSize: 11, fill: T.MUTED, textAlign:'center', width:340 }),
    ], { width: 388, gap: 14 }),
  ]),
]);

// 2. MEETING SHARED — JOIN PAGE
const screenJoin = () => frame('Join Meeting', {
  type: 'frame',
  width: T.W,
  height: T.H,
  fill: T.BG,
  layout: 'vertical',
  gap: 0,
}, [
  navbar(),

  frame('content', {
    layout: 'horizontal',
    width: T.W,
    height: T.H - 60,
    alignItems: 'start',
    padding: [48, 80, 48, 80],
    gap: 64,
  }, [
    // Left: meeting info + join form
    col([
      // Timer pill
      frame('timer', {
        layout: 'horizontal',
        padding: [6, 12, 6, 12],
        fill: { type:'color', color: T.YELLOW, opacity: 0.1 },
        cornerRadius: 8,
        stroke: { fill: { type:'color', color: T.YELLOW, opacity: 0.25 }, thickness: 1 },
        gap: 6,
        alignItems: 'center',
      }, [
        text('⏱', { fontSize: 13 }),
        text('Closes in 47h 52m', { fontSize: 12, fontWeight: '600', fill: T.YELLOW }),
      ]),

      text('Design Review', { fontSize: 36, fontWeight: '800', fill: T.WHITE, width: 500 }),
      text('Organised by alex@company.com', { fontSize: 13, fill: T.MUTED }),

      divider({ width: 500 }),

      // Meeting details context panel
      card([
        text('Meeting details', { fontSize: 13, fontWeight: '600', fill: T.MUTED2 }),
        row([
          text('📅', { fontSize: 13 }),
          text('Mar 15–20, 2026', { fontSize: 13, fill: T.TEXT }),
        ], { gap: 8, alignItems: 'center', layout:'horizontal' }),
        row([
          text('🕐', { fontSize: 13 }),
          text('9:00 AM – 5:00 PM', { fontSize: 13, fill: T.TEXT }),
        ], { gap: 8, alignItems: 'center', layout:'horizontal' }),
        row([
          text('👥', { fontSize: 13 }),
          text('3 people responded so far', { fontSize: 13, fill: T.TEXT }),
        ], { gap: 8, alignItems: 'center', layout:'horizontal' }),
      ], { width: 500, gap: 12 }),

      col([
        text('Your name', { fontSize: 12, fontWeight: '500', fill: T.MUTED2 }),
        frame('name-input', {
          layout: 'horizontal',
          width: 500,
          height: 48,
          fill: T.SURFACE2,
          cornerRadius: 10,
          stroke: { fill: T.PRIMARY_L, thickness: 1.5 },
          alignItems: 'center',
          padding: [0, 16, 0, 16],
        }, [text('Enter your name', { fontSize: 14, fill: T.MUTED })]),
        text('Then select your available times on the calendar →', { fontSize: 12, fill: T.MUTED }),
      ], { gap: 8 }),

    ], { gap: 20, width: 520 }),

    // Right: time picker
    col([
      row([
        text('Select your available times', { fontSize: 15, fontWeight: '600', fill: T.TEXT }),
        frame('hint', {
          layout:'horizontal',
          padding: [4, 10, 4, 10],
          fill: T.SURFACE2,
          cornerRadius: 6,
        }, [text('Click to toggle', { fontSize: 11, fill: T.MUTED })]),
      ], { gap: 12, layout:'horizontal', alignItems:'center', justifyContent:'space_between', width:560 }),

      // Mini calendar grid
      row([
        calDay('Mon', '15', [
          {t:'9:00',sel:false},{t:'10:00',sel:true},{t:'11:00',sel:true},
          {t:'1:00',sel:false},{t:'2:00',sel:false},{t:'3:00',sel:false},
        ], false),
        calDay('Tue', '16', [
          {t:'9:00',sel:true},{t:'10:00',sel:true},{t:'11:00',sel:false},
          {t:'1:00',sel:true},{t:'2:00',sel:true},{t:'3:00',sel:false},
        ], true),
        calDay('Wed', '17', [
          {t:'9:00',sel:false},{t:'10:00',sel:false},{t:'11:00',sel:false},
          {t:'1:00',sel:false},{t:'2:00',sel:true},{t:'3:00',sel:true},
        ], false),
        calDay('Thu', '18', [
          {t:'9:00',sel:true},{t:'10:00',sel:false},{t:'11:00',sel:false},
          {t:'1:00',sel:false},{t:'2:00',sel:false},{t:'3:00',sel:false},
        ], false),
        calDay('Fri', '19', [
          {t:'9:00',sel:true},{t:'10:00',sel:true},{t:'11:00',sel:true},
          {t:'1:00',sel:false},{t:'2:00',sel:false},{t:'3:00',sel:false},
        ], false),
      ], { gap: 12, layout:'horizontal', alignItems:'start' }),

      btn('Submit availability →', 'primary', 380, 48),
    ], { gap: 20, width: 560 }),
  ]),
]);

// 3. RESULTS PAGE — Best slots found
const screenResults = () => frame('Results Page', {
  type: 'frame',
  width: T.W,
  height: T.H,
  fill: T.BG,
  layout: 'vertical',
  gap: 0,
}, [
  navbar(),

  frame('content', {
    layout: 'vertical',
    width: T.W,
    height: T.H - 60,
    alignItems: 'center',
    padding: [48, 80, 48, 80],
    gap: 32,
  }, [
    col([
      row([
        text('🎉', { fontSize: 28 }),
        text('Best times found', { fontSize: 32, fontWeight: '800', fill: T.WHITE }),
      ], { gap: 12, layout:'horizontal', alignItems:'center' }),
      text('Design Review · 4 of 4 people responded', { fontSize: 14, fill: T.MUTED, textAlign:'center' }),
    ], { gap: 8, alignItems:'center' }),

    // Slot cards
    row([
      // Best slot
      card([
        frame('badge-row', { layout:'horizontal', gap:8, alignItems:'center' }, [
          pill('Best match', T.GREEN),
          text('100% available', { fontSize: 12, fill: T.GREEN }),
        ]),
        text('Tuesday, Mar 16', { fontSize: 20, fontWeight: '700', fill: T.WHITE }),
        text('10:00 AM – 11:00 AM', { fontSize: 15, fill: T.TEXT }),
        row([
          avatar('S', T.TEAL, 28),
          avatar('M', T.PRIMARY_L, 28),
          avatar('J', T.PINK, 28),
          avatar('A', T.YELLOW, 28),
        ], { gap: -6, layout:'horizontal' }),
        btn('Book this slot', 'primary', 240, 44),
      ], { width: 280, gap: 14,
        stroke: { fill: { type:'color', color: T.GREEN, opacity: 0.3 }, thickness: 1 } }),

      // 2nd slot
      card([
        frame('badge-row2', { layout:'horizontal', gap:8, alignItems:'center' }, [
          pill('Good', T.SURFACE2, T.MUTED2),
          text('75% available', { fontSize: 12, fill: T.MUTED }),
        ]),
        text('Friday, Mar 19', { fontSize: 20, fontWeight: '700', fill: T.TEXT }),
        text('9:00 AM – 11:00 AM', { fontSize: 15, fill: T.MUTED2 }),
        row([
          avatar('S', T.TEAL, 28),
          avatar('M', T.PRIMARY_L, 28),
          avatar('J', T.PINK, 28),
          rect({ width: 28, height: 28, fill: T.SURFACE2, cornerRadius: 14 }),
        ], { gap: -6, layout:'horizontal' }),
        btn('Book this slot', 'secondary', 240, 44),
      ], { width: 280, gap: 14 }),

      // 3rd slot
      card([
        frame('badge-row3', { layout:'horizontal', gap:8, alignItems:'center' }, [
          pill('Partial', T.SURFACE2, T.MUTED2),
          text('50% available', { fontSize: 12, fill: T.MUTED }),
        ]),
        text('Monday, Mar 15', { fontSize: 20, fontWeight: '700', fill: T.TEXT }),
        text('10:00 AM – 11:00 AM', { fontSize: 15, fill: T.MUTED2 }),
        row([
          avatar('S', T.TEAL, 28),
          avatar('M', T.PRIMARY_L, 28),
          rect({ width: 28, height: 28, fill: T.SURFACE2, cornerRadius: 14 }),
          rect({ width: 28, height: 28, fill: T.SURFACE2, cornerRadius: 14 }),
        ], { gap: -6, layout:'horizontal' }),
        btn('Book this slot', 'secondary', 240, 44),
      ], { width: 280, gap: 14 }),
    ], { gap: 20, layout:'horizontal', alignItems:'start' }),

    // Share row
    row([
      text('Share results with your team', { fontSize: 13, fill: T.MUTED }),
      frame('share-box', {
        layout: 'horizontal',
        height: 40,
        fill: T.SURFACE2,
        cornerRadius: 8,
        stroke: { fill: T.BORDER2, thickness: 1 },
        padding: [0, 12, 0, 12],
        gap: 8,
        alignItems: 'center',
      }, [
        text('https://convene.app/m/abc123', { fontSize: 12, fill: T.MUTED, width: 260 }),
        btn('Copy', 'primary', 60, 32),
      ]),
    ], { gap: 16, layout:'horizontal', alignItems:'center' }),
  ]),
]);

// 4. ERROR STATE — Proper error with recovery
const screenError = () => frame('Error State', {
  type: 'frame',
  width: T.W,
  height: T.H,
  fill: T.BG,
  layout: 'vertical',
  gap: 0,
}, [
  navbar(),

  frame('content', {
    layout: 'vertical',
    width: T.W,
    height: T.H - 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: [0, 80, 0, 80],
    gap: 32,
  }, [
    // Error icon
    frame('error-icon', {
      width: 80, height: 80,
      fill: { type:'color', color: T.RED, opacity: 0.1 },
      cornerRadius: 40,
      layout: 'horizontal',
      alignItems: 'center',
      justifyContent: 'center',
      stroke: { fill: { type:'color', color: T.RED, opacity: 0.2 }, thickness: 1 },
    }, [text('✕', { fontSize: 32, fill: T.RED, textAlign:'center' })]),

    col([
      text('Something went wrong', { fontSize: 28, fontWeight: '700', fill: T.WHITE, textAlign:'center' }),
      text("We couldn't register your response. This is usually a temporary issue.", {
        fontSize: 14, fill: T.MUTED2, textAlign:'center', width: 420 }),
    ], { gap: 10, alignItems:'center' }),

    card([
      text('What happened?', { fontSize: 13, fontWeight: '600', fill: T.MUTED2 }),
      text('The server returned an unexpected error (500). Your availability was not saved.', {
        fontSize: 13, fill: T.MUTED, width: 380,
      }),
      divider({ width: 380 }),
      col([
        text('What to try:', { fontSize: 12, fontWeight: '500', fill: T.MUTED2 }),
        row([text('→', { fontSize:12, fill:T.MUTED }), text('Refresh the page and try again', { fontSize:12, fill:T.MUTED })], { gap:8, layout:'horizontal' }),
        row([text('→', { fontSize:12, fill:T.MUTED }), text('Check your internet connection', { fontSize:12, fill:T.MUTED })], { gap:8, layout:'horizontal' }),
        row([text('→', { fontSize:12, fill:T.MUTED }), text('Contact the meeting organiser if this persists', { fontSize:12, fill:T.MUTED })], { gap:8, layout:'horizontal' }),
      ], { gap: 6 }),
    ], { width: 420, gap: 12 }),

    row([
      btn('← Back to meeting', 'secondary', 180, 44),
      btn('Try again', 'primary', 140, 44),
    ], { gap: 12, layout:'horizontal' }),

    text('Meeting ID: abc123 · Error code: 500', { fontSize: 11, fill: T.BORDER2 }),
  ]),
]);

// 5. HOW IT WORKS — Standalone explanation page
const screenHowItWorks = () => frame('How It Works', {
  type: 'frame',
  width: T.W,
  height: T.H,
  fill: T.BG,
  layout: 'vertical',
  gap: 0,
}, [
  navbar(),

  frame('content', {
    layout: 'vertical',
    width: T.W,
    height: T.H - 60,
    alignItems: 'center',
    padding: [56, 80, 56, 80],
    gap: 48,
  }, [
    col([
      tag('No sign-up · No credit card · No fluff'),
      text('How Convene works', { fontSize: 40, fontWeight: '800', fill: T.WHITE, textAlign:'center' }),
      text('Three steps. Under a minute. Works every time.', { fontSize: 15, fill: T.MUTED, textAlign:'center' }),
    ], { gap: 14, alignItems:'center' }),

    // 3 step cards in a row
    row([
      card([
        frame('step-hd', { layout:'horizontal', gap:14, alignItems:'center' }, [
          frame('step-n', {
            width:40, height:40, fill:T.PRIMARY, cornerRadius:12,
            layout:'horizontal', alignItems:'center', justifyContent:'center',
          }, [text('1', { fontSize:18, fontWeight:'800', fill:T.WHITE, textAlign:'center' })]),
          text('Create', { fontSize:18, fontWeight:'700', fill:T.WHITE }),
        ]),
        text('Enter your meeting title, email, and the date range you want to find time in.', {
          fontSize: 13, fill: T.MUTED, width: 240,
        }),
        divider({ width: 272 }),
        row([
          text('⏱', { fontSize:13 }),
          text('30 seconds', { fontSize:12, fill:T.MUTED }),
        ], { gap:6, layout:'horizontal', alignItems:'center' }),
      ], { width: 296, gap: 14 }),

      // Arrow connector
      text('→', { fontSize: 28, fill: T.BORDER2 }),

      card([
        frame('step-hd2', { layout:'horizontal', gap:14, alignItems:'center' }, [
          frame('step-n2', {
            width:40, height:40, fill:T.PRIMARY, cornerRadius:12,
            layout:'horizontal', alignItems:'center', justifyContent:'center',
          }, [text('2', { fontSize:18, fontWeight:'800', fill:T.WHITE, textAlign:'center' })]),
          text('Share', { fontSize:18, fontWeight:'700', fill:T.WHITE }),
        ]),
        text('Send the unique link to everyone who needs to be at the meeting. No login required.', {
          fontSize: 13, fill: T.MUTED, width: 240,
        }),
        divider({ width: 272 }),
        row([
          text('🔗', { fontSize:13 }),
          text('Instant link, no signup', { fontSize:12, fill:T.MUTED }),
        ], { gap:6, layout:'horizontal', alignItems:'center' }),
      ], { width: 296, gap: 14 }),

      text('→', { fontSize: 28, fill: T.BORDER2 }),

      card([
        frame('step-hd3', { layout:'horizontal', gap:14, alignItems:'center' }, [
          frame('step-n3', {
            width:40, height:40, fill:T.PRIMARY, cornerRadius:12,
            layout:'horizontal', alignItems:'center', justifyContent:'center',
          }, [text('3', { fontSize:18, fontWeight:'800', fill:T.WHITE, textAlign:'center' })]),
          text('Meet', { fontSize:18, fontWeight:'700', fill:T.WHITE }),
        ]),
        text('Convene shows the best overlap automatically. Book the slot in one click.', {
          fontSize: 13, fill: T.MUTED, width: 240,
        }),
        divider({ width: 272 }),
        row([
          text('✅', { fontSize:13 }),
          text('Best slot auto-ranked', { fontSize:12, fill:T.MUTED }),
        ], { gap:6, layout:'horizontal', alignItems:'center' }),
      ], { width: 296, gap: 14 }),
    ], { gap: 20, layout:'horizontal', alignItems:'center' }),

    btn('Create your first meeting →', 'primary', 260, 52),
  ]),
]);

// ── BUILD DOCUMENT ────────────────────────────────────────────────────────────
function buildDoc() {
  const screens = [
    screenLanding(),
    screenJoin(),
    screenResults(),
    screenError(),
    screenHowItWorks(),
  ];

  const GAP = 80;
  screens.forEach((s, i) => { s.x = i * (T.W + GAP); s.y = 0; });

  return {
    version: '2.8',
    name: 'Convene Redesign',
    themes: { mode: ['light', 'dark'] },
    variables: {
      'color.bg':       { type:'color', value: T.BG },
      'color.surface':  { type:'color', value: T.SURFACE },
      'color.primary':  { type:'color', value: T.PRIMARY },
      'color.teal':     { type:'color', value: T.TEAL },
      'color.text':     { type:'color', value: T.TEXT },
      'color.muted':    { type:'color', value: T.MUTED },
    },
    children: screens,
  };
}

const doc = buildDoc();
const out = '/tmp/convene.pen';
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log(`✅ Generated ${out}`);
console.log(`   ${doc.children.length} screens:`);
doc.children.forEach((s, i) => console.log(`   ${i+1}. ${s.name}`));
console.log(`   Size: ${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
