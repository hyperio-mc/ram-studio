// THREAD — Dark PKM / knowledge graph tool
// "every thought, connected"
// Inspired by Reflect (Godly), Midday dark surfaces
// Near-black bg, violet accent, mint connections

const fs = require('fs');

const W = 390, H = 844;
let idCtr = 1;
const id = () => `f${idCtr++}`;

const p = {
  bg:       '#0C0B0F',
  surface:  '#16141C',
  surfaceB: '#1E1C27',
  border:   '#2A2635',
  text:     '#EBE8F5',
  textMid:  '#8B87A8',
  accent:   '#8B6FE8',
  mint:     '#52B88A',
  rose:     '#E87070',
  gold:     '#D4A853',
};

function rect(x,y,w,h,fill,extra={}) {
  return {id:id(),type:'RECTANGLE',x,y,width:w,height:h,fill,...extra};
}
function text(x,y,w,h,content,fontSize,fill,extra={}) {
  return {id:id(),type:'TEXT',x,y,width:w,height:h,content,fontSize,fill,
    fontWeight:extra.fontWeight||400,fontFamily:extra.fontFamily||'Inter',
    textAlign:extra.textAlign||'left',...extra};
}
function frame(x,y,w,h,fill,children,extra={}) {
  return {id:id(),type:'FRAME',x,y,width:w,height:h,fill,children,clip:true,...extra};
}
function card(x,y,w,h,children,fill=p.surface,radius=10) {
  return frame(x,y,w,h,fill,children,{cornerRadius:radius});
}

function navBar(active) {
  const items = [
    {label:'Today',icon:'◎'},{label:'Graph',icon:'⬡'},
    {label:'Notes',icon:'▤'},{label:'Capture',icon:'✦'},{label:'Search',icon:'⊕'}
  ];
  const navH=72;
  return [
    rect(0,H-navH,W,navH,p.surface),
    rect(0,H-navH,W,1,p.border),
    ...items.flatMap((item,i)=>{
      const ix=i*(W/5),col=i===active?p.accent:p.textMid;
      return [
        text(ix,H-navH+12,W/5,18,item.icon,16,col,{textAlign:'center'}),
        text(ix,H-navH+32,W/5,12,item.label,8,col,{textAlign:'center'}),
      ];
    }),
    rect(active*(W/5)+(W/10)-12,H-navH+5,24,3,p.accent,{cornerRadius:2}),
  ];
}

function statusBar(title,sub) {
  return [
    rect(0,0,W,60,p.bg),
    text(20,16,260,18,title,16,p.text,{fontWeight:600}),
    sub?text(20,36,260,14,sub,10,p.textMid):null,
  ].filter(Boolean);
}

function threadCard(x,y,w,title,excerpt,tags,color=p.accent) {
  return card(x,y,w,72,[
    rect(0,0,3,72,color,{cornerRadius:0}),
    text(10,8,w-20,14,title,12,p.text,{fontWeight:600}),
    text(10,26,w-20,22,excerpt,9,p.textMid),
    ...tags.flatMap((t,i)=>[
      rect(10+i*60,54,52,12,p.border,{cornerRadius:6}),
      text(10+i*60,54,52,12,t,8,p.textMid,{textAlign:'center'}),
    ]),
  ]);
}

