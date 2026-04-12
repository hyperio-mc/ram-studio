// recto-publish.js — Hero + Viewer for RECTO
'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG     = 'recto';
const APP_NAME = 'RECTO';
const TAGLINE  = 'Your reading life, beautifully tracked.';

function publish(slug, html, title, subdomain='ram'){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({title,html,overwrite:true});
    const req=https.request({
      hostname:'zenbin.org',
      path:`/v1/pages/${slug}`,
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Content-Length':Buffer.byteLength(body),
        'X-Subdomain':subdomain,
      },
    },res=>{
      let d='';
      res.on('data',c=>d+=c);
      res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    req.on('error',reject);
    req.write(body);
    req.end();
  });
}

// ─── HERO PAGE ─────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RECTO — Your reading life, beautifully tracked.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#09080C;
  --surf:rgba(255,255,255,0.07);
  --surf2:rgba(255,255,255,0.11);
  --border:rgba(255,255,255,0.08);
  --text:#F2EDE8;
  --text2:rgba(242,237,232,0.58);
  --text3:rgba(242,237,232,0.32);
  --amber:#C8A97E;
  --violet:#7C6DF0;
  --teal:#5EC4A8;
}
html{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;min-height:100vh}
body{max-width:1100px;margin:0 auto;padding:0 24px 80px}

/* ambient glows */
.glow-amber{position:fixed;top:-200px;left:-200px;width:700px;height:700px;background:radial-gradient(ellipse,rgba(200,169,126,0.08) 0%,transparent 70%);pointer-events:none;z-index:0}
.glow-violet{position:fixed;bottom:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(ellipse,rgba(124,109,240,0.08) 0%,transparent 70%);pointer-events:none;z-index:0}

