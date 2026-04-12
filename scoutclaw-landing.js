#!/usr/bin/env node
/**
 * ScoutClaw Landing Page — .pen file generator
 * Scout OS design system: dark, vibrant accents, bold type
 */

const fs = require('fs');

// ─── Scout Design Tokens ───────────────────────────────────────────────────────
const BG       = '#0e0e14';
const BG2      = '#13131f';
const BG3      = '#1a1a2e';
const BLUE     = '#85A0FF';
const GREEN    = '#85FFD3';
const PURPLE   = '#9B8FF5';
const BORDER   = 'rgba(255,255,255,0.07)';
const TEXT     = '#ffffff';
const SUBTLE   = 'rgba(255,255,255,0.55)';
const MUTED    = 'rgba(255,255,255,0.25)';

const W = 1440;

function uid(p='el') { return `${p}_${Math.random().toString(36).slice(2,9)}`; }

// ─── Primitives ────────────────────────────────────────────────────────────────

function t(content, opts={}) {
  return {
    id:uid('t'), type:'text',
    x:opts.x||0, y:opts.y||0,
    width:opts.w, height:opts.h||30,
    content,
    fontFamily:'Inter',
    fontSize:opts.size||16,
    fontWeight:opts.weight||'400',
    fill:opts.color||TEXT,
    textAlign:opts.align||'left',
    textGrowth: opts.w ? 'fixed-width' : 'auto',
  };
}

function r(opts={}) {
  return {
    id:uid('r'), type:'rectangle',
    x:opts.x||0, y:opts.y||0,
    width:opts.w||100, height:opts.h||40,
    fill:opts.fill||BG,
    cornerRadius:opts.r||0,
    stroke:opts.stroke,
  };
}

function fr(opts={}) {
  return {
    id:opts.id||uid('fr'), type:'frame',
    x:opts.x||0, y:opts.y||0,
    width:opts.w||200, height:opts.h||100,
    fill:opts.fill||'transparent',
    cornerRadius:opts.r||0,
    layout:opts.layout||'none',
    gap:opts.gap||0,
    padding:opts.pad||0,
    justifyContent:opts.jc||'start',
    alignItems:opts.ai||'start',
    children:opts.children||[],
    clip:opts.clip!==undefined?opts.clip:false,
    stroke:opts.stroke,
  };
}

function btn(label, opts={}) {
  return fr({
    x:opts.x, y:opts.y, w:opts.w||180, h:opts.h||52,
    fill:opts.fill||BLUE, r:opts.r||10,
    layout:'horizontal', jc:'center', ai:'center',
    children:[t(label,{size:opts.size||15,weight:'600',color:opts.color||'#0e0e14'})],
  });
}

function ghostBtn(label, opts={}) {
  return fr({
    x:opts.x, y:opts.y, w:opts.w||180, h:opts.h||52,
    fill:'rgba(255,255,255,0.05)', r:opts.r||10,
    layout:'horizontal', jc:'center', ai:'center',
    stroke:{thickness:1, fill:'rgba(255,255,255,0.12)'},
    children:[t(label,{size:opts.size||15,weight:'600',color:TEXT})],
  });
}

function tag(label, opts={}) {
  return fr({
    x:opts.x, y:opts.y, w:opts.w||120, h:32,
    fill:opts.fill||'rgba(133,160,255,0.1)', r:999,
    layout:'horizontal', jc:'center', ai:'center',
    stroke:{thickness:1, fill:opts.border||'rgba(133,160,255,0.25)'},
    children:[t(label,{size:12,weight:'600',color:opts.color||BLUE})],
  });
}

function card(opts={}) {
  return fr({
    x:opts.x, y:opts.y, w:opts.w||400, h:opts.h||200,
    fill:opts.fill||BG2, r:opts.r||16,
    stroke:{thickness:1, fill:BORDER},
    layout:opts.layout, gap:opts.gap, pad:opts.pad,
    jc:opts.jc, ai:opts.ai,
    children:opts.children||[],
  });
}