// ── SCREEN 1: Today ──────────────────────────────────────────────────────────
function screenToday() {
  return {id:id(),type:'FRAME',name:'Today',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children:[
    rect(0,0,W,H,p.bg),
    // Header
    text(20,16,260,12,'TUE · 24 MARCH 2026',9,p.textMid,{fontWeight:600}),
    text(20,32,240,24,"Today's Note",20,p.text,{fontWeight:700}),
    rect(W-90,16,70,40,p.surface,{cornerRadius:8}),
    text(W-90,22,70,12,'247 words',9,p.accent,{textAlign:'center'}),
    text(W-90,36,70,12,'18 links',9,p.textMid,{textAlign:'center'}),
    rect(20,66,W-40,1,p.border),
    // Note body
    text(20,80,W-40,22,'# Morning thoughts',18,p.text,{fontWeight:700}),
    text(20,108,W-40,56,'The problem with most PKM systems is they optimize for input, not retrieval. Every thought dumped in, but never surfaced when needed.',12,p.text),
    text(20,170,W-40,14,'→ Linked: [[Spaced repetition]], [[Information overload]]',10,p.accent),
    rect(20,194,W-40,1,p.border),
    text(20,206,W-40,18,'## Work',14,p.text,{fontWeight:600}),
    text(20,228,W-40,14,'☑  Finish THREAD design sprint',11,p.textMid),
    text(20,246,W-40,14,'☐  Review [[API latency notes]]',11,p.text),
    text(20,264,W-40,14,'☐  Write [[Weekly review]] template',11,p.text),
    rect(20,286,W-40,1,p.border),
    text(20,298,W-40,18,'## Reading',14,p.text,{fontWeight:600}),
    text(20,320,W-40,56,'Finished "How Minds Change" — key insight: identity-based beliefs resist evidence. Linked to [[Confirmation bias]] and [[Epistemic humility]].',11,p.text),
    // Backlinks
    text(20,386,200,12,'BACKLINKS  ·  4',9,p.textMid,{fontWeight:600}),
    rect(20,400,W-40,1,p.border),
    threadCard(20,410,W-40,'Information overload','See also: Inbox zero philosophy...',['#pkm','#focus'],p.accent),
    threadCard(20,490,W-40,'Spaced repetition','Anki vs natural linking approaches',['#memory','#learn'],p.mint),
    // Glow
    rect(W/2-80,-20,160,60,p.accent+'18',{cornerRadius:80}),
    ...navBar(0),
  ]};
}

// ── SCREEN 2: Graph ──────────────────────────────────────────────────────────
function screenGraph() {
  const nodes = [
    {cx:195,cy:190,r:14,fill:p.accent,label:'Design\nSystems'},
    {cx:138,cy:138,r:10,fill:p.mint,  label:'Typography'},
    {cx:258,cy:142,r:10,fill:p.mint,  label:'Components'},
    {cx:108,cy:216,r:8, fill:p.surfaceB,label:'Grid'},
    {cx:272,cy:234,r:8, fill:p.surfaceB,label:'Tokens'},
    {cx:195,cy:316,r:12,fill:p.gold,  label:'PKM'},
    {cx:126,cy:364,r:8, fill:p.surfaceB,label:'Zettelkasten'},
    {cx:262,cy:364,r:8, fill:p.surfaceB,label:'Sp. Repeat'},
    {cx:195,cy:258,r:8, fill:p.rose,  label:'Cognition'},
    {cx:96, cy:286,r:7, fill:p.border,label:'Memory'},
    {cx:292,cy:286,r:7, fill:p.border,label:'Attention'},
  ];

  const nodeEls = nodes.flatMap(n=>[
    rect(n.cx-n.r,n.cy+60-n.r,n.r*2,n.r*2,n.fill,{cornerRadius:n.r}),
    n.label?text(n.cx-36,n.cy+60+n.r+3,72,12,n.label,7,p.textMid,{textAlign:'center'}):null,
  ].filter(Boolean));

  // Horizontal connector lines (approximate edges)
  const connectors = [
    rect(138,198,57,1,p.border),  // Design→Typography
    rect(195,165,63,1,p.border),  // Design→Components
    rect(108,230,87,1,p.border),  // Design→Grid
    rect(195,252,77,1,p.border),  // Design→Tokens
    rect(195,258,1,58,p.border),  // Design→Cognition
    rect(96,298,99,1,p.border),   // Cognition→Memory
    rect(195,298,97,1,p.border),  // Cognition→Attention
    rect(126,330,69,1,p.border),  // PKM→Zettelkasten
    rect(195,330,67,1,p.border),  // PKM→Sp.Repeat
  ];

  return {id:id(),type:'FRAME',name:'Graph',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children:[
    rect(0,0,W,H,p.bg),
    ...statusBar('Graph','247 notes · 1,840 links'),
    // Glows
    rect(145,190,100,100,p.accent+'14',{cornerRadius:50}),
    rect(155,286,80,80,p.gold+'12',{cornerRadius:40}),
    // Edges
    ...connectors,
    // Nodes
    ...nodeEls,
    // Legend
    rect(0,H-132,W,60,p.surface),
    rect(0,H-133,W,1,p.border),
    text(20,H-122,70,12,'◉ Topic',9,p.accent,{fontWeight:600}),
    text(90,H-122,80,12,'◉ Concept',9,p.mint,{fontWeight:600}),
    text(168,H-122,70,12,'◉ Bridge',9,p.rose,{fontWeight:600}),
    text(W-80,H-122,60,12,'247 nodes',9,p.textMid,{textAlign:'right'}),
    text(20,H-108,W-40,12,'Cluster: Design + PKM · 11 nodes shown',9,p.textMid),
    ...navBar(1),
  ]};
}

