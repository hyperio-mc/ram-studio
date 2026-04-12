// contact-form.js — Precise customer contact form design system
// Shows: full desktop form, field state anatomy, mobile form, success state
// Every pixel intentional: field heights 44px, 2px borders, 8px radius, 6px gaps
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  pageBg:      '#F3F4F6',
  card:        '#FFFFFF',
  fg:          '#111827',
  label:       '#374151',
  muted:       '#6B7280',
  placeholder: '#9CA3AF',
  divider:     '#E5E7EB',
  border:      '#D1D5DB',
  borderFocus: '#2563EB',
  borderError: '#EF4444',
  borderOk:    '#10B981',
  focusRing:   '#EFF6FF',
  errorTint:   '#FFF1F2',
  okTint:      '#F0FDF4',
  primary:     '#2563EB',
  primaryDark: '#1D4ED8',
  primaryText: '#FFFFFF',
  accent:      '#EFF6FF',
  error:       '#EF4444',
  errorText:   '#B91C1C',
  success:     '#10B981',
  brand:       '#2563EB',
  brandDark:   '#1E3A8A',
  brandLight:  '#DBEAFE',
};

// ── Field metrics ─────────────────────────────────────────────────────────────
const FH  = 44;   // field height
const BW  = 2;    // border width
const FR  = 8;    // field corner radius
const LP  = 14;   // left padding inside field
const LH  = 16;   // label height
const LG  = 7;    // gap: label bottom → field top
const HG  = 5;    // gap: field bottom → helper top
const HL  = 14;   // helper text height
// Full field unit height (label + gap + field + gap + helper)
const FU  = LH + LG + FH + HG + HL;   // = 86px
const FUS = LH + LG + FH;             // = 67px (no helper)

// ── Canvas ─────────────────────────────────────────────────────────────────────
const DW = 1440, DH = 900;
const MW = 375,  MH = 812;
const GAP = 24;

// ── Pen helpers ───────────────────────────────────────────────────────────────
function F(x,y,w,h,fill,opts={}) {
  return {
    type:'frame', x, y, width:Math.max(0,w), height:Math.max(0,h), fill,
    cornerRadius: opts.r||0, opacity: opts.op||1,
    children: opts.ch||[], clipContent: opts.clip||false,
  };
}
function T(text,x,y,w,h,opts={}) {
  return {
    type:'text', x, y, width:Math.max(0,w), height:Math.max(0,h),
    content: String(text), fontSize: opts.size||14, fontWeight: opts.weight||400,
    fill: opts.fill||C.fg, textAlign: opts.align||'left',
    letterSpacing: opts.ls||0, opacity: opts.op||1, fontStyle: opts.style||'normal',
  };
}
function E(x,y,w,h,fill,opts={}) {
  return { type:'ellipse', x, y, width:Math.max(0,w), height:Math.max(0,h), fill, opacity:opts.op||1 };
}
function L(x,y,w,h,fill) { return F(x,y,w,h,fill,{r:0}); }

// ── Form component helpers ─────────────────────────────────────────────────────

// Returns array of elements: [focusRing?, label, requiredDot?, border(inner(text, icon))]
// height consumed: FU (with helper) or FUS (without)
function TextField(x, y, w, {
  label='', required=false, placeholder='', value='',
  state='default',   // 'default' | 'focus' | 'error' | 'success' | 'disabled'
  helper='', type='text'
}={}) {
  const styles = {
    default:  { border:C.border,      bg:C.card,      ring:null,         icon:null },
    focus:    { border:C.borderFocus, bg:C.card,      ring:C.focusRing,  icon:null },
    error:    { border:C.borderError, bg:C.errorTint, ring:'#FEE2E2',    icon:'!' },
    success:  { border:C.borderOk,    bg:C.okTint,    ring:null,         icon:'✓' },
    disabled: { border:C.border,      bg:C.pageBg,    ring:null,         icon:null },
  };
  const s = styles[state] || styles.default;
  const elems = [];
  const innerW = w - BW*2;
  const innerH = FH - BW*2;
  const textY  = (innerH - 16) / 2;

  // Focus ring (rendered behind field)
  if (s.ring) elems.push(F(x-4, y+LH+LG-4, w+8, FH+8, s.ring, {r:FR+4}));

  // Label
  if (label) {
    elems.push(T(label, x, y, w-40, LH, {size:13, weight:600, fill:C.label}));
    if (required) elems.push(T('*', x + Math.min(label.length*7, w-50), y, 10, LH, {size:13, fill:C.error}));
  }

  // Outer border frame → inner fill frame
  const iconAreaW = s.icon ? innerH : 0;
  elems.push(F(x, y+LH+LG, w, FH, s.border, {r:FR, ch:[
    F(BW, BW, innerW, innerH, s.bg, {r:FR-BW, ch:[
      // Text or placeholder
      T(value||placeholder, LP, textY, innerW-LP*2-iconAreaW, 16, {
        size:14, fill: value ? C.fg : C.placeholder,
        op: state==='disabled' ? 0.5 : 1,
      }),
      // Icon (error ! or success ✓)
      ...(s.icon ? [
        E(innerW-BW-innerH+BW, BW, innerH-BW*2, innerH-BW*2,
          state==='error' ? C.borderError : C.borderOk, {}),
        T(s.icon, innerW-BW-innerH+BW+5, textY-1, innerH-BW*2-8, 16,
          {size:11, weight:700, fill:C.card, align:'center'}),
      ] : []),
    ]}),
  ]}));

  // Helper / error text
  if (helper) {
    elems.push(T(helper, x, y+LH+LG+FH+HG, w, HL, {
      size:11, fill: state==='error' ? C.errorText : C.muted,
    }));
  }

  return elems;
}

