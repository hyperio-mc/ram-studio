'use strict';
const fs = require('fs');
const https = require('https');

const SLUG = 'soleil';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SOLEIL — Creative work, clearly tracked | RAM Design Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#F7F4EF;color:#1C1A17;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
nav{position:fixed;top:0;left:0;right:0;z-index:99;display:flex;align-items:center;justify-content:space-between;padding:0 36px;height:60px;background:rgba(247,244,239,.96);backdrop-filter:blur(10px);border-bottom:1px solid #E5E0D8}
.logo{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;letter-spacing:3px;color:#1C1A17}.logo span{color:#C85B2A}
.btn-nav{padding:8px 20px;border-radius:8px;background:#C85B2A;color:#fff;font-size:13px;font-weight:600;text-decoration:none}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px 60px;text-align:center;background:radial-gradient(ellipse at 50% 0%,rgba(200,91,42,.06) 0%,transparent 60%)}
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;background:#FAF0EB;border:1px solid rgba(200,91,42,.3);font-size:11px;font-weight:700;color:#C85B2A;letter-spacing:1px;margin-bottom:28px}
h1{font-family:'Playfair Display',serif;font-size:clamp(48px,8vw,82px);font-weight:700;line-height:1.06;letter-spacing:-1px;max-width:800px;margin-bottom:22px}
h1 em{font-style:italic;color:#C85B2A}
.sub{font-size:17px;color:#8A847A;max-width:500px;line-height:1.7;margin-bottom:40px}
.btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:64px}
.bp{padding:13px 32px;border-radius:10px;background:#C85B2A;color:#fff;font-size:15px;font-weight:600;text-decoration:none}
.bg2{padding:13px 32px;border-radius:10px;border:1px solid #D4CCBF;background:#fff;color:#1C1A17;font-size:15px;font-weight:500;text-decoration:none}
.metrics{display:flex;flex-wrap:wrap;justify-content:center;border:1px solid #E5E0D8;border-radius:16px;background:#fff;overflow:hidden;max-width:680px;width:100%;box-shadow:0 4px 20px rgba(28,26,23,.06)}
.m{flex:1;min-width:140px;padding:26px 18px;border-right:1px solid #E5E0D8;text-align:center}.m:last-child{border-right:none}
.mv{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#1C1A17;margin-bottom:4px}
.ml{font-size:10px;font-weight:700;color:#8A847A;letter-spacing:.9px}
.section{padding:80px 24px;max-width:1100px;margin:0 auto}
.sec-label{text-align:center;font-size:10px;font-weight:700;color:#C85B2A;letter-spacing:2px;margin-bottom:10px}
h2{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;text-align:center;margin-bottom:10px}
.sub2{text-align:center;color:#8A847A;font-size:14px;margin-bottom:44px;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px}
.card{background:#fff;border:1px solid #E5E0D8;border-radius:14px;padding:22px}
.card-icon{font-size:18px;color:#C85B2A;margin-bottom:10px}
.card h3{font-size:13px;font-weight:700;margin-bottom:7px}
.card p{font-size:12px;color:#8A847A;line-height:1.6}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
.feat{background:#fff;border:1px solid #E5E0D8;border-radius:14px;padding:26px}
.feat-ico{width:38px;height:38px;border-radius:10px;background:#FAF0EB;display:flex;align-items:center;justify-content:center;font-size:17px;color:#C85B2A;margin-bottom:14px}
.feat h3{font-size:14px;font-weight:700;margin-bottom:8px}
.feat p{font-size:13px;color:#8A847A;line-height:1.65}
.inspo{padding:70px 24px;max-width:720px;margin:0 auto;text-align:center}
.inspo p{font-size:14px;color:#8A847A;line-height:1.8;margin-bottom:22px}
.inspo-list{display:flex;flex-direction:column;gap:8px;text-align:left}
.inspo-item{padding:13px 16px;border-radius:10px;background:#fff;border:1px solid #E5E0D8;font-size:12px;color:#3D3A35;line-height:1.5}
.inspo-item strong{color:#C85B2A}
.palette{padding:50px 24px;max-width:640px;margin:0 auto;text-align:center}
.swatches{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.sw{width:56px;text-align:center}.sw-b{width:56px;height:56px;border-radius:10px;margin-bottom:6px;border:1px solid rgba(28,26,23,.1)}
.sw label{font-size:9px;color:#8A847A;font-family:monospace}
.viewer-cta{padding:60px 24px;text-align:center}
.viewer-cta p{font-size:15px;color:#8A847A;margin-bottom:22px}
.viewer-cta a{display:inline-block;padding:15px 40px;border-radius:12px;background:#fff;border:1px solid #D4CCBF;color:#C85B2A;font-size:15px;font-weight:600;text-decoration:none;box-shadow:0 2px 8px rgba(28,26,23,.06)}
footer{padding:30px 24px;text-align:center;border-top:1px solid #E5E0D8;font-size:12px;color:#8A847A}
footer a{color:#C85B2A;text-decoration:none}
@media(max-width:600px){.metrics{flex-direction:column}.m{border-right:none;border-bottom:1px solid #E5E0D8}.m:last-child{border-bottom:none}}
</style></head><body>
<nav><div class="logo">S<span>O</span>LEIL</div><a class="btn-nav" href="/soleil-viewer">View Design &rarr;</a></nav>
<section class="hero">
  <div class="eyebrow">LIGHT THEME &middot; RAM DESIGN STUDIO &middot; MAR 2026</div>
  <h1>Creative work,<br><em>clearly</em> tracked</h1>
  <p class="sub">A premium studio tracker for independent designers — manage projects, clients, billable hours, and invoicing with editorial warmth.</p>
  <div class="btns">
    <a class="bp" href="/soleil-viewer">Explore Design</a>
    <a class="bg2" href="/soleil-mock">Interactive Mock &#9728;&#9681;</a>
  </div>
  <div class="metrics">
    <div class="m"><div class="mv" style="color:#C85B2A">$18,400</div><div class="ml">THIS MONTH</div></div>
    <div class="m"><div class="mv">7</div><div class="ml">ACTIVE PROJECTS</div></div>
    <div class="m"><div class="mv" style="color:#2C5364">34h</div><div class="ml">UNBILLED HOURS</div></div>
    <div class="m"><div class="mv" style="color:#2A7A5A">$52k</div><div class="ml">TOP CLIENT LTV</div></div>
  </div>
</section>
<section class="section">
  <div class="sec-label">FIVE SCREENS</div>
  <h2>A complete studio workflow</h2>
  <p class="sub2">From daily dashboard to invoice dispatch.</p>
  <div class="grid">
    <div class="card"><div class="card-icon">&#9673;</div><h3>STUDIO DASHBOARD</h3><p>Monthly revenue vs goal, active projects, unbilled hours, overdue alerts, recent activity.</p></div>
    <div class="card"><div class="card-icon">&#9638;</div><h3>PROJECTS</h3><p>Status pills, progress bars, due dates, budget and logged hours at a glance.</p></div>
    <div class="card"><div class="card-icon">&#9672;</div><h3>PROJECT DETAIL</h3><p>Budget, hours, timeline, deliverable checklist, Log Time and Send Invoice CTAs.</p></div>
    <div class="card"><div class="card-icon">&#9678;</div><h3>CLIENTS</h3><p>Health scores 0-100, LTV, status, and visual score bar per relationship.</p></div>
    <div class="card"><div class="card-icon">&#10241;</div><h3>INVOICES</h3><p>Outstanding amounts, overdue alerts, draft / sent / paid pipeline.</p></div>
  </div>
</section>
<section class="section" style="padding-top:40px">
  <div class="sec-label">DESIGN DECISIONS</div>
  <h2>Three intentional choices</h2>
  <p class="sub2">What made Soleil feel different from typical project management tools.</p>
  <div class="feat-grid">
    <div class="feat"><div class="feat-ico">S</div><h3>Editorial serif + warm parchment</h3><p>Playfair Display for metrics on #F7F4EF parchment, not cold white. Inspired by midday.ai's editorial serif aesthetic — signals serious finance tool without sterile SaaS feeling.</p></div>
    <div class="feat"><div class="feat-ico">&#9673;</div><h3>Client health as first-class metric</h3><p>A 0-100 health score per client, inspired by Atlas Card's luxury concierge framing — your clients are relationships, not just billing targets.</p></div>
    <div class="feat"><div class="feat-ico">&#10241;</div><h3>Terracotta + deep teal semantics</h3><p>Terracotta for action and urgency; deep teal for progress and health. Warm earth tones matching the editorial warmth trend from land-book.com's Mar 2026 gallery.</p></div>
  </div>
</section>
<section class="inspo">
  <div class="sec-label">INSPIRATION</div>
  <h2 style="font-family:'Playfair Display',serif;font-size:28px;margin-bottom:14px">What I was looking at</h2>
  <p>Browsing darkmodedesign.com surfaced midday.ai — large serif type on warm white, "the business stack for modern founders." I pushed that warmth further: parchment instead of white, terracotta instead of generic blue. Land-book.com's March 2026 gallery confirmed the trend toward editorial SaaS. Atlas Card on godly.website showed how luxury concierge thinking applies to financial products.</p>
  <div class="inspo-list">
    <div class="inspo-item"><strong>midday.ai</strong> — editorial serif, warm white, "business stack for founders" (via darkmodedesign.com)</div>
    <div class="inspo-item"><strong>land-book.com</strong> — warm parchment replacing cold whites in SaaS (Mar 2026 curated gallery)</div>
    <div class="inspo-item"><strong>atlascard.com</strong> — luxury minimal concierge UI, all-caps spaced labels (via godly.website)</div>
  </div>
</section>
<section class="palette">
  <div class="sec-label" style="margin-bottom:18px">COLOUR PALETTE</div>
  <div class="swatches">
    <div class="sw"><div class="sw-b" style="background:#F7F4EF"></div><label>#F7F4EF</label></div>
    <div class="sw"><div class="sw-b" style="background:#FFFFFF"></div><label>#FFFFFF</label></div>
    <div class="sw"><div class="sw-b" style="background:#1C1A17"></div><label>#1C1A17</label></div>
    <div class="sw"><div class="sw-b" style="background:#C85B2A"></div><label>#C85B2A</label></div>
    <div class="sw"><div class="sw-b" style="background:#2C5364"></div><label>#2C5364</label></div>
    <div class="sw"><div class="sw-b" style="background:#B8873A"></div><label>#B8873A</label></div>
    <div class="sw"><div class="sw-b" style="background:#2A7A5A"></div><label>#2A7A5A</label></div>
    <div class="sw"><div class="sw-b" style="background:#C23B3B"></div><label>#C23B3B</label></div>
  </div>
</section>
<section class="viewer-cta"><p>Explore every screen in the Pencil viewer.</p><a href="/soleil-viewer">Open in Pencil viewer &rarr;</a></section>
<footer><p>Designed by RAM &middot; <a href="https://ram.zenbin.org">ram.zenbin.org</a> &middot; March 30, 2026</p></footer>
</body></html>`;

console.log('Hero HTML size:', html.length, 'bytes (' + Math.round(html.length/1024) + ' KB)');

const body = JSON.stringify({ title: 'SOLEIL — Creative work, clearly tracked', html, overwrite: true });
console.log('Body size:', Buffer.byteLength(body), 'bytes');

const r = https.request({
  hostname: 'zenbin.org', path: '/v1/pages/soleil', method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'X-Subdomain': 'ram'
  }
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => console.log('Status:', res.statusCode, d.slice(0, 200)));
});
r.write(body);
r.end();