// ── SCREEN 3: Note Detail ────────────────────────────────────────────────────
function screenNote() {
  return {id:id(),type:'FRAME',name:'Note',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children:[
    rect(0,0,W,H,p.bg),
    rect(0,0,W,50,p.bg),
    text(16,16,60,18,'← Back',11,p.textMid),
    text(W-80,16,60,18,'⋯ Edit',11,p.accent,{textAlign:'right'}),
    text(20,58,W-40,28,'Information Overload',22,p.text,{fontWeight:700}),
    text(20,90,W-40,14,'14 Mar 2026 · 3 backlinks · 2 outgoing',10,p.textMid),
    rect(W-24,62,8,8,p.accent,{cornerRadius:4}),
    rect(20,112,W-40,1,p.border),
    text(20,124,W-40,52,'The Paradox of Choice argues that more options lead to worse decisions. But this applies equally to information consumption: more reading does not equal more clarity.',11,p.text),
    text(20,182,W-40,14,'More reading ≠ more clarity',12,p.gold,{fontWeight:600}),
    text(20,202,W-40,52,"The brain doesn't distinguish relevant from irrelevant input until AFTER processing. Every notification consumes working memory before being classified as noise.",11,p.text),
    text(20,264,W-40,12,'→ [[Attention residue]] — Cal Newport',10,p.accent),
    text(20,280,W-40,12,'→ [[Deep Work]] — active vs passive reading',10,p.accent),
    text(20,296,W-40,12,'→ [[Zettelkasten]] — atomic note principle',10,p.mint),
    rect(20,316,W-40,1,p.border),
    text(20,326,160,14,'HIGHLIGHTS · 2',9,p.textMid,{fontWeight:600}),
    card(20,342,W-40,48,[
      rect(0,0,3,48,p.gold,{cornerRadius:0}),
      text(10,8,W-60,32,'"The cure for information overload is not more filtering — it is better questions."',10,p.text),
    ]),
    card(20,398,W-40,48,[
      rect(0,0,3,48,p.accent,{cornerRadius:0}),
      text(10,8,W-60,32,'"Every open tab is a cognitive debt you will eventually pay."',10,p.text),
    ]),
    rect(20,454,W-40,1,p.border),
    text(20,464,160,14,'MENTIONED IN · 3',9,p.textMid,{fontWeight:600}),
    threadCard(20,482,W-40,"Today's Note · 24 Mar",'Morning thoughts on PKM and retrieval',['today'],p.accent),
    threadCard(20,562,W-40,'Deep Work reading notes','Newport on attention residue',['#reading'],p.mint),
    ...navBar(2),
  ]};
}

// ── SCREEN 4: Capture ────────────────────────────────────────────────────────
function screenCapture() {
  const suggestions = ['Information overload','Deep Work (Newport)','Attention economics','PKM systems'];
  return {id:id(),type:'FRAME',name:'Capture',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children:[
    rect(0,0,W,H,p.bg),
    ...statusBar('Quick Capture','Escape to dismiss'),
    rect(20,72,W-40,120,p.surface,{cornerRadius:12}),
    rect(20,72,W-40,2,p.accent,{cornerRadius:2}),
    text(30,88,W-60,56,'The way we consume information determines what we think about. Design apps to match reading intent, not dopamine loops.',11,p.text),
    rect(30,152,2,14,p.accent),
    text(W-60,80,40,14,'38 w',9,p.textMid,{textAlign:'right'}),
    text(20,204,W-40,14,'✦ AI SUGGESTED LINKS',9,p.accent,{fontWeight:600}),
    ...suggestions.flatMap((sug,i)=>{
      const yy=222+i*40;
      return [
        rect(20,yy,W-40,32,p.surface,{cornerRadius:8}),
        text(34,yy+8,W-76,16,'⬡  '+sug,11,p.text),
        text(W-56,yy+8,32,16,'+ Link',9,p.accent,{textAlign:'right'}),
      ];
    }),
    text(20,382,80,14,'TAGS',9,p.textMid,{fontWeight:600}),
    ...['#pkm','#reading','#design'].flatMap((tag,i)=>{
      const tx=20+i*76;
      return [
        rect(tx,398,68,24,p.border,{cornerRadius:12}),
        text(tx,398,68,24,tag,9,p.accent,{textAlign:'center',fontWeight:500}),
      ];
    }),
    text(20,432,W-40,14,'ADD TO',9,p.textMid,{fontWeight:600}),
    rect(20,448,W-40,36,p.surface,{cornerRadius:8}),
    text(34,456,W-72,20,"Today's Note · 24 March 2026",11,p.text),
    text(W-56,456,32,20,'↓',13,p.accent,{textAlign:'right'}),
    rect(20,504,W-40,48,p.accent,{cornerRadius:10}),
    text(20,516,W-40,24,'Save to Thread',13,p.text,{fontWeight:600,textAlign:'center'}),
    rect(W/2-70,490,140,30,p.accent+'20',{cornerRadius:40}),
    ...navBar(3),
  ]};
}