// Select / dropdown field
function SelectField(x, y, w, {
  label='', required=false, value='', placeholder='Select an option',
  state='default', helper=''
}={}) {
  const s = state==='focus'
    ? {border:C.borderFocus, bg:C.card, ring:C.focusRing}
    : {border:C.border,      bg:C.card, ring:null};
  const innerW = w-BW*2, innerH = FH-BW*2;
  const textY  = (innerH-16)/2;
  const elems  = [];

  if (s.ring) elems.push(F(x-4, y+LH+LG-4, w+8, FH+8, s.ring, {r:FR+4}));

  if (label) {
    elems.push(T(label, x, y, w-40, LH, {size:13, weight:600, fill:C.label}));
    if (required) elems.push(T('*', x+Math.min(label.length*7,w-50), y, 10, LH, {size:13, fill:C.error}));
  }

  elems.push(F(x, y+LH+LG, w, FH, s.border, {r:FR, ch:[
    F(BW, BW, innerW, innerH, s.bg, {r:FR-BW, ch:[
      T(value||placeholder, LP, textY, innerW-48, 16, {
        size:14, fill: value ? C.fg : C.placeholder,
      }),
      // Dropdown chevron area
      F(innerW-36, 0, 36, innerH, s.bg, {r:0, ch:[
        T('▾', 8, textY-1, 20, 18, {size:14, fill:C.muted, align:'center'}),
      ]}),
    ]}),
  ]}));

  if (helper) elems.push(T(helper, x, y+LH+LG+FH+HG, w, HL, {size:11, fill:C.muted}));

  return elems;
}

// Textarea field
function TextareaField(x, y, w, th=120, {
  label='', required=false, placeholder='', value='',
  state='default', maxChars=500, charCount=0
}={}) {
  const s = state==='focus'
    ? {border:C.borderFocus, bg:C.card, ring:C.focusRing}
    : {border:C.border,      bg:C.card, ring:null};
  const innerW = w-BW*2, innerH = th-BW*2;
  const elems  = [];

  if (s.ring) elems.push(F(x-4, y+LH+LG-4, w+8, th+8, s.ring, {r:FR+4}));

  if (label) {
    elems.push(T(label, x, y, w-80, LH, {size:13, weight:600, fill:C.label}));
    if (required) elems.push(T('*', x+Math.min(label.length*7,w-90), y, 10, LH, {size:13, fill:C.error}));
    // Char count right-aligned in label row
    elems.push(T(`${charCount}/${maxChars}`, x+w-60, y, 60, LH, {size:11, fill:C.muted, align:'right'}));
  }

  elems.push(F(x, y+LH+LG, w, th, s.border, {r:FR, ch:[
    F(BW, BW, innerW, innerH, s.bg, {r:FR-BW, ch:[
      T(value||placeholder, LP, 14, innerW-LP*2, innerH-28, {
        size:14, fill: value ? C.fg : C.placeholder,
      }),
      // Resize handle (3 diagonal lines, bottom-right)
      L(innerW-18, innerH-8,  8, 1, C.border),
      L(innerW-14, innerH-12, 8, 1, C.border),
      L(innerW-10, innerH-16, 8, 1, C.border),
    ]}),
  ]}));

  return elems;
}

// File upload zone
function FileUpload(x, y, w, h=80, {label=''}={}) {
  return [
    label ? T(label, x, y, w, LH, {size:13, weight:600, fill:C.label}) : null,
    F(x, y+(label?LH+LG:0), w, h, C.pageBg, {r:FR, ch:[
      // Dashed border simulated with inner frame offset
      F(0, 0, w, h, C.border, {r:FR, ch:[
        F(2, 2, w-4, h-4, C.pageBg, {r:FR-2, ch:[
          // Upload icon (simple arrow)
          F((w-32)/2, 14, 32, 20, C.primaryText, {r:0,ch:[
            F(0,0,32,20,C.accent,{r:6,ch:[
              T('↑', 0, 2, 32, 16, {size:13, weight:700, fill:C.primary, align:'center'}),
            ]}),
          ]}),
          T('Drop files here or click to browse', 0, 38, w, 14, {size:12, fill:C.muted, align:'center'}),
          T('PDF, PNG, JPG up to 10MB', 0, 54, w, 12, {size:10, fill:C.placeholder, align:'center'}),
        ]}),
      ]}),
    ]}),
  ].filter(Boolean);
}

// Checkbox
function Checkbox(x, y, w, {label='', checked=false, state='default'}={}) {
  const boxColor = checked ? C.primary : (state==='error' ? C.borderError : C.border);
  return [
    F(x, y, 20, 20, boxColor, {r:4, ch:[
      F(BW, BW, 20-BW*2, 20-BW*2, checked ? C.primary : C.card, {r:2, ch:[
        checked ? T('✓', 1, 1, 16, 16, {size:11, weight:700, fill:C.card, align:'center'}) : T('',0,0,0,0,{}),
      ]}),
    ]}),
    T(label, x+28, y+2, w-28, 16, {size:13, fill:C.fg}),
  ];
}

// Primary submit button
function SubmitButton(x, y, w, {label='Send Message', state='default'}={}) {
  const bg = state==='loading' ? C.primaryDark : state==='disabled' ? C.border : C.primary;
  const text = state==='loading' ? 'Sending…' : label;
  return [
    F(x, y, w, 48, bg, {r:8, ch:[
      T(text, 0, 16, w, 16, {size:15, weight:600, fill:C.primaryText, align:'center', ls:0.2}),
    ]}),
  ];
}