function glow(x, y, w, h, color, opacity=0.12) {
  return { ...r({x,y,w,h,r:Math.min(w,h)/2,fill:color}),
    fill:{type:'color',color,opacity} };
}

// ─── NAV ──────────────────────────────────────────────────────────────────────

function nav(y=0) {
  return fr({
    x:0, y, w:W, h:72,
    fill:'rgba(14,14,20,0.85)', layout:'horizontal', ai:'center',
    jc:'space_between', pad:[0,80],
    children:[
      // Logo
      fr({w:180,h:40,layout:'horizontal',ai:'center',gap:10,children:[
        r({w:28,h:28,fill:BLUE,r:8}),
        t('ScoutClaw',{size:18,weight:'700',color:TEXT}),
        fr({w:48,h:20,fill:'rgba(133,255,211,0.15)',r:999,layout:'horizontal',jc:'center',ai:'center',
          stroke:{thickness:1,fill:'rgba(133,255,211,0.3)'},
          children:[t('BETA',{size:10,weight:'700',color:GREEN})]}),
      ]}),
      // Nav links
      fr({w:400,h:40,layout:'horizontal',ai:'center',jc:'center',gap:40,children:[
        t('Features',{size:14,weight:'500',color:SUBTLE}),
        t('Pricing',{size:14,weight:'500',color:SUBTLE}),
        t('Academy',{size:14,weight:'500',color:SUBTLE}),
        t('Docs',{size:14,weight:'500',color:SUBTLE}),
      ]}),
      // CTA
      btn('Register Early →',{w:160,h:40,r:8,size:13,fill:BLUE,color:'#0e0e14'}),
    ],
  });
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function hero(y=0) {
  const cy = y + 60;
  return [
    // background glows
    glow(W/2-400, y-100, 800, 800, BLUE, 0.06),
    glow(W/2+200, y+200, 600, 600, PURPLE, 0.05),
    glow(100, y+300, 400, 400, GREEN, 0.04),

    // Eyebrow tag
    fr({x:W/2-110, y:cy, w:220, h:34,
      fill:'rgba(133,255,211,0.08)', r:999,
      layout:'horizontal', jc:'center', ai:'center',
      stroke:{thickness:1,fill:'rgba(133,255,211,0.2)'},
      children:[
        r({w:6,h:6,fill:GREEN,r:3}),
        t('  Launching April 11, 2026 — Register Now',{size:12,weight:'600',color:GREEN}),
      ]}),

    // Main headline
    t('Your Personal AI Agent.', {x:W/2-520, y:cy+60, w:1040, size:82, weight:'800', color:TEXT, align:'center'}),
    t('Secure. Private. Ready.', {x:W/2-520, y:cy+158, w:1040, size:82, weight:'800', color:BLUE, align:'center'}),

    // Sub
    t('ScoutClaw is a secure sandbox for your personal AI agent — no technical setup, no risk,\nno sharing your data with a startup you don\'t know. Just results.', {
      x:W/2-380, y:cy+272, w:760, size:20, weight:'400', color:SUBTLE, align:'center',
    }),

    // Email input + CTA row
    fr({x:W/2-320, y:cy+360, w:640, h:60,
      fill:BG3, r:12,
      layout:'horizontal', ai:'center', pad:[0,8],
      stroke:{thickness:1,fill:'rgba(133,160,255,0.25)'},
      children:[
        fr({w:380,h:44,layout:'horizontal',ai:'center',pad:[0,16],children:[
          t('Enter your email address',{size:15,color:'rgba(255,255,255,0.3)'}),
        ]}),
        btn('Lock In My Spot →',{w:210,h:44,r:8,size:14,fill:BLUE}),
      ]}),

    // Social proof micro
    fr({x:W/2-260, y:cy+448, w:520, h:30,
      layout:'horizontal', jc:'center', ai:'center', gap:24,
      children:[
        t('✓  No credit card',{size:13,color:MUTED}),
        t('✓  Cancel anytime',{size:13,color:MUTED}),
        t('✓  Setup in minutes',{size:13,color:MUTED}),
      ]}),

    // Urgency counter bar
    fr({x:W/2-200, y:cy+500, w:400, h:40,
      fill:'rgba(255,255,255,0.03)', r:8,
      layout:'horizontal', jc:'center', ai:'center', gap:8,
      stroke:{thickness:1,fill:BORDER},
      children:[
        r({w:8,h:8,fill:'#ff6b6b',r:4}),
        t('247 founders registered in the last 24 hours',{size:13,weight:'500',color:SUBTLE}),
      ]}),
  ];
}

// ─── PROBLEM SECTION ──────────────────────────────────────────────────────────

function problem(y=0) {
  const problems = [
    { icon:'💸', title:'Paying $20k–$30k', sub:'for someone to set up an agent for you' },
    { icon:'🔐', title:'Security expertise required', sub:'most solutions expose your data' },
    { icon:'⚙️', title:'Too technical to self-serve', sub:'setup takes weeks, not minutes' },
    { icon:'🐢', title:'Enterprise moves too slow', sub:'your team waits months for approvals' },
  ];

  const problemCards = problems.map(({icon,title,sub}, i) =>
    card({x:120 + i*320, y:y+130, w:290, h:140, r:14, children:[
      t(icon,{x:20,y:20,size:28}),
      t(title,{x:20,y:70,size:16,weight:'700',color:TEXT}),
      t(sub,{x:20,y:98,size:13,color:SUBTLE,w:250}),
    ]})
  );

  return [
    t('The Problem.',{x:W/2-400,y:y+20,w:800,size:44,weight:'800',color:TEXT,align:'center'}),
    t('Personal AI agents are the future. But right now?',{x:W/2-400,y:y+76,w:800,size:20,color:SUBTLE,align:'center'}),
    ...problemCards,
  ];
}

// ─── SOLUTION / FEATURES ──────────────────────────────────────────────────────

function features(y=0) {
  const feats = [
    { icon:'🛡️', color:BLUE,   title:'Secure Sandbox', desc:'Your agent runs in an isolated environment. Your data never leaves your control.' },
    { icon:'⚡', color:GREEN,  title:'5-Minute Setup', desc:'Connect your first integration in minutes. No devs, no config files, no risk.' },
    { icon:'🔗', color:PURPLE, title:'5 Key Integrations', desc:'Mail, Calendar, Docs, Telegram, and one of your choice. Everything connected.' },
    { icon:'🤖', color:BLUE,   title:'Agent-Driven Support', desc:'Our AI agents handle onboarding, support, and sales. Always on, never tired.' },
    { icon:'📚', color:GREEN,  title:'Scout Academy', desc:'Free training and lessons to make your agent extraordinary. Learn at your pace.' },
    { icon:'🏢', color:PURPLE, title:'Enterprise-Ready', desc:'Built on the same platform powering enterprise teams. Personal tier, enterprise trust.' },
  ];

  const featCards = feats.map(({icon,color,title,desc}, i) => {
    const col = i % 3;
    const row = Math.floor(i/3);
    const cx = 120 + col*420;
    const cy = y + 140 + row*210;
    return card({x:cx,y:cy,w:390,h:185,r:16,children:[
      fr({x:20,y:20,w:48,h:48,fill:`rgba(${hexToRgbStr(color)},0.12)`,r:12,
        layout:'horizontal',jc:'center',ai:'center',
        children:[t(icon,{size:22})]}),
      t(title,{x:20,y:84,size:18,weight:'700',color:TEXT}),
      t(desc,{x:20,y:114,size:13,color:SUBTLE,w:350}),
    ]});
  });

  return [
    glow(W-200,y,400,400,PURPLE,0.05),
    tag('Why ScoutClaw',{x:W/2-70,y:y+20,w:140,fill:'rgba(155,143,245,0.1)',border:'rgba(155,143,245,0.3)',color:PURPLE}),
    t('Everything you need.\nNothing you don\'t.',{x:W/2-400,y:y+60,w:800,size:52,weight:'800',color:TEXT,align:'center'}),
    ...featCards,
  ];
}

function hexToRgbStr(hex) {
  hex = hex.replace('#','');
  const n = parseInt(hex,16);
  return `${(n>>16)&255},${(n>>8)&255},${n&255}`;
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

function howItWorks(y=0) {
  const steps = [
    { n:'01', color:BLUE,   title:'Register & Choose Plan', desc:'Lock in your spot before April 11. Choose personal ($100/mo) or annual ($500/yr). Get early access perks.' },
    { n:'02', color:GREEN,  title:'Connect Your Integrations', desc:'Link up to 5 integrations: Mail, Calendar, Docs, Telegram, and one custom channel of your choice.' },
    { n:'03', color:PURPLE, title:'Your Agent Goes to Work', desc:'From day one your agent reads, drafts, schedules, researches, and acts on your behalf — securely.' },
  ];

  const stepEls = steps.flatMap(({n,color,title,desc},i) => {
    const cx = 120 + i * 400;
    return [
      card({x:cx,y:y+130,w:370,h:260,r:16,children:[
        fr({x:20,y:20,w:52,h:52,fill:`rgba(${hexToRgbStr(color)},0.12)`,r:999,
          layout:'horizontal',jc:'center',ai:'center',
          children:[t(n,{size:20,weight:'800',color})]}),
        t(title,{x:20,y:90,size:20,weight:'700',color:TEXT}),
        t(desc,{x:20,y:126,size:14,color:SUBTLE,w:330}),
        // connector arrow
        ...(i<2?[t('→',{x:390,y:110,size:24,color:MUTED})]:[]),
      ]}),
    ];
  });

  return [
    glow(400,y,600,400,BLUE,0.04),
    tag('Simple by design',{x:W/2-70,y:y+20,w:140}),
    t('3 steps to your\npersonal agent.',{x:W/2-400,y:y+60,w:800,size:52,weight:'800',color:TEXT,align:'center'}),
    ...stepEls,
  ];
}

// ─── PRICING ──────────────────────────────────────────────────────────────────

function pricing(y=0) {
  const tiers = [
    {
      name:'Annual', price:'$500', per:'/year', color:BLUE, featured:false,
      save:'Save $700 vs monthly',
      features:['5 integrations','X token allocation','Personal tier (1 member)','Telegram + WhatsApp','Scout Academy access','Agent-driven support'],
    },
    {
      name:'Monthly', price:'$100', per:'/month', color:GREEN, featured:true,
      save:'Most flexible',
      features:['5 integrations','X token allocation','Personal tier (1 member)','Telegram + WhatsApp','Scout Academy access','Priority onboarding'],
    },
    {
      name:'White Glove', price:'$2,000', per:'one-time', color:PURPLE, featured:false,
      save:'Only 20 spots/week',
      features:['Everything in Annual','Human expert setup','1-on-1 strategy session','Custom integration config','30-day follow-up support','Direct founder access'],
    },
  ];

  const tierCards = tiers.map(({name,price,per,color,featured,save,features},i) => {
    const cx = 180 + i*370;
    const bg = featured ? BG3 : BG2;
    const bdr = featured ? {thickness:1.5,fill:color} : {thickness:1,fill:BORDER};
    const featureEls = features.map((f,fi) =>
      t(`✓  ${f}`,{x:24,y:200+fi*34,size:14,color:featured?TEXT:SUBTLE})
    );
    return card({x:cx,y:y+80,w:345,h:460,r:18,fill:bg,children:[
      ...(featured?[r({x:0,y:0,w:345,h:4,fill:color,r:999})]:[]),
      tag(name,{x:24,y:28,w:100,fill:`rgba(${hexToRgbStr(color)},0.1)`,border:`rgba(${hexToRgbStr(color)},0.3)`,color}),
      t(price,{x:24,y:74,size:52,weight:'800',color:TEXT}),
      t(per,{x:24+price.length*28,y:96,size:16,color:SUBTLE}),
      t(save,{x:24,y:138,size:13,weight:'500',color}),
      r({x:24,y:166,w:297,h:1,fill:BORDER}),
      ...featureEls,
      btn(featured?'Start Free Trial →':'Get Started →',{x:24,y:y+395,w:297,h:48,r:10,fill:featured?color:'rgba(255,255,255,0.07)',color:featured?'#0e0e14':TEXT}),
    ]});
  });

  return [
    tag('Pricing',{x:W/2-50,y:y+20,w:100}),
    t('Simple, transparent pricing.',{x:W/2-500,y:y+60,w:1000,size:52,weight:'800',color:TEXT,align:'center'}),
    t('No hidden fees. No sales calls. Just results.',{x:W/2-400,y:y+126,w:800,size:20,color:SUBTLE,align:'center'}),
    ...tierCards,
    t('Enterprise team plans from $18,000/year · Custom accounts from $300,000/year · Contact us →',{
      x:W/2-450,y:y+570,w:900,size:14,color:MUTED,align:'center',
    }),
  ];
}

// ─── ACADEMY SECTION ──────────────────────────────────────────────────────────

function academy(y=0) {
  return [
    glow(W/2-200,y,600,400,GREEN,0.05),
    fr({x:120,y:y+40,w:W-240,h:300,fill:BG2,r:24,
      stroke:{thickness:1,fill:'rgba(133,255,211,0.2)'},
      children:[
        glow(W-600,y-100,500,500,GREEN,0.07),
        tag('Free Access',{x:60,y:60,w:110,fill:'rgba(133,255,211,0.1)',border:'rgba(133,255,211,0.3)',color:GREEN}),
        t('Join the Scout Academy.',{x:60,y:104,size:44,weight:'800',color:TEXT}),
        t('Free training and lessons to make your agent extraordinary.',{x:60,y:162,size:18,color:SUBTLE,w:600}),
        t('📚  Beginner to advanced  ·  🎯  Use-case playbooks  ·  🤝  Community access',{x:60,y:204,size:15,color:MUTED}),
        btn('Join Academy — Free →',{x:60,y:242,w:220,h:48,r:10,fill:GREEN,color:'#0e0e14',size:14}),

        // Right graphic
        ...['Agent Setup Guide','Telegram Integration','Calendar Workflows','Email Automation','Advanced Prompting'].map((item,i) =>
          fr({x:W-500,y:y+80+i*46,w:310,h:38,fill:'rgba(255,255,255,0.03)',r:8,
            layout:'horizontal',ai:'center',gap:12,pad:[0,16],
            stroke:{thickness:1,fill:BORDER},
            children:[
              r({w:6,h:6,fill:i===0?GREEN:MUTED,r:3}),
              t(item,{size:13,color:i===0?TEXT:SUBTLE}),
            ]})
        ),
      ]}),
  ];
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────

function socialProof(y=0) {
  const quotes = [
    { q:'This is the PC moment for AI. ScoutClaw makes it accessible to everyone.', name:'Sarah K.', role:'CMO, Series B startup' },
    { q:'I was paying $25k to have someone set up my agent. This is a no-brainer.', name:'Marcus T.', role:'Independent CTO' },
    { q:'Finally — an AI agent that doesn\'t require a PhD to set up and trust.', name:'Priya M.', role:'VP Operations' },
  ];

  const quoteCards = quotes.map(({q,name,role},i) =>
    card({x:120+i*420,y:y+100,w:390,h:200,r:16,children:[
      t(`"${q}"`,{x:24,y:24,size:15,color:TEXT,w:342}),
      t(`— ${name}`,{x:24,y:148,size:14,weight:'600',color:BLUE}),
      t(role,{x:24,y:172,size:13,color:SUBTLE}),
    ]})
  );

  return [
    t('Early adopters are saying…',{x:W/2-400,y:y+20,w:800,size:36,weight:'700',color:TEXT,align:'center'}),
    ...quoteCards,
  ];
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function finalCta(y=0) {
  return [
    glow(W/2-300,y,600,500,BLUE,0.08),
    glow(W/2+100,y+100,400,400,GREEN,0.05),
    t('If we hit 500 signups in 5 days,',{x:W/2-500,y:y+60,w:1000,size:18,color:SUBTLE,align:'center',weight:'500'}),
    t('ScoutClaw ships April 11.',{x:W/2-500,y:y+94,w:1000,size:64,weight:'800',color:TEXT,align:'center'}),
    t('This is your PC moment.',{x:W/2-500,y:y+168,w:1000,size:64,weight:'800',color:BLUE,align:'center'}),
    t('When the PC launched, everyone asked "why would anyone want that?" — Hello, Apple.',{
      x:W/2-400,y:y+254,w:800,size:18,color:SUBTLE,align:'center',
    }),

    // Big CTA
    fr({x:W/2-260,y:y+320,w:520,h:66,
      fill:BLUE,r:14,layout:'horizontal',jc:'center',ai:'center',
      children:[t('Register for Early Access →',{size:18,weight:'700',color:'#0e0e14'})]}),

    t('Free to register · No commitment · Launching April 11, 2026',{
      x:W/2-300,y:y+406,w:600,size:13,color:MUTED,align:'center',
    }),
  ];
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function footer(y=0) {
  return [
    r({x:0,y:y+20,w:W,h:1,fill:BORDER}),
    fr({x:120,y:y+48,w:W-240,h:40,layout:'horizontal',jc:'space_between',ai:'center',children:[
      fr({w:300,h:40,layout:'horizontal',ai:'center',gap:12,children:[
        r({w:22,h:22,fill:BLUE,r:6}),
        t('ScoutClaw',{size:16,weight:'700',color:TEXT}),
        t('by Scout OS',{size:13,color:MUTED}),
      ]}),
      fr({w:400,h:40,layout:'horizontal',ai:'center',jc:'center',gap:32,children:[
        t('Privacy',{size:13,color:MUTED}),
        t('Terms',{size:13,color:MUTED}),
        t('Contact',{size:13,color:MUTED}),
        t('Docs',{size:13,color:MUTED}),
      ]}),
      t('© 2026 Scout OS · Built with agents 🤖',{size:13,color:MUTED}),
    ]}),
  ];
}

// ─── ASSEMBLE PAGE ────────────────────────────────────────────────────────────

const TOTAL_H = 4800;

const allChildren = [
  // Full page background
  r({x:0,y:0,w:W,h:TOTAL_H,fill:BG}),
  // Subtle top border
  r({x:0,y:0,w:W,h:2,fill:BLUE}),

  nav(0),
  ...hero(100),
  ...problem(720),
  ...features(1080),
  ...howItWorks(1680),
  ...pricing(2230),
  ...academy(2880),
  ...socialProof(3300),
  ...finalCta(3640),
  ...footer(4680),
];

const penDoc = {
  version: '2.8',
  themes: { mode: ['light', 'dark'] },
  variables: {
    'color.primary': { type:'color', value:BLUE },
    'color.accent': { type:'color', value:GREEN },
    'color.bg': { type:'color', value:BG },
    'color.text': { type:'color', value:TEXT },
  },
  children: [{
    id: uid('page'),
    type: 'frame',
    x: 0, y: 0,
    width: W,
    height: TOTAL_H,
    fill: BG,
    clip: true,
    children: allChildren,
  }],
};

const outFile = process.argv[2] || '/tmp/scoutclaw-landing.pen';
fs.writeFileSync(outFile, JSON.stringify(penDoc, null, 2));
console.log(`✅ ScoutClaw landing page: ${outFile}`);
console.log(`📐 ${W}x${TOTAL_H}px · ${(fs.statSync(outFile).size/1024).toFixed(1)} KB`);