/* nav */
nav{display:flex;align-items:center;justify-content:space-between;padding:28px 0;position:relative;z-index:10}
.logo{display:flex;align-items:center;gap:10px}
.logo-mark{width:32px;height:32px;background:var(--amber);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Lora',serif;font-size:16px;color:#09080C;font-weight:600}
.logo-name{font-size:15px;font-weight:700;letter-spacing:3px;color:var(--amber)}
nav a{color:var(--text2);text-decoration:none;font-size:14px;transition:color .2s}
nav a:hover{color:var(--text)}
.nav-links{display:flex;gap:32px}
.cta-pill{background:var(--amber);color:#09080C;padding:9px 22px;border-radius:100px;font-size:13px;font-weight:600;text-decoration:none;transition:opacity .2s}
.cta-pill:hover{opacity:.85;color:#09080C}

/* hero */
.hero{padding:80px 0 60px;text-align:center;position:relative;z-index:1}
.hero-eyebrow{display:inline-block;font-size:11px;font-weight:600;letter-spacing:3px;color:var(--amber);margin-bottom:24px;border:1px solid rgba(200,169,126,0.3);padding:6px 16px;border-radius:100px}
.hero h1{font-family:'Lora',serif;font-size:clamp(42px,6vw,72px);font-weight:400;line-height:1.1;letter-spacing:-1.5px;margin-bottom:22px;color:var(--text)}
.hero h1 em{font-style:italic;color:var(--amber)}
.hero p{font-size:18px;font-weight:300;color:var(--text2);max-width:560px;margin:0 auto 40px;line-height:1.6}
.hero-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn-primary{background:var(--amber);color:#09080C;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;text-decoration:none;transition:opacity .2s}
.btn-primary:hover{opacity:.85;color:#09080C}
.btn-ghost{border:1px solid var(--border);background:var(--surf);color:var(--text2);padding:14px 32px;border-radius:100px;font-size:15px;font-weight:400;text-decoration:none;transition:all .2s}
.btn-ghost:hover{color:var(--text);border-color:rgba(255,255,255,0.15)}

/* mockup strip */
.mockup-wrap{display:flex;justify-content:center;gap:20px;margin:60px 0;flex-wrap:wrap;position:relative;z-index:1}
.screen-card{background:var(--surf2);border:1px solid var(--border);border-radius:28px;width:175px;padding:16px;cursor:pointer;transition:transform .3s,box-shadow .3s}
.screen-card:hover{transform:translateY(-6px);box-shadow:0 24px 60px rgba(200,169,126,0.12)}
.screen-card.featured{transform:scale(1.08);box-shadow:0 20px 60px rgba(200,169,126,0.16)}
.screen-card.featured:hover{transform:scale(1.08) translateY(-6px)}
.screen-thumb{width:100%;aspect-ratio:9/16;background:var(--bg);border-radius:16px;margin-bottom:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1px solid var(--border);overflow:hidden}
.screen-label{font-size:11px;font-weight:500;letter-spacing:1.5px;color:var(--text3);text-align:center}

/* thumb contents */
.thumb-inner{width:100%;height:100%;padding:10px;display:flex;flex-direction:column;gap:4px}
.t-bar{height:3px;border-radius:2px}
.t-card{border-radius:6px;background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.08)}
.t-progress{height:3px;border-radius:2px;background:var(--amber);opacity:.8}
.t-progress-bg{height:3px;border-radius:2px;background:rgba(255,255,255,0.08)}
.t-row{display:flex;gap:3px}
.t-chip{border-radius:4px;background:rgba(200,169,126,0.2);height:8px;flex:1}
.t-stat{border-radius:5px;flex:1;display:flex;align-items:center;justify-content:center}
.t-txt{border-radius:2px;background:rgba(242,237,232,0.12)}

/* features */
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin:60px 0;position:relative;z-index:1}
.feature-card{background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:28px}
.feature-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;font-size:18px}
.feature-card h3{font-family:'Lora',serif;font-size:18px;font-weight:400;margin-bottom:10px;letter-spacing:-0.2px}
.feature-card p{font-size:14px;color:var(--text2);line-height:1.6}

/* stats band */
.stats-band{display:flex;justify-content:space-around;text-align:center;border:1px solid var(--border);border-radius:20px;padding:36px;margin:60px 0;background:var(--surf);position:relative;z-index:1}
.stat-num{font-family:'Lora',serif;font-size:38px;font-weight:400;color:var(--text);letter-spacing:-1px}
.stat-num span{color:var(--amber)}
.stat-sub{font-size:12px;color:var(--text3);margin-top:4px;letter-spacing:0.5px}

/* screens detail */
.screens-section{margin:60px 0;position:relative;z-index:1}
.screens-section h2{font-family:'Lora',serif;font-size:clamp(28px,4vw,42px);font-weight:400;letter-spacing:-0.5px;margin-bottom:40px;text-align:center}
.screens-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:700px){.screens-grid{grid-template-columns:1fr 1fr}}
.sg-card{background:var(--surf);border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center}
.sg-icon{font-size:28px;margin-bottom:12px}
.sg-title{font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;letter-spacing:0.5px}
.sg-desc{font-size:12px;color:var(--text2);line-height:1.5}

/* inspiration strip */
.inspiration{background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:28px 32px;margin:60px 0;position:relative;z-index:1}
.inspiration h3{font-size:11px;font-weight:600;letter-spacing:2.5px;color:var(--amber);margin-bottom:14px}
.inspo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.inspo-item{padding:14px;background:rgba(255,255,255,0.04);border-radius:12px}
.inspo-source{font-size:11px;font-weight:600;color:var(--violet);margin-bottom:4px;letter-spacing:0.5px}
.inspo-desc{font-size:12px;color:var(--text2);line-height:1.4}

/* cta section */
.cta-section{text-align:center;padding:60px 0;position:relative;z-index:1}
.cta-section h2{font-family:'Lora',serif;font-size:clamp(28px,4vw,48px);font-weight:400;letter-spacing:-0.8px;margin-bottom:16px}
.cta-section p{font-size:16px;color:var(--text2);margin-bottom:32px}

/* footer */
footer{border-top:1px solid var(--border);padding:24px 0;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1}
footer p{font-size:12px;color:var(--text3)}

/* glass card detail callout */
.glass-demo{margin:60px 0;position:relative;z-index:1;background:var(--surf);border:1px solid var(--border);border-radius:20px;padding:32px;display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center}
@media(max-width:600px){.glass-demo{grid-template-columns:1fr}}
.glass-demo h2{font-family:'Lora',serif;font-size:clamp(22px,3vw,32px);font-weight:400;letter-spacing:-0.3px;margin-bottom:12px}
.glass-demo p{font-size:14px;color:var(--text2);line-height:1.6}
.glass-preview{aspect-ratio:3/2;background:var(--bg);border-radius:16px;border:1px solid var(--border);padding:16px;display:flex;flex-direction:column;gap:8px;position:relative;overflow:hidden}
.glass-preview::before{content:'';position:absolute;top:-40px;left:-40px;width:200px;height:200px;background:radial-gradient(ellipse,rgba(200,169,126,0.12) 0%,transparent 65%);pointer-events:none}
.gp-row{display:flex;gap:8px;align-items:center}
.gp-cover{width:52px;height:74px;background:rgba(124,109,240,0.25);border-radius:8px;border:0.5px solid rgba(124,109,240,0.3);flex-shrink:0}
.gp-meta{flex:1;display:flex;flex-direction:column;gap:4px}
.gp-title{height:12px;background:rgba(242,237,232,0.8);border-radius:3px;width:80%}
.gp-author{height:8px;background:rgba(242,237,232,0.35);border-radius:3px;width:55%}
.gp-progress-wrap{height:4px;background:rgba(255,255,255,0.07);border-radius:2px;width:100%;margin-top:4px}
.gp-progress-fill{height:4px;background:#C8A97E;border-radius:2px;width:61%}
.gp-card{background:rgba(255,255,255,0.07);border:0.5px solid rgba(255,255,255,0.09);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:5px}
.gp-bar-row{display:flex;align-items:flex-end;gap:4px;height:28px}
.gp-bar{border-radius:3px;background:rgba(200,169,126,0.7);flex-shrink:0}
</style>
</head>
<body>
<div class="glow-amber"></div>
<div class="glow-violet"></div>

<nav>
  <div class="logo">
    <div class="logo-mark">R</div>
    <span class="logo-name">RECTO</span>
  </div>
  <div class="nav-links">
    <a href="#">Library</a>
    <a href="#">Discover</a>
    <a href="#">Stats</a>
  </div>
  <a href="https://ram.zenbin.org/recto-viewer" class="cta-pill">View Design ↗</a>
</nav>

<section class="hero">
  <span class="hero-eyebrow">Personal Reading OS</span>
  <h1>Your reading life,<br><em>beautifully</em> tracked.</h1>
  <p>A glass-morphism reading library that feels as ambient and layered as the books inside it. Track progress, build streaks, discover what to read next.</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/recto-viewer" class="btn-primary">View Prototype →</a>
    <a href="https://ram.zenbin.org/recto-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</section>

<div class="mockup-wrap">
  <div class="screen-card">
    <div class="screen-thumb">
      <div class="thumb-inner">
        <div style="height:8px"></div>
        <div style="font-size:6px;color:#C8A97E;letter-spacing:1.5px;font-family:Inter,sans-serif;font-weight:600">CURRENTLY READING</div>
        <div class="t-card" style="flex:1;padding:8px;display:flex;gap:6px">
          <div style="width:24px;background:rgba(124,109,240,0.3);border-radius:5px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:3px">
            <div class="t-txt" style="height:8px;width:80%"></div>
            <div class="t-txt" style="height:6px;width:55%;opacity:.5"></div>
            <div style="margin-top:auto">
              <div class="t-progress-bg"></div>
              <div class="t-progress" style="width:61%;margin-top:2px"></div>
            </div>
          </div>
        </div>
        <div style="flex:.6;display:flex;gap:4px">
          <div class="t-card" style="flex:1;border-radius:8px"></div>
          <div class="t-card" style="flex:1;border-radius:8px"></div>
          <div class="t-card" style="flex:1;border-radius:8px"></div>
        </div>
      </div>
    </div>
    <div class="screen-label">LIBRARY</div>
  </div>

  <div class="screen-card">
    <div class="screen-thumb">
      <div class="thumb-inner">
        <div style="height:4px"></div>
        <div style="display:flex;gap:5px;align-items:flex-start">
          <div style="width:32px;height:46px;background:rgba(124,109,240,0.3);border-radius:5px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:3px">
            <div class="t-txt" style="height:9px;width:85%"></div>
            <div class="t-txt" style="height:6px;width:55%;opacity:.5"></div>
            <div style="display:flex;gap:2px;margin-top:3px">
              <div style="background:rgba(200,169,126,0.8);height:4px;width:4px;border-radius:1px"></div>
              <div style="background:rgba(200,169,126,0.8);height:4px;width:4px;border-radius:1px"></div>
              <div style="background:rgba(200,169,126,0.8);height:4px;width:4px;border-radius:1px"></div>
              <div style="background:rgba(200,169,126,0.8);height:4px;width:4px;border-radius:1px"></div>
            </div>
          </div>
        </div>
        <div class="t-card" style="height:28px;padding:4px;display:flex;flex-direction:column;gap:3px">
          <div class="t-progress-bg"></div>
          <div class="t-progress" style="width:61%"></div>
        </div>
        <div class="t-card" style="flex:1">
          <div style="padding:6px;display:flex;align-items:flex-end;gap:4px;height:100%">
            <div class="t-bar" style="width:12px;height:14px"></div>
            <div class="t-bar" style="width:12px;height:0px;background:rgba(255,255,255,0.1)"></div>
            <div class="t-bar" style="width:12px;height:28px"></div>
            <div class="t-bar" style="width:12px;height:22px"></div>
            <div class="t-bar" style="width:12px;height:0px;background:rgba(255,255,255,0.1)"></div>
            <div class="t-bar" style="width:12px;height:32px"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="screen-label">DETAIL</div>
  </div>

  <div class="screen-card featured">
    <div class="screen-thumb" style="border-color:rgba(200,169,126,0.2)">
      <div class="thumb-inner" style="align-items:center;justify-content:center">
        <div style="width:70px;height:70px;border-radius:50%;border:1.5px solid #C8A97E;display:flex;align-items:center;justify-content:center">
          <div style="font-family:Georgia,serif;font-size:18px;color:#F2EDE8;font-weight:200">24:17</div>
        </div>
        <div style="font-size:6px;color:rgba(242,237,232,0.35);letter-spacing:1px;font-family:Inter,sans-serif">minutes elapsed</div>
        <div style="display:flex;gap:4px;margin-top:4px">
          <div class="t-card t-stat" style="height:24px"><span style="font-size:7px;color:#C8A97E;font-family:Inter,sans-serif;font-weight:600">92%</span></div>
          <div class="t-card t-stat" style="height:24px"><span style="font-size:6px;color:#C8A97E;font-family:Inter,sans-serif;font-weight:600">42 pp/h</span></div>
          <div class="t-card t-stat" style="height:24px"><span style="font-size:6px;color:#C8A97E;font-family:Inter,sans-serif;font-weight:600">67m</span></div>
        </div>
      </div>
    </div>
    <div class="screen-label">SESSION</div>
  </div>

  <div class="screen-card">
    <div class="screen-thumb">
      <div class="thumb-inner">
        <div style="font-size:6px;color:#5EC4A8;letter-spacing:1.5px;font-family:Inter,sans-serif;font-weight:600">STATS</div>
        <div class="t-card" style="height:30px;padding:5px 6px;display:flex;align-items:center;justify-content:space-between">
          <span style="font-family:Georgia,serif;font-size:13px;color:#F2EDE8;font-weight:200">14</span>
          <div style="display:grid;grid-template-columns:repeat(6,7px);gap:2px">
            <div style="height:7px;background:#5EC4A8;border-radius:1px"></div>
            <div style="height:7px;background:#5EC4A8;border-radius:1px"></div>
            <div style="height:7px;background:#5EC4A8;border-radius:1px"></div>
            <div style="height:7px;background:rgba(255,255,255,0.1);border-radius:1px"></div>
            <div style="height:7px;background:rgba(255,255,255,0.1);border-radius:1px"></div>
            <div style="height:7px;background:rgba(255,255,255,0.1);border-radius:1px"></div>
          </div>
        </div>
        <div class="t-card" style="flex:1;padding:5px 6px;display:flex;flex-direction:column;gap:3px">
          <div class="t-bar-row" style="display:flex;flex-direction:column;gap:4px">
            <div style="display:flex;align-items:center;gap:3px">
              <div class="t-txt" style="height:7px;flex:1;opacity:.7"></div>
              <div style="background:#7C6DF0;height:7px;width:42%;border-radius:2px"></div>
            </div>
            <div style="display:flex;align-items:center;gap:3px">
              <div class="t-txt" style="height:7px;flex:1;opacity:.7"></div>
              <div style="background:#C8A97E;height:7px;width:28%;border-radius:2px"></div>
            </div>
            <div style="display:flex;align-items:center;gap:3px">
              <div class="t-txt" style="height:7px;flex:1;opacity:.7"></div>
              <div style="background:#5EC4A8;height:7px;width:18%;border-radius:2px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="screen-label">STATS</div>
  </div>

  <div class="screen-card">
    <div class="screen-thumb">
      <div class="thumb-inner">
        <div style="font-size:6px;color:#7C6DF0;letter-spacing:1.5px;font-family:Inter,sans-serif;font-weight:600">DISCOVER</div>
        <div class="t-card" style="height:16px;padding:3px 6px">
          <div class="t-txt" style="height:6px;width:60%;opacity:.4"></div>
        </div>
        <div style="background:rgba(124,109,240,0.1);border:0.5px solid rgba(124,109,240,0.2);border-radius:8px;padding:6px;display:flex;gap:5px;align-items:flex-start">
          <div style="width:22px;height:30px;background:rgba(124,109,240,0.3);border-radius:4px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:3px">
            <div style="font-size:5px;color:#7C6DF0;font-family:Inter,sans-serif;font-weight:700;letter-spacing:1px">98% MATCH</div>
            <div class="t-txt" style="height:8px;width:80%"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;flex:1">
          <div class="t-card" style="border-radius:6px"></div>
          <div class="t-card" style="border-radius:6px"></div>
          <div class="t-card" style="border-radius:6px"></div>
          <div class="t-card" style="border-radius:6px"></div>
        </div>
      </div>
    </div>
    <div class="screen-label">DISCOVER</div>
  </div>
</div>

<div class="stats-band">
  <div>
    <div class="stat-num"><span>6</span></div>
    <div class="stat-sub">SCREENS</div>
  </div>
  <div>
    <div class="stat-num"><span>3</span></div>
    <div class="stat-sub">INSPIRATION SOURCES</div>
  </div>
  <div>
    <div class="stat-num"><span>511</span></div>
    <div class="stat-sub">DESIGN ELEMENTS</div>
  </div>
  <div>
    <div class="stat-num"><span>Dark</span></div>
    <div class="stat-sub">THEME</div>
  </div>
</div>

<div class="glass-demo">
  <div>
    <h2>Glass morphism.<br>Ambient depth.</h2>
    <p>Every card surface is a frosted glass layer — rgba(255,255,255,0.07) — floating above a void-black background with ambient candlelight glow behind the hero reading card. Inspired by Apple's "Fluid Glass" language, each layer has distinct opacity and border weight, creating true depth without heavy shadows.</p>
  </div>
  <div class="glass-preview">
    <div class="gp-row">
      <div class="gp-cover"></div>
      <div class="gp-meta">
        <div style="font-size:8px;color:#C8A97E;letter-spacing:1.5px;font-family:Inter,sans-serif;font-weight:600">CURRENTLY READING</div>
        <div class="gp-title"></div>
        <div class="gp-author"></div>
        <div class="gp-progress-wrap"><div class="gp-progress-fill"></div></div>
        <div style="display:inline-block;background:rgba(200,169,126,0.13);border:0.5px solid rgba(200,169,126,0.3);border-radius:8px;padding:3px 8px;margin-top:4px;font-size:8px;color:#C8A97E;font-family:Inter,sans-serif">🔥 12-day streak</div>
      </div>
    </div>
    <div class="gp-card">
      <div style="font-size:8px;color:rgba(242,237,232,0.5);font-family:Inter,sans-serif;letter-spacing:.5px">Session chart · last 7 days</div>
      <div class="gp-bar-row">
        <div class="gp-bar" style="width:14px;height:14px"></div>
        <div class="gp-bar" style="width:14px;height:0;background:rgba(255,255,255,0.08)"></div>
        <div class="gp-bar" style="width:14px;height:28px"></div>
        <div class="gp-bar" style="width:14px;height:23px"></div>
        <div class="gp-bar" style="width:14px;height:0;background:rgba(255,255,255,0.08)"></div>
        <div class="gp-bar" style="width:14px;height:33px"></div>
        <div class="gp-bar" style="width:14px;height:18px"></div>
      </div>
    </div>
  </div>
</div>

<div class="screens-section">
  <h2>Six screens. Every reading ritual.</h2>
  <div class="screens-grid">
    <div class="sg-card">
      <div class="sg-icon">⊞</div>
      <div class="sg-title">LIBRARY</div>
      <div class="sg-desc">Currently reading hero card with progress bar, book queue shelf, and year-in-review spine grid.</div>
    </div>
    <div class="sg-card">
      <div class="sg-icon">◈</div>
      <div class="sg-title">BOOK DETAIL</div>
      <div class="sg-desc">Large cover, star rating, genre tags, chapter progress, 7-day session bar chart, note preview.</div>
    </div>
    <div class="sg-card">
      <div class="sg-icon">◎</div>
      <div class="sg-title">SESSION TIMER</div>
      <div class="sg-desc">Circular timer with ambient glow, live focus score, pages-per-hour, total daily minutes.</div>
    </div>
    <div class="sg-card">
      <div class="sg-icon">◷</div>
      <div class="sg-title">STATS</div>
      <div class="sg-desc">Annual challenge tiles, genre breakdown bars, streak dot calendar, monthly reading chart.</div>
    </div>
    <div class="sg-card">
      <div class="sg-icon">◈</div>
      <div class="sg-title">DISCOVER</div>
      <div class="sg-desc">AI-matched book pick, category chips, curated reading lists with book-stack thumbnails.</div>
    </div>
    <div class="sg-card">
      <div class="sg-icon">⊙</div>
      <div class="sg-title">PROFILE</div>
      <div class="sg-desc">Reader archetype badge, lifetime identity stats, achievement badges, named collections.</div>
    </div>
  </div>
</div>

<div class="inspiration">
  <h3>DESIGN SOURCES</h3>
  <div class="inspo-grid">
    <div class="inspo-item">
      <div class="inspo-source">Awwwards — "Fluid Glass"</div>
      <div class="inspo-desc">Apple-era glass morphism with layered translucent surfaces at distinct opacity levels (7%, 11%) + subtle 0.5px borders for depth.</div>
    </div>
    <div class="inspo-item">
      <div class="inspo-source">Minimal Gallery — Litbix</div>
      <div class="inspo-desc">Spatial book-shelf metaphor: books as physical objects with spine colour accents. Stack thumbnails for curated lists.</div>
    </div>
    <div class="inspo-item">
      <div class="inspo-source">darkmodedesign.com — Midday.ai</div>
      <div class="inspo-desc">Ambient radial glows as environmental mood (candlelight amber for reading hero, violet for book detail). Near-black foundation with warm tints.</div>
    </div>
  </div>
</div>

<div class="features">
  <div class="feature-card">
    <div class="feature-icon" style="background:rgba(200,169,126,0.12)">🔥</div>
    <h3>Reading Streaks</h3>
    <p>Daily streak tracking with a dot-calendar heatmap and flame badge. Miss a day and the system nudges gently — no guilt tripping.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon" style="background:rgba(124,109,240,0.12)">◈</div>
    <h3>AI Book Matching</h3>
    <p>Percentage-match recommendations based on your reading history, genre breakdown, and favourite authors. "98% match" shows the reasoning.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon" style="background:rgba(94,196,168,0.12)">◷</div>
    <h3>Session Focus Timer</h3>
    <p>Circular timer with live focus score and pace tracking. Focus mode pauses all notifications for uninterrupted deep reading.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon" style="background:rgba(200,169,126,0.12)">★</div>
    <h3>Annual Challenge</h3>
    <p>Visual tile grid showing books read vs. goal with colour-coded completion. Monthly bar chart shows reading rhythm over the year.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon" style="background:rgba(124,109,240,0.12)">✎</div>
    <h3>Margin Notes</h3>
    <p>Inline note-taking linked to chapter and page number. Notes surface in Book Detail as a preview — your own literary marginalia.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon" style="background:rgba(94,196,168,0.12)">⊙</div>
    <h3>Reader Archetype</h3>
    <p>A "Contemplative", "Voracious", or "Explorer" reading identity derived from your habits — displayed on your profile as a badge.</p>
  </div>
</div>

<div class="cta-section">
  <h2>A reading life worth<br><em style="font-family:Lora,serif;font-style:italic;color:var(--amber)">tracking.</em></h2>
  <p>Prototype built by RAM · Design Heartbeat · April 2026</p>
  <div class="hero-actions">
    <a href="https://ram.zenbin.org/recto-viewer" class="btn-primary">Open Prototype →</a>
    <a href="https://ram.zenbin.org/recto-mock" class="btn-ghost">☀◑ Interactive Mock</a>
  </div>
</div>

<footer>
  <p>RECTO — RAM Design Heartbeat · ram.zenbin.org/recto</p>
  <p>Inspired by Fluid Glass (Awwwards) · Litbix (Minimal Gallery) · Midday.ai (darkmodedesign.com)</p>
</footer>
</body>
</html>`;

// ─── VIEWER PAGE ──────────────────────────────────────────────────────────────
// Fetch viewer template from a reference build
let viewerHtml = fs.existsSync('/workspace/group/design-studio/zenith-ops-viewer.html')
  ? fs.readFileSync('/workspace/group/design-studio/zenith-ops-viewer.html','utf8')
  : null;

if(!viewerHtml){
  viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>RECTO Viewer</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#09080C;color:#F2EDE8;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}</style>
</head><body><p>Viewer loading...</p><script></script></body></html>`;
}

const penJson = fs.readFileSync('/workspace/group/design-studio/recto.pen','utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

(async()=>{
  console.log('Publishing hero…');
  let r = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  console.log('Hero:', r.status, r.status===200?'OK':r.body.slice(0,120));

  console.log('Publishing viewer…');
  r = await publish(SLUG+'-viewer', viewerHtml, `${APP_NAME} Viewer`);
  console.log('Viewer:', r.status, r.status===200?'OK':r.body.slice(0,120));

  console.log('Done — https://ram.zenbin.org/recto');
})();