// ── SCREEN 5: Search ─────────────────────────────────────────────────────────
function screenSearch() {
  const recent=[
    {title:'Information overload',count:'3 links',color:p.accent},
    {title:'Deep Work',count:'7 links',color:p.gold},
    {title:'Spaced repetition',count:'5 links',color:p.mint},
    {title:'Design systems',count:'12 links',color:p.accent},
    {title:'Attention residue',count:'2 links',color:p.rose},
  ];
  return {id:id(),type:'FRAME',name:'Search',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children:[
    rect(0,0,W,H,p.bg),
    rect(20,16,W-40,44,p.surface,{cornerRadius:12}),
    text(38,28,W-80,20,'⊕  Search your threads…',13,p.textMid),
    text(W-56,28,32,20,'⌘K',11,p.border,{textAlign:'right'}),
    text(20,72,200,14,'RECENTLY VIEWED',9,p.textMid,{fontWeight:600}),
    ...recent.flatMap((item,i)=>{
      const yy=90+i*54;
      return [
        rect(20,yy,W-40,46,p.surface,{cornerRadius:8}),
        rect(20,yy,3,46,item.color),
        text(28,yy+8,W-96,14,item.title,12,p.text,{fontWeight:500}),
        text(28,yy+26,W-96,12,item.count,10,p.textMid),
        text(W-50,yy+12,26,22,'↗',14,item.color,{textAlign:'right'}),
      ];
    }),
    text(20,372,200,14,'CONCEPT CLUSTERS',9,p.textMid,{fontWeight:600}),
    ...['Design · 34 notes','PKM · 28 notes','Reading · 21 notes','Code · 19 notes'].flatMap((cl,i)=>{
      const color=[p.accent,p.gold,p.mint,p.rose][i];
      const cx=i%2===0?20:W/2+8;
      const cy=i<2?390:448;
      const cw=W/2-28;
      return [
        rect(cx,cy,cw,48,p.surface,{cornerRadius:8}),
        rect(cx,cy,3,48,color),
        text(cx+10,cy+8,cw-20,16,cl.split(' · ')[0],13,p.text,{fontWeight:600}),
        text(cx+10,cy+28,cw-20,12,cl.split(' · ')[1],10,p.textMid),
      ];
    }),
    rect(20,510,W-40,1,p.border),
    text(20,518,W-40,30,'247 notes · 1,840 links · 94 highlights · 18 tags',10,p.textMid,{textAlign:'center'}),
    ...navBar(4),
  ]};
}

const pen={
  version:'2.8',
  name:'THREAD — Knowledge Graph PKM',
  width:W*5+80,height:H,fill:'#0A0912',
  children:[
    screenToday(),
    {...screenGraph(),   x:W+20},
    {...screenNote(),    x:(W+20)*2},
    {...screenCapture(), x:(W+20)*3},
    {...screenSearch(),  x:(W+20)*4},
  ],
};

fs.writeFileSync('thread.pen',JSON.stringify(pen,null,2));
console.log('✓ thread.pen written');
console.log(`  Screens: ${pen.children.length}`);
console.log(`  Size: ${Math.round(JSON.stringify(pen).length/1024)}KB`);