// Section divider with label
function SectionLabel(x, y, w, label) {
  return [
    T(label.toUpperCase(), x, y, w, 14, {size:10, weight:700, fill:C.muted, ls:1.5}),
    L(x, y+20, w, 1, C.divider),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 0 — Desktop: Full Contact Form
// ══════════════════════════════════════════════════════════════════════════════
function desktopForm(ox) {
  const LP_W = 480;                     // left (brand) panel width
  const RP_W = DW - LP_W;               // right panel width = 960
  const FW   = 480;                     // form column width
  const FX   = (RP_W - FW) / 2;        // form x relative to right panel = 240
  let   FY   = 60;                      // current y within right panel

  const fields = [];

  // RIGHT PANEL: Form title
  fields.push(T('Get in touch', FX, FY, FW, 36, {size:30, weight:700, fill:C.fg}));
  FY += 44;
  fields.push(T("We'll get back to you within one business day.", FX, FY, FW, 20, {size:14, fill:C.muted}));
  FY += 36;

  // Name + Email (two columns)
  const halfW = (FW - 16) / 2;
  fields.push(...TextField(FX, FY, halfW, {
    label:'Full name', required:true, placeholder:'Jane Smith',
  }));
  fields.push(...TextField(FX + halfW + 16, FY, halfW, {
    label:'Email address', required:true, placeholder:'jane@company.com',
  }));
  FY += FUS + 20;

  // Phone + Company (two columns)
  fields.push(...TextField(FX, FY, halfW, {
    label:'Phone number', placeholder:'+1 (555) 000-0000',
    helper:'Optional',
  }));
  fields.push(...TextField(FX + halfW + 16, FY, halfW, {
    label:'Company', placeholder:'Acme Corp',
    helper:'Optional',
  }));
  FY += FU + 20;

  // Subject dropdown
  fields.push(...SelectField(FX, FY, FW, {
    label:'Subject', required:true, placeholder:'Choose a topic…',
  }));
  FY += FUS + 20;

  // Message textarea
  fields.push(...TextareaField(FX, FY, FW, 128, {
    label:'Message', required:true,
    placeholder:'Tell us what you need help with…',
    maxChars:500, charCount:0,
  }));
  FY += LH + LG + 128 + 20;

  // File upload
  fields.push(...FileUpload(FX, FY, FW, 76, {label:'Attachments'}));
  FY += LH + LG + 76 + 20;

  // Privacy checkbox
  fields.push(...Checkbox(FX, FY, FW, {
    label:'I agree to the Privacy Policy and Terms of Service.',
    checked:false,
  }));
  FY += 36;

  // Submit button
  fields.push(...SubmitButton(FX, FY, FW, {label:'Send Message →'}));

  return F(ox, 0, DW, DH, C.pageBg, {clip:true, ch:[
    // LEFT brand panel
    F(0, 0, LP_W, DH, C.brand, {r:0, ch:[
      // Logo
      T('RAM', 56, 56, 80, 32, {size:26, weight:900, fill:C.primaryText, ls:4}),
      T('DESIGN STUDIO', 56, 88, 200, 16, {size:10, weight:700, fill:C.primaryText, ls:2, op:0.6}),

      // Headline
      T('We would love to\nhear from you.', 56, 160, LP_W-112, 96, {size:36, weight:700, fill:C.primaryText}),
      T('Reach out for partnerships, custom\ndesigns, or just to say hello.', 56, 272, LP_W-112, 48, {size:14, fill:C.primaryText, op:0.7}),

      // Divider
      L(56, 344, LP_W-112, 1, '#FFFFFF22'),

      // Contact details
      ...([
        ['📧', 'hello@ram.studio'],
        ['📱', '+1 (555) 234-5678'],
        ['📍', 'San Francisco, CA'],
      ].flatMap(([icon, text], i) => [
        T(icon, 56, 364 + i*44, 28, 20, {size:16}),
        T(text, 92, 366 + i*44, LP_W-148, 18, {size:14, fill:C.primaryText, op:0.85}),
      ])),

      L(56, 504, LP_W-112, 1, '#FFFFFF22'),

      // Social proof
      T('Average response time', 56, 524, LP_W-112, 14, {size:11, fill:C.primaryText, op:0.5, ls:0.5}),
      T('< 2 hours', 56, 542, LP_W-112, 24, {size:20, weight:700, fill:C.primaryText}),

      // Rating
      T('★★★★★', 56, 592, 90, 18, {size:14, fill:'#FCD34D'}),
      T('4.9 / 5 from 240+ clients', 56, 614, LP_W-112, 14, {size:12, fill:C.primaryText, op:0.6}),

      // Bottom note
      T('ram.zenbin.org/gallery', 56, DH-40, LP_W-112, 14, {size:11, fill:C.primaryText, op:0.3}),
    ]}),

    // RIGHT form panel
    F(LP_W, 0, RP_W, DH, C.card, {r:0, ch:[
      ...fields,
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Desktop: Field State Anatomy
// ══════════════════════════════════════════════════════════════════════════════
function desktopStates(ox) {
  const PAD   = 60;
  const CW    = DW - PAD*2;  // content width
  const COL_W = (CW - 48) / 4;  // 4 columns

  const states = [
    { state:'default', label:'DEFAULT', desc:'Resting state. Gray border #D1D5DB, 2px. No interaction.' },
    { state:'focus',   label:'FOCUSED',  desc:'Active / typing. Blue border #2563EB, blue ring #EFF6FF.' },
    { state:'error',   label:'ERROR',    desc:'Failed validation. Red border #EF4444, error icon + helper.' },
    { state:'success', label:'SUCCESS',  desc:'Validated. Green border #10B981, check icon, green tint.' },
  ];

  const fieldConfigs = [
    { placeholder:'Your name', value:'', helper:'' },
    { placeholder:'Your name', value:'', helper:'' },
    { placeholder:'Your name', value:'Jane Sm', helper:'Name must be at least 8 characters.' },
    { placeholder:'Your name', value:'Jane Smith', helper:'Looks great!' },
  ];

  const ROW_Y  = 120;
  const ROW2_Y = ROW_Y + FU + 80;
  const ROW3_Y = ROW2_Y + FU + 80;

  return F(ox, 0, DW, DH, C.pageBg, {clip:true, ch:[
    // Page header
    F(0, 0, DW, 80, C.card, {r:0, ch:[
      T('Field State Anatomy', PAD, 24, 600, 32, {size:24, weight:700, fill:C.fg}),
      T('Customer Contact Form · Design Spec', PAD, 56, 600, 18, {size:13, fill:C.muted}),
      T('FH=44px · BW=2px · FR=8px · LP=14px', DW-PAD-320, 32, 320, 16, {size:11, fill:C.muted, align:'right', ls:0.5}),
    ]}),
    L(0, 80, DW, 1, C.divider),

    // 4 state columns
    ...states.flatMap(({state, label, desc}, ci) => {
      const cx = PAD + ci * (COL_W + 16);
      const cfg = fieldConfigs[ci];
      return [
        // State label chip
        F(cx, ROW_Y - 36, COL_W, 24, state==='error'?'#FEE2E2':state==='success'?'#D1FAE5':state==='focus'?C.brandLight:C.pageBg, {r:6, ch:[
          T(label, 0, 5, COL_W, 14, {
            size:10, weight:700, align:'center', ls:1.5,
            fill: state==='error'?C.errorText:state==='success'?'#065F46':state==='focus'?C.primary:C.muted,
          }),
        ]}),

        // The field itself
        ...TextField(cx, ROW_Y, COL_W, {
          label:'Full name', required: ci===0,
          placeholder: cfg.placeholder,
          value: cfg.value,
          state, helper: cfg.helper,
        }),

        // Spec description
        F(cx, ROW_Y + FU + 12, COL_W, 60, C.card, {r:6, ch:[
          T(desc, 12, 10, COL_W-24, 40, {size:11, fill:C.muted}),
        ]}),
      ];
    }),

    // ── Row 2: More field types ─────────────────────────────────────────────
    L(PAD, ROW2_Y - 28, CW, 1, C.divider),
    T('FIELD TYPES', PAD, ROW2_Y - 20, 200, 12, {size:10, weight:700, fill:C.muted, ls:2}),

    // Text input default
    ...TextField(PAD, ROW2_Y, COL_W, {
      label:'Text input', placeholder:'Type something…',
    }),
    // Select default
    ...SelectField(PAD + COL_W + 16, ROW2_Y, COL_W, {
      label:'Dropdown / Select',
      placeholder:'Choose an option…',
    }),
    // Select open (value chosen)
    ...SelectField(PAD + (COL_W+16)*2, ROW2_Y, COL_W, {
      label:'Dropdown (filled)',
      value:'General Inquiry',
    }),
    // Disabled
    ...TextField(PAD + (COL_W+16)*3, ROW2_Y, COL_W, {
      label:'Disabled field',
      placeholder:'Not editable',
      state:'disabled',
      helper:'This field is read-only.',
    }),

    // ── Row 3: Textarea + checkbox + button ─────────────────────────────────
    L(PAD, ROW3_Y - 28, CW, 1, C.divider),
    T('TEXTAREA · CHECKBOX · BUTTON', PAD, ROW3_Y - 20, 400, 12, {size:10, weight:700, fill:C.muted, ls:2}),

    // Textarea (default)
    ...TextareaField(PAD, ROW3_Y, COL_W*2+16, 100, {
      label:'Message',
      placeholder:'Describe what you need help with…',
    }),
    // Textarea (focused + partially filled)
    ...TextareaField(PAD + (COL_W+16)*2, ROW3_Y, COL_W*2+16, 100, {
      label:'Message',
      value:'Hey, reaching out about a design project for...',
      state:'focus', maxChars:500, charCount:46,
    }),

    // Checkbox row — below textareas
    ...Checkbox(PAD, ROW3_Y + LH+LG+100+16, COL_W*2, {
      label:'I agree to the Privacy Policy and Terms of Service.',
      checked:false,
    }),
    ...Checkbox(PAD + (COL_W+16)*2, ROW3_Y + LH+LG+100+16, COL_W*2, {
      label:'I agree to the Privacy Policy and Terms of Service.',
      checked:true,
    }),

    // Buttons
    ...SubmitButton(PAD, ROW3_Y + LH+LG+100+60, COL_W, {label:'Send Message →'}),
    ...SubmitButton(PAD + COL_W + 16, ROW3_Y + LH+LG+100+60, COL_W, {label:'Sending…', state:'loading'}),
    ...SubmitButton(PAD + (COL_W+16)*2, ROW3_Y + LH+LG+100+60, COL_W, {label:'Sent ✓'}),
    ...SubmitButton(PAD + (COL_W+16)*3, ROW3_Y + LH+LG+100+60, COL_W, {label:'Disabled', state:'disabled'}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Desktop: Form with validation errors
// ══════════════════════════════════════════════════════════════════════════════
function desktopErrors(ox) {
  const LP_W = 480;
  const RP_W = DW - LP_W;
  const FW   = 480;
  const FX   = (RP_W - FW) / 2;        // relative to right panel
  let   FY   = 56;
  const fields = [];

  // Error banner
  fields.push(F(FX, FY, FW, 56, '#FFF1F2', {r:8, ch:[
    E(16, 18, 20, 20, C.borderError, {}),
    T('!', 16+7, 20, 6, 16, {size:10, weight:700, fill:C.card}),
    T('Please fix 3 errors before submitting.', 44, 16, FW-60, 16, {size:14, weight:600, fill:C.errorText}),
    T('All required fields must be completed.', 44, 34, FW-60, 14, {size:12, fill:C.errorText, op:0.7}),
  ]}));
  FY += 72;

  fields.push(T('Get in touch', FX, FY, FW, 32, {size:26, weight:700, fill:C.fg}));
  FY += 44;

  const halfW = (FW - 16) / 2;

  // Name — error state
  fields.push(...TextField(FX, FY, halfW, {
    label:'Full name', required:true,
    value:'Jo',
    state:'error',
    helper:'Must be at least 3 characters.',
  }));
  // Email — error state
  fields.push(...TextField(FX + halfW + 16, FY, halfW, {
    label:'Email address', required:true,
    value:'jane@',
    state:'error',
    helper:'Enter a valid email address.',
  }));
  FY += FU + 16;

  // Phone — success (valid)
  fields.push(...TextField(FX, FY, halfW, {
    label:'Phone number',
    value:'+1 (555) 234-5678',
    state:'success',
    helper:'Verified format.',
  }));
  // Company — filled / default
  fields.push(...TextField(FX + halfW + 16, FY, halfW, {
    label:'Company',
    value:'Acme Corp',
    helper:'Optional',
  }));
  FY += FU + 16;

  // Subject — error (not selected)
  fields.push(...SelectField(FX, FY, FW, {
    label:'Subject', required:true,
    placeholder:'Choose a topic…',
    state:'focus',
  }));
  FY += FUS + 16;

  // Message — filled
  fields.push(...TextareaField(FX, FY, FW, 100, {
    label:'Message', required:true,
    value:'Hi, I\'m interested in a custom design system for our startup. We need 20+ screens designed...',
    maxChars:500, charCount:94,
  }));
  FY += LH + LG + 100 + 16;

  // Checkbox — unchecked (error)
  fields.push(F(FX, FY, FW, 36, '#FFF1F2', {r:6, ch:[
    ...Checkbox(12, 8, FW-24, {
      label:'I agree to the Privacy Policy and Terms of Service.',
      checked:false, state:'error',
    }),
  ]}));
  FY += 52;

  fields.push(...SubmitButton(FX, FY, FW, {label:'Send Message →'}));

  return F(ox, 0, DW, DH, C.pageBg, {clip:true, ch:[
    // Left brand panel (same as screen 0)
    F(0, 0, LP_W, DH, C.brand, {r:0, ch:[
      T('RAM', 56, 56, 80, 32, {size:26, weight:900, fill:C.primaryText, ls:4}),
      T('DESIGN STUDIO', 56, 88, 200, 14, {size:10, weight:700, fill:C.primaryText, ls:2, op:0.6}),
      T('We would love to\nhear from you.', 56, 160, LP_W-112, 96, {size:36, weight:700, fill:C.primaryText}),
      T('Reach out for partnerships, custom\ndesigns, or just to say hello.', 56, 272, LP_W-112, 48, {size:14, fill:C.primaryText, op:0.7}),
      L(56, 344, LP_W-112, 1, '#FFFFFF22'),
      ...([['📧','hello@ram.studio'],['📱','+1 (555) 234-5678'],['📍','San Francisco, CA']].flatMap(([ic,tx],i) => [
        T(ic, 56, 364+i*44, 28, 20, {size:16}),
        T(tx, 92, 366+i*44, LP_W-148, 18, {size:14, fill:C.primaryText, op:0.85}),
      ])),
    ]}),
    // Right panel with validation errors
    F(LP_W, 0, RP_W, DH, C.card, {r:0, ch:[
      ...fields,
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Mobile: Contact Form
// ══════════════════════════════════════════════════════════════════════════════
function mobileForm(ox) {
  const PAD = 20;
  const FW  = MW - PAD*2;
  let   FY  = 56;
  const fields = [];

  // Back button + header
  fields.push(F(0, 0, MW, 52, C.card, {r:0, ch:[
    T('←', PAD, 16, 24, 20, {size:18, fill:C.fg}),
    T('Contact Us', 0, 15, MW, 20, {size:16, weight:700, fill:C.fg, align:'center'}),
  ]}));
  L(0, 52, MW, 1, C.divider);

  // Progress indicator: 2 of 2 steps
  fields.push(F(0, 52, MW, 4, C.divider, {r:0}));
  fields.push(F(0, 52, MW, 4, C.primary, {r:0}));  // full = step 2/2

  FY = 76;

  // Form intro
  fields.push(T('Get in touch', PAD, FY, FW, 28, {size:22, weight:700, fill:C.fg}));
  FY += 36;
  fields.push(T('Fill in the form and we\'ll reply within 24h.', PAD, FY, FW, 32, {size:13, fill:C.muted}));
  FY += 40;

  // Name (full width)
  fields.push(...TextField(PAD, FY, FW, {
    label:'Full name', required:true, placeholder:'Jane Smith',
  }));
  FY += FUS + 16;

  // Email
  fields.push(...TextField(PAD, FY, FW, {
    label:'Email address', required:true, placeholder:'jane@company.com',
  }));
  FY += FUS + 16;

  // Phone
  fields.push(...TextField(PAD, FY, FW, {
    label:'Phone', placeholder:'+1 (555) 000-0000',
    helper:'Optional',
  }));
  FY += FU + 16;

  // Subject
  fields.push(...SelectField(PAD, FY, FW, {
    label:'Subject', required:true, placeholder:'Choose a topic…',
  }));
  FY += FUS + 16;

  // Message
  fields.push(...TextareaField(PAD, FY, FW, 100, {
    label:'Message', required:true,
    placeholder:'Tell us what you need…',
    maxChars:500, charCount:0,
  }));
  FY += LH + LG + 100 + 16;

  // Checkbox
  fields.push(...Checkbox(PAD, FY, FW, {
    label:'I agree to the Privacy Policy.',
  }));
  FY += 36;

  // Submit
  fields.push(...SubmitButton(PAD, FY, FW, {label:'Send Message →'}));

  return F(ox, 0, MW, MH, C.pageBg, {clip:true, ch:[
    F(0, 0, MW, MH, C.card, {r:0, ch: fields}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Mobile: Success State
// ══════════════════════════════════════════════════════════════════════════════
function mobileSuccess(ox) {
  return F(ox, 0, MW, MH, C.card, {clip:true, ch:[
    // Header stays
    F(0, 0, MW, 52, C.card, {r:0, ch:[
      T('Contact Us', 0, 15, MW, 20, {size:16, weight:700, fill:C.fg, align:'center'}),
    ]}),
    L(0, 52, MW, 1, C.divider),
    // Full progress bar
    F(0, 52, MW, 4, C.borderOk, {r:0}),

    // Success icon (big circle + checkmark)
    E((MW-80)/2, 180, 80, 80, '#D1FAE5', {}),
    E((MW-60)/2, 190, 60, 60, C.borderOk, {}),
    T('✓', 0, 210, MW, 28, {size:24, weight:700, fill:C.card, align:'center'}),

    // Headline
    T('Message sent!', 0, 290, MW, 32, {size:26, weight:700, fill:C.fg, align:'center'}),
    T('We\'ve received your message and\nwill reply within one business day.', 32, 330, MW-64, 48, {size:14, fill:C.muted, align:'center'}),

    // Confirmation detail card
    F(24, 400, MW-48, 104, C.pageBg, {r:12, ch:[
      T('YOUR SUBMISSION', 20, 16, MW-88, 12, {size:10, weight:700, fill:C.muted, ls:1.5}),
      L(20, 32, MW-88, 1, C.divider),
      T('Name', 20, 42, 80, 14, {size:12, fill:C.muted}),
      T('Jane Smith', 110, 42, MW-130, 14, {size:12, weight:600, fill:C.fg}),
      T('Email', 20, 62, 80, 14, {size:12, fill:C.muted}),
      T('jane@company.com', 110, 62, MW-130, 14, {size:12, weight:600, fill:C.fg}),
      T('Topic', 20, 82, 80, 14, {size:12, fill:C.muted}),
      T('General Inquiry', 110, 82, MW-130, 14, {size:12, weight:600, fill:C.fg}),
    ]}),

    // Reference number
    T('Reference: #RAM-2026-0317', 0, 522, MW, 14, {size:12, fill:C.muted, align:'center'}),

    // Action buttons
    ...SubmitButton(24, 572, MW-48, {label:'Back to Home'}),
    F(24, 632, MW-48, 44, C.card, {r:8, ch:[
      F(0, 0, MW-48, 44, C.border, {r:8, ch:[
        F(BW, BW, MW-48-BW*2, 44-BW*2, C.card, {r:6, ch:[
          T('Send Another Message', 0, 14, MW-48-BW*2, 16, {size:14, weight:600, fill:C.fg, align:'center'}),
        ]}),
      ]}),
    ]}),

    // Footer
    T('Powered by RAM Design Studio', 0, MH-32, MW, 14, {size:11, fill:C.placeholder, align:'center'}),
  ]});
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [
  desktopForm(0),
  desktopStates(DW + GAP),
  desktopErrors((DW + GAP)*2),
  mobileForm((DW + GAP)*3),
  mobileSuccess((DW + GAP)*3 + MW + GAP),
];

const pen     = { version:'2.8', children: screens };
const penJson = JSON.stringify(pen, null, 2);
fs.writeFileSync(path.join(__dirname,'contact-form.pen'), penJson);
console.log('Pen written: contact-form.pen');
console.log(`Screens: ${screens.length}`);

// ── Share page HTML ───────────────────────────────────────────────────────────
const penB64 = Buffer.from(penJson).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CONTACT FORM — Precise Form Design System</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#F3F4F6;color:#111827;font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:16px 40px;border-bottom:1px solid #E5E7EB;background:#fff;display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:12px;font-weight:700;letter-spacing:4px;color:#374151}
  .nav-r{display:flex;gap:10px;align-items:center}
  .btn{padding:9px 18px;font-size:11px;font-weight:700;cursor:pointer;border-radius:6px;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.5px;border:none}
  .btn-p{background:#2563EB;color:#fff}
  .btn-s{background:#fff;color:#374151;border:1px solid #D1D5DB}
  .btn-x{background:#000;color:#fff}
  .hero{padding:64px 40px 40px;max-width:980px}
  .tag{font-size:10px;letter-spacing:3px;color:#2563EB;margin-bottom:16px;font-weight:700}
  h1{font-size:clamp(40px,6vw,72px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:12px}
  .sub{font-size:15px;color:#6B7280;max-width:520px;line-height:1.6;margin-bottom:24px}
  .meta{display:flex;gap:0;margin-bottom:36px;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;max-width:700px}
  .mi{padding:14px 20px;border-right:1px solid #E5E7EB;flex:1;background:#fff}
  .mi:last-child{border-right:none}
  .mi span{display:block;font-size:9px;letter-spacing:1.5px;color:#9CA3AF;margin-bottom:4px;font-weight:700}
  .mi strong{font-size:13px;font-weight:700;color:#111827}
  .mi strong.blue{color:#2563EB}
  .actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:56px}
  .preview{padding:0 40px 60px}
  .slabel{font-size:9px;letter-spacing:3px;color:#6B7280;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #E5E7EB;font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:2px}
  .spec{padding:60px 40px;border-top:1px solid #E5E7EB;max-width:980px}
  .spec-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:24px}
  @media(max-width:768px){.spec-grid{grid-template-columns:1fr}}
  .spec-card{background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:20px}
  .spec-card h3{font-size:9px;letter-spacing:2px;color:#2563EB;margin-bottom:12px;font-weight:700}
  .spec-card p,.spec-card li{font-size:12px;color:#6B7280;line-height:1.7}
  .spec-card ul{padding-left:14px}
  .tokens-block{background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:24px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.8;color:#374151;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:16px;right:16px;background:#2563EB;border:none;color:#fff;font-family:inherit;font-size:9px;letter-spacing:2px;padding:6px 14px;border-radius:4px;cursor:pointer;font-weight:700}
  .rcard{background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:20px}
  .rcard h3{font-size:9px;letter-spacing:2px;color:#2563EB;margin-bottom:10px;font-weight:700}
  .rcard p{font-size:12px;color:#6B7280;line-height:1.7}
  footer{padding:24px 40px;border-top:1px solid #E5E7EB;font-size:10px;letter-spacing:1px;color:#9CA3AF;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  footer a{color:inherit}
  .toast{position:fixed;bottom:24px;right:24px;background:#111827;color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast"></div>
<nav>
  <span class="logo">RAM DESIGN STUDIO</span>
  <div class="nav-r">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
  </div>
</nav>

<section class="hero">
  <div class="tag">FORM DESIGN SYSTEM · MARCH 17, 2026</div>
  <h1>Contact<br>Form</h1>
  <p class="sub">Every pixel specified. Field height 44px. Border 2px. Corner radius 8px. All states: default, focus, error, success, disabled.</p>
  <div class="meta">
    <div class="mi"><span>SCREENS</span><strong>5 (3 DESKTOP + 2 MOBILE)</strong></div>
    <div class="mi"><span>INCLUDES</span><strong class="blue">ALL FIELD STATES</strong></div>
    <div class="mi"><span>FIELDS</span><strong>Text · Select · Textarea · File · Checkbox</strong></div>
    <div class="mi"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Pen Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="slabel">SCREENS</div>
  <div class="thumbs" id="thumbs-container"></div>
</section>

<section class="spec">
  <div class="slabel">DESIGN SPEC</div>
  <div class="spec-grid">
    <div class="spec-card">
      <h3>FIELD METRICS</h3>
      <ul>
        <li>Height: <strong>44px</strong></li>
        <li>Border: <strong>2px solid</strong></li>
        <li>Corner radius: <strong>8px</strong></li>
        <li>Horizontal padding: <strong>14px</strong></li>
        <li>Label gap: <strong>7px above field</strong></li>
        <li>Helper gap: <strong>5px below field</strong></li>
        <li>Label size: <strong>13px / 600</strong></li>
        <li>Input size: <strong>14px / 400</strong></li>
        <li>Helper size: <strong>11px / 400</strong></li>
      </ul>
    </div>
    <div class="spec-card">
      <h3>STATE COLORS</h3>
      <ul>
        <li>Default border: <strong>#D1D5DB</strong></li>
        <li>Focus border: <strong>#2563EB</strong></li>
        <li>Focus ring: <strong>#EFF6FF</strong></li>
        <li>Error border: <strong>#EF4444</strong></li>
        <li>Error tint: <strong>#FFF1F2</strong></li>
        <li>Error text: <strong>#B91C1C</strong></li>
        <li>Success border: <strong>#10B981</strong></li>
        <li>Success tint: <strong>#F0FDF4</strong></li>
        <li>Placeholder: <strong>#9CA3AF</strong></li>
      </ul>
    </div>
    <div class="spec-card">
      <h3>FIELD TYPES SHOWN</h3>
      <ul>
        <li><strong>Text input</strong> — name, email, phone</li>
        <li><strong>Dropdown / Select</strong> — subject</li>
        <li><strong>Textarea</strong> — message, with char count</li>
        <li><strong>File upload</strong> — drag-and-drop zone</li>
        <li><strong>Checkbox</strong> — checked + unchecked</li>
        <li><strong>Submit button</strong> — default, loading, sent, disabled</li>
        <li><strong>Error banner</strong> — form-level validation</li>
        <li><strong>Success state</strong> — full confirmation screen</li>
      </ul>
    </div>
  </div>

  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="css-tokens">/* Customer Contact Form — Design Tokens */
:root {
  /* Page */
  --form-page-bg:       #F3F4F6;
  --form-card-bg:       #FFFFFF;

  /* Typography */
  --form-text-primary:  #111827;
  --form-text-label:    #374151;
  --form-text-muted:    #6B7280;
  --form-text-placeholder: #9CA3AF;
  --form-text-error:    #B91C1C;
  --form-text-success:  #065F46;

  /* Field structure */
  --form-field-height:  44px;
  --form-border-width:  2px;
  --form-border-radius: 8px;
  --form-padding-x:     14px;
  --form-label-gap:     7px;
  --form-helper-gap:    5px;
  --form-field-gap:     20px;

  /* Font sizes */
  --form-font-label:    13px;
  --form-font-input:    14px;
  --form-font-helper:   11px;

  /* Borders by state */
  --form-border-default:  #D1D5DB;
  --form-border-focus:    #2563EB;
  --form-border-error:    #EF4444;
  --form-border-success:  #10B981;
  --form-border-disabled: #E5E7EB;

  /* Backgrounds by state */
  --form-bg-default:    #FFFFFF;
  --form-bg-focus:      #FFFFFF;
  --form-bg-error:      #FFF1F2;
  --form-bg-success:    #F0FDF4;
  --form-bg-disabled:   #F9FAFB;

  /* Focus ring */
  --form-ring-color:    #EFF6FF;
  --form-ring-offset:   4px;

  /* Submit button */
  --form-btn-bg:        #2563EB;
  --form-btn-bg-hover:  #1D4ED8;
  --form-btn-height:    48px;
  --form-btn-radius:    8px;
  --form-btn-font:      15px;
  --form-btn-weight:    600;
}</pre>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px">
    <div class="rcard">
      <h3>ACCESSIBILITY DECISIONS</h3>
      <p>Labels sit above fields (never inside as placeholders) so they remain visible while typing. Required fields marked with * and "Required" label. Error messages include both color and icon for non-color-dependent perception. Focus ring is 4px wide and uses #EFF6FF — visible against white without being distracting.</p>
    </div>
    <div class="rcard">
      <h3>44PX FIELD HEIGHT</h3>
      <p>44px is Apple's HIG minimum touch target size. At 14px font with 2px border, the inner field height is 40px — giving exactly 12px vertical padding top and bottom. This matches Material Design's outlined text field compact height and Figma's standard component library. The same height works for both desktop click targets and mobile touch targets.</p>
    </div>
  </div>
</section>

<footer>
  <span>RAM DESIGN STUDIO · FORM DESIGN SYSTEM · MARCH 17, 2026</span>
  <a href="https://ram.zenbin.org/gallery">ram.zenbin.org/gallery</a>
</footer>

<script>
const D="${penB64}";
const PROMPT="Design a precise customer contact form with all field states. Fields: Full Name, Email, Phone (optional), Company (optional), Subject dropdown, Message textarea (with char count), File upload, Privacy checkbox, Submit button. States: default (gray #D1D5DB border), focus (blue #2563EB border + #EFF6FF focus ring), error (red #EF4444 border + error icon + red helper text), success (green #10B981 border + checkmark), disabled. Field height 44px, border 2px, radius 8px. Also show: error state of full form with banner, mobile form, mobile success/confirmation screen.";
const CSS_TOKENS=document.getElementById('css-tokens').textContent;

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}
function openInViewer(){
  try{
    const j=atob(D);JSON.parse(j);
    localStorage.setItem('pv_pending',JSON.stringify({json:j,name:'contact-form.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){alert('Error: '+e.message);}
}
function downloadPen(){
  const blob=new Blob([atob(D)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='contact-form.pen';a.click();URL.revokeObjectURL(a.href);
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT).then(()=>toast('Prompt copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=PROMPT;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Prompt copied ✓');
  });
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('CSS tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=CSS_TOKENS;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('CSS tokens copied ✓');
  });
}
function shareOnX(){
  const text=encodeURIComponent('Precise contact form design system — all field states (default, focus, error, success, disabled), 44px fields, 2px borders, validation flows. 5 screens + CSS tokens. By RAM Design Studio');
  const url=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');
}

(function(){
  try{
    const doc=JSON.parse(atob(D));
    const screens=doc.children||[];
    const container=document.getElementById('thumbs-container');
    const THUMB_H=180;
    const labels=['D · Full Form','D · Field States','D · Validation Errors','M · Form','M · Success'];
    screens.forEach((s,i)=>{
      const tw=Math.round(THUMB_H*(s.width/s.height));
      const svg=renderScreen(s,tw,THUMB_H);
      const div=document.createElement('div');
      div.style.cssText='text-align:center;flex-shrink:0';
      div.innerHTML=svg+\`<div style="font-size:9px;color:#9CA3AF;margin-top:8px;letter-spacing:1px;font-weight:700;max-width:\${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${(labels[i]||'SCREEN '+(i+1)).toUpperCase()}</div>\`;
      container.appendChild(div);
    });
  }catch(e){console.error('Thumb error:',e);}
})();

function renderEl(el,depth){
  if(!el||depth>5)return'';
  const x=el.x||0,y=el.y||0,w=Math.max(0,el.width||0),h=Math.max(0,el.height||0);
  const fill=el.fill||'none';
  const oAttr=(el.opacity!==undefined&&el.opacity<0.99)?\` opacity="\${el.opacity.toFixed(2)}"\`:'';
  const rAttr=el.cornerRadius?\` rx="\${Math.min(el.cornerRadius,w/2,h/2)}"\`:'';
  if(el.type==='frame'){
    const bg=\`<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" fill="\${fill}"\${rAttr}\${oAttr}/>\`;
    const kids=(el.children||[]).map(c=>renderEl(c,depth+1)).join('');
    if(!kids)return bg;
    return \`\${bg}<g transform="translate(\${x},\${y})">\${kids}</g>\`;
  }
  if(el.type==='ellipse')return\`<ellipse cx="\${x+w/2}" cy="\${y+h/2}" rx="\${w/2}" ry="\${h/2}" fill="\${fill}"\${oAttr}/>\`;
  if(el.type==='text'){
    const fh=Math.max(1,Math.min(h,(el.fontSize||13)*0.72));
    return\`<rect x="\${x}" y="\${y+(h-fh)/2}" width="\${w}" height="\${fh}" fill="\${fill}"\${oAttr} rx="1"/>\`;
  }
  return'';
}
function renderScreen(screen,tw,th){
  const sw=screen.width,sh=screen.height;
  const kids=(screen.children||[]).map(c=>renderEl(c,0)).join('');
  return\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${sw} \${sh}" width="\${tw}" height="\${th}" style="display:block;flex-shrink:0;border-radius:6px;border:1px solid #E5E7EB"><rect width="\${sw}" height="\${sh}" fill="\${screen.fill||'#F3F4F6'}"/>\${kids}</svg>\`;
}
</script>
</body>
</html>`;

// ── Publish ────────────────────────────────────────────────────────────────────
const slugs = ['contact-form-ds','contact-form-v1','form-design-01','contact-ui-ds'];

function publishPage(slug, htmlContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title: 'Contact Form — Precise Form Design System', html: htmlContent });
    const req = https.request({
      hostname:'zenbin.org', port:443, path:`/v1/pages/${slug}`,
      method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,slug})); });
    req.on('error',reject);
    req.write(body); req.end();
  });
}

(async () => {
  for (const slug of slugs) {
    const r = await publishPage(slug, html);
    if (r.status===200||r.status===201) {
      console.log(`✓ Published: https://zenbin.org/p/${r.slug}`);
      process.exit(0);
    }
    console.log(`  ${slug} → ${r.status}`);
  }
  console.error('All slugs taken');
})();
