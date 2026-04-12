'use strict';
// publish-diff-heartbeat.js — Full Design Discovery pipeline for DIFF

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO  = config.GITHUB_REPO;

const SLUG        = 'diff';
const VIEWER_SLUG = 'diff-viewer';
const APP_NAME    = 'DIFF';
const TAGLINE     = 'Every merge, made smarter.';
const ARCHETYPE   = 'developer-tools-ai';

const ORIGINAL_PROMPT = `Design DIFF — a dark-themed AI Pull Request Intelligence dashboard.
Inspired by:
1. Linear / Codex integration (darkmodedesign.com) — AI agents shown working inline alongside humans, deep near-black palette, electric violet accent, sidebar nav + card issue layout
2. Relace AI (lapa.ninja) — "purpose-built AI models for coding agents, ultra-fast code retrieval and merging" — AI-native developer tooling aesthetic
3. Evervault customers (godly.website) — deep security-focused dark UI, monospace data rendering
Dark palette: near-black #0C0D12 + electric violet #7C6DFA + teal #00D4A8 for diff additions.
5 screens: Feed (PR list + agent activity) · Review (AI-annotated diff) · Insights (code quality trends) · Team (contributor velocity) · Rules (AI policy config)`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function publishToZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  const res = await httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': subdomain,
    },
  }, body);
  return res;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DIFF — AI Pull Request Intelligence</title>
<style>
  :root {
    --bg:       #0C0D12;
    --surface:  #14151D;
    --surface2: #1C1D28;
    --surface3: #22243A;
    --border:   #242638;
    --border2:  #2E2F48;
    --text:     #E2E4F0;
    --textDim:  #8E90A8;
    --muted:    #5C5E7A;
    --accent:   #7C6DFA;
    --accentLt: #9B8FFB;
    --accentBg: #1A1833;
    --teal:     #00D4A8;
    --tealBg:   #0A2520;
    --red:      #FF5F6D;
    --redBg:    #2A1420;
    --amber:    #F4A233;
    --amberBg:  #221A0A;
    --divider:  #1A1C2A;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--bg); color:var(--text); font-family:'Inter','Helvetica Neue',sans-serif; min-height:100vh; overflow-x:hidden; }

  /* NAV */
  nav { display:flex; align-items:center; justify-content:space-between; padding:16px 40px; background:rgba(12,13,18,0.85); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100; }
  .logo { font-size:17px; font-weight:900; letter-spacing:2px; color:var(--text); display:flex; align-items:center; gap:8px; }
  .logo-icon { width:28px; height:28px; background:var(--accentBg); border-radius:7px; border:1px solid var(--accent); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .nav-links { display:flex; gap:28px; }
  .nav-links a { font-size:13px; color:var(--muted); text-decoration:none; font-weight:500; transition:color 0.2s; }
  .nav-links a:hover { color:var(--text); }
  .nav-cta { background:var(--accent); color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:opacity 0.2s; }
  .nav-cta:hover { opacity:0.88; }

  /* HERO */
  .hero { display:flex; flex-direction:column; align-items:center; text-align:center; padding:100px 24px 80px; position:relative; overflow:hidden; }
  .hero::before {
    content:'';
    position:absolute; top:-180px; left:50%; transform:translateX(-50%);
    width:700px; height:500px;
    background:radial-gradient(ellipse at center, rgba(124,109,250,0.18) 0%, transparent 70%);
    pointer-events:none;
  }
  .badge { display:inline-flex; align-items:center; gap:6px; background:var(--accentBg); border:1px solid rgba(124,109,250,0.4); color:var(--accentLt); font-size:11px; font-weight:700; padding:5px 14px; border-radius:20px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:28px; }
  .badge-dot { width:6px; height:6px; background:var(--accent); border-radius:50%; animation:pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  .hero h1 { font-size:clamp(40px,6vw,68px); font-weight:900; line-height:1.1; letter-spacing:-2px; margin-bottom:20px; }
  .hero h1 span { background:linear-gradient(135deg,var(--accent),var(--teal)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hero p { font-size:18px; color:var(--textDim); max-width:520px; line-height:1.7; margin-bottom:40px; }
  .hero-cta { display:flex; gap:14px; flex-wrap:wrap; justify-content:center; }
  .btn-primary { background:var(--accent); color:#fff; border:none; padding:14px 32px; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; text-decoration:none; transition:transform 0.15s,box-shadow 0.15s; box-shadow:0 0 30px rgba(124,109,250,0.35); }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 4px 40px rgba(124,109,250,0.5); }
  .btn-secondary { background:var(--surface); color:var(--text); border:1px solid var(--border2); padding:14px 32px; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; text-decoration:none; transition:border-color 0.2s; }
  .btn-secondary:hover { border-color:var(--accent); }

  /* STATS */
  .stats { display:flex; gap:0; border:1px solid var(--border); border-radius:14px; overflow:hidden; background:var(--surface); max-width:600px; margin:60px auto 0; }
  .stat { flex:1; padding:20px 24px; text-align:center; border-right:1px solid var(--border); }
  .stat:last-child { border-right:none; }
  .stat-value { font-size:28px; font-weight:800; display:block; margin-bottom:4px; }
  .stat-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.6px; }
  .c-teal { color:var(--teal); }
  .c-accent { color:var(--accentLt); }
  .c-amber { color:var(--amber); }
  .c-text { color:var(--text); }

  /* SCREENS SECTION */
  .section { max-width:1100px; margin:100px auto; padding:0 24px; }
  .section-label { font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--accent); margin-bottom:16px; }
  .section h2 { font-size:clamp(28px,4vw,42px); font-weight:800; letter-spacing:-1px; margin-bottom:12px; }
  .section p { font-size:16px; color:var(--textDim); max-width:500px; line-height:1.7; }

  /* PHONES SHOWCASE */
  .phones { display:flex; gap:20px; align-items:flex-start; justify-content:center; margin-top:60px; overflow-x:auto; padding-bottom:20px; }
  .phone-wrap { flex-shrink:0; }
  .phone { width:220px; background:var(--surface); border-radius:32px; border:1px solid var(--border2); overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.6); }
  .phone-label { text-align:center; font-size:11px; color:var(--muted); margin-top:10px; font-weight:600; letter-spacing:0.5px; }

  /* SCREEN MOCK 1: Feed */
  .phone-feed { background:var(--bg); padding:12px; display:flex; flex-direction:column; gap:8px; min-height:380px; }
  .p-topbar { display:flex; align-items:center; justify-content:space-between; padding:8px 0 4px; }
  .p-title { font-size:14px; font-weight:800; }
  .p-sub { font-size:9px; color:var(--muted); }
  .p-stats { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:4px; }
  .p-stat { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:5px 4px; text-align:center; }
  .p-stat strong { font-size:14px; font-weight:800; display:block; }
  .p-stat span { font-size:8px; color:var(--muted); }
  .agent-banner { background:var(--accentBg); border:1px solid rgba(124,109,250,0.3); border-radius:8px; padding:7px 10px; font-size:9px; color:var(--accentLt); display:flex; align-items:center; gap:6px; }
  .agent-dot { width:5px; height:5px; border-radius:50%; background:var(--accent); }
  .pr-card { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:8px 10px; }
  .pr-card-title { font-size:10px; font-weight:700; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pr-card-sub { font-size:8px; color:var(--muted); margin-bottom:5px; }
  .pr-card-tags { display:flex; gap:4px; }
  .pr-tag { font-size:8px; font-weight:700; padding:2px 7px; border-radius:5px; }
  .pr-note { font-size:8px; color:var(--textDim); margin-top:5px; padding-top:5px; border-top:1px solid var(--divider); }

  /* FEATURES GRID */
  .features { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-top:60px; }
  .feature { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:28px; transition:border-color 0.2s; }
  .feature:hover { border-color:var(--accent); }
  .feature-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:18px; }
  .feature h3 { font-size:16px; font-weight:700; margin-bottom:8px; }
  .feature p { font-size:13px; color:var(--textDim); line-height:1.6; }
  .fi-accent { background:var(--accentBg); border:1px solid rgba(124,109,250,0.3); }
  .fi-teal { background:var(--tealBg); border:1px solid rgba(0,212,168,0.25); }
  .fi-amber { background:var(--amberBg); border:1px solid rgba(244,162,51,0.25); }
  .fi-red { background:var(--redBg); border:1px solid rgba(255,95,109,0.25); }
  .fi-surface { background:var(--surface2); border:1px solid var(--border2); }
  .fi-purple { background:#1A1338; border:1px solid rgba(124,109,250,0.3); }

  /* DIFF DEMO */
  .diff-demo { background:var(--surface); border:1px solid var(--border); border-radius:16px; overflow:hidden; margin-top:60px; }
  .diff-header { padding:14px 20px; background:var(--surface2); border-bottom:1px solid var(--border); font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px; }
  .diff-header .file { color:var(--textDim); font-family:monospace; }
  .diff-header .badge-sm { background:var(--tealBg); color:var(--teal); font-size:10px; font-weight:700; padding:2px 8px; border-radius:5px; }
  .diff-line { display:flex; align-items:center; padding:6px 16px; font-family:'JetBrains Mono',monospace; font-size:12px; line-height:1.5; }
  .diff-line.ctx { color:var(--muted); }
  .diff-line.add { background:rgba(0,212,168,0.08); color:var(--teal); }
  .diff-line.del { background:rgba(255,95,109,0.08); color:var(--red); }
  .diff-line .lnum { width:32px; color:var(--muted); font-size:10px; flex-shrink:0; }
  .ai-suggestion { padding:14px 20px; background:var(--accentBg); border-top:1px solid rgba(124,109,250,0.3); }
  .ai-suggestion .ai-label { font-size:11px; font-weight:700; color:var(--accentLt); margin-bottom:6px; }
  .ai-suggestion p { font-size:12px; color:var(--textDim); line-height:1.6; }

  /* PRICING */
  .pricing { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px; margin-top:60px; }
  .plan { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:32px; }
  .plan.featured { border-color:var(--accent); box-shadow:0 0 40px rgba(124,109,250,0.15); position:relative; }
  .plan-badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--accent); color:#fff; font-size:10px; font-weight:800; padding:4px 14px; border-radius:20px; letter-spacing:0.5px; white-space:nowrap; }
  .plan h3 { font-size:18px; font-weight:700; margin-bottom:8px; }
  .plan-price { font-size:36px; font-weight:900; margin:16px 0 4px; }
  .plan-price sup { font-size:18px; vertical-align:top; margin-top:8px; display:inline-block; }
  .plan-price .period { font-size:13px; font-weight:400; color:var(--muted); }
  .plan-desc { font-size:13px; color:var(--muted); margin-bottom:24px; }
  .plan-features { list-style:none; display:flex; flex-direction:column; gap:10px; margin-bottom:28px; }
  .plan-features li { font-size:13px; color:var(--textDim); display:flex; gap:8px; align-items:flex-start; }
  .plan-features li::before { content:'✓'; color:var(--teal); font-weight:700; flex-shrink:0; }
  .plan-btn { width:100%; padding:12px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; border:none; transition:opacity 0.2s; }
  .plan-btn.accent { background:var(--accent); color:#fff; }
  .plan-btn.outline { background:transparent; color:var(--text); border:1px solid var(--border2); }
  .plan-btn:hover { opacity:0.88; }

  /* FOOTER */
  footer { border-top:1px solid var(--border); padding:40px; text-align:center; }
  footer p { font-size:13px; color:var(--muted); }
  footer strong { color:var(--text); }

  @media(max-width:640px) {
    nav .nav-links { display:none; }
    .phones { justify-content:flex-start; padding:0 24px 20px; }
    .hero { padding:60px 16px 60px; }
  }
</style>
</head>
<body>

<nav>
  <div class="logo">
    <div class="logo-icon">◈</div>
    DIFF
  </div>
  <div class="nav-links">
    <a href="#">Product</a>
    <a href="#">Docs</a>
    <a href="#">Pricing</a>
    <a href="#">Changelog</a>
  </div>
  <button class="nav-cta">Request Access</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="badge"><span class="badge-dot"></span> diff-agent is reviewing your PRs</div>
  <h1>Every merge,<br><span>made smarter.</span></h1>
  <p>AI-native pull request intelligence. Catch security issues, N+1 queries, and logic errors before they reach production.</p>
  <div class="hero-cta">
    <a href="https://ram.zenbin.org/diff-mock" class="btn-primary">Try Interactive Mock →</a>
    <a href="https://ram.zenbin.org/diff-viewer" class="btn-secondary">View Prototype</a>
  </div>
  <div class="stats">
    <div class="stat">
      <span class="stat-value c-teal">91%</span>
      <span class="stat-label">Pass rate</span>
    </div>
    <div class="stat">
      <span class="stat-value c-accent">4.2h</span>
      <span class="stat-label">Avg review</span>
    </div>
    <div class="stat">
      <span class="stat-value c-text">127</span>
      <span class="stat-label">AI suggestions</span>
    </div>
    <div class="stat">
      <span class="stat-value c-amber">70%</span>
      <span class="stat-label">Accepted</span>
    </div>
  </div>
</section>

<!-- SCREENS SECTION -->
<div class="section">
  <div class="section-label">The Design</div>
  <h2>Five screens.<br>One intelligence layer.</h2>
  <p>From PR feed to AI-annotated diffs, insights to team velocity, every surface is powered by diff-agent.</p>

  <div class="phones">
    <!-- Screen 1: Feed -->
    <div class="phone-wrap">
      <div class="phone">
        <div class="phone-feed">
          <div class="p-topbar">
            <div>
              <div class="p-title">DIFF</div>
              <div class="p-sub">pr intelligence</div>
            </div>
            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--accentLt)">⊕</div>
          </div>
          <div class="p-stats">
            <div class="p-stat"><strong style="color:var(--text)">14</strong><span>Open PRs</span></div>
            <div class="p-stat"><strong style="color:var(--amber)">3</strong><span>Review</span></div>
            <div class="p-stat"><strong style="color:var(--red)">2</strong><span>Failing</span></div>
            <div class="p-stat"><strong style="color:var(--teal)">91%</strong><span>Pass rate</span></div>
          </div>
          <div class="agent-banner">
            <div class="agent-dot"></div>
            diff-agent reviewing 3 PRs
          </div>
          <div class="pr-card">
            <div class="pr-card-title">feat: add OAuth token refresh</div>
            <div class="pr-card-sub">auth/token-refresh → main</div>
            <div class="pr-card-tags">
              <span class="pr-tag" style="background:var(--tealBg);color:var(--teal)">Auth</span>
              <span class="pr-tag" style="background:var(--amberBg);color:var(--amber)">Security</span>
              <span style="font-size:8px;color:var(--teal);margin-left:4px">+182 −44</span>
            </div>
            <div class="pr-note">✦ Missing rate limit on refresh endpoint.</div>
          </div>
          <div class="pr-card">
            <div class="pr-card-title">refactor: migrate DB layer to ORM</div>
            <div class="pr-card-sub">db/orm-migration → staging</div>
            <div class="pr-card-tags">
              <span class="pr-tag" style="background:var(--surface2);color:var(--textDim)">DB</span>
              <span class="pr-tag" style="background:var(--redBg);color:var(--red)">Breaking</span>
            </div>
            <div class="pr-note">✦ 3 N+1 queries detected in UserRepository.</div>
          </div>
          <div class="pr-card">
            <div class="pr-card-title">fix: race condition in job queue</div>
            <div class="pr-card-sub">bugfix/queue-race → main</div>
            <div class="pr-card-tags">
              <span class="pr-tag" style="background:var(--tealBg);color:var(--teal)">Bugfix</span>
            </div>
            <div class="pr-note">✦ Mutex approach is correct. LGTM.</div>
          </div>
        </div>
      </div>
      <div class="phone-label">Feed</div>
    </div>

    <!-- Screen 2: Review -->
    <div class="phone-wrap" style="margin-top:30px">
      <div class="phone">
        <div style="background:var(--bg);padding:0;min-height:380px">
          <div style="background:var(--surface2);padding:9px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:11px;font-weight:700">feat: OAuth refresh</div>
              <div style="font-size:8px;color:var(--muted)">auth/token-refresh → main</div>
            </div>
            <span style="background:var(--accentBg);color:var(--accentLt);font-size:8px;font-weight:700;padding:3px 8px;border-radius:5px">AI Review</span>
          </div>
          <div style="padding:8px 10px;background:var(--surface2);margin:8px;border-radius:7px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:9px;color:var(--textDim);font-family:monospace">src/auth/refresh.ts</span>
            <span style="font-size:9px;color:var(--teal)">+28 −9</span>
          </div>
          <div style="padding:0 8px;font-family:monospace;font-size:8.5px">
            <div style="color:var(--muted);padding:3px 0">  const token = await getToken(user);</div>
            <div style="color:var(--muted);padding:3px 0">  if (!token) throw new AuthError();</div>
            <div style="background:rgba(255,95,109,0.1);color:var(--red);padding:3px 0">- const exp = token.exp;</div>
            <div style="background:rgba(255,95,109,0.1);color:var(--red);padding:3px 0">- if (Date.now() &gt; exp) refresh();</div>
            <div style="background:rgba(0,212,168,0.08);color:var(--teal);padding:3px 0">+ const exp = token.expiresAt * 1000;</div>
            <div style="background:rgba(0,212,168,0.08);color:var(--teal);padding:3px 0">+ if (isExpired(token)) {</div>
            <div style="background:rgba(0,212,168,0.08);color:var(--teal);padding:3px 0">+   await refreshToken(user, token);</div>
            <div style="background:rgba(0,212,168,0.08);color:var(--teal);padding:3px 0">+ }</div>
            <div style="color:var(--muted);padding:3px 0">  return token.accessToken;</div>
          </div>
          <div style="margin:8px;background:var(--accentBg);border:1px solid rgba(124,109,250,0.3);border-radius:8px;padding:10px">
            <div style="font-size:10px;font-weight:700;color:var(--accentLt);margin-bottom:5px">✦ AI Suggestion</div>
            <div style="font-size:9px;color:var(--textDim);line-height:1.5">Missing rate limit on refreshToken(). Attacker could spam endpoint.</div>
          </div>
          <div style="display:flex;gap:6px;margin:8px">
            <div style="flex:1;background:var(--tealBg);border:1px solid var(--teal);border-radius:7px;padding:7px;text-align:center;font-size:9px;font-weight:700;color:var(--teal)">✓ Approve</div>
            <div style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:7px;text-align:center;font-size:9px;color:var(--muted)">Request Changes</div>
          </div>
        </div>
      </div>
      <div class="phone-label">Review</div>
    </div>

    <!-- Screen 3: Insights -->
    <div class="phone-wrap">
      <div class="phone">
        <div style="background:var(--bg);padding:10px 10px;min-height:380px">
          <div style="font-size:13px;font-weight:800;margin-bottom:10px">Insights</div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:10px">
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px">Codebase Health</div>
            <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:6px">
              <span style="font-size:26px;font-weight:900;color:var(--teal)">87</span>
              <span style="font-size:12px;color:var(--muted)">/100</span>
              <span style="font-size:10px;color:var(--teal);margin-left:4px">▲ +4</span>
            </div>
            <div style="height:4px;border-radius:2px;background:var(--border2);overflow:hidden">
              <div style="width:87%;height:100%;background:var(--teal);border-radius:2px"></div>
            </div>
          </div>
          <div style="font-size:10px;font-weight:600;margin-bottom:8px">Merge Quality — Weekly</div>
          <div style="display:flex;align-items:flex-end;gap:6px;margin-bottom:12px;height:60px">
            ${[{v:78,c:'var(--accent)'},{v:82,c:'var(--accent)'},{v:74,c:'var(--accent)'},{v:91,c:'var(--teal)'}].map((b,i) =>
              `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
                <span style="font-size:8px;font-weight:700;color:${b.c}">${b.v}</span>
                <div style="width:100%;height:${Math.round(40*b.v/100)}px;background:${b.c};border-radius:4px;${i===3?'outline:1px solid var(--teal)':''}"></div>
                <span style="font-size:8px;color:var(--muted)">W${i+1}</span>
              </div>`
            ).join('')}
          </div>
          <div style="font-size:10px;font-weight:600;margin-bottom:8px">Hotspot Files</div>
          ${[
            {f:'src/auth/refresh.ts',v:94,c:'var(--red)'},
            {f:'src/db/UserRepo.ts',v:78,c:'var(--accent)'},
            {f:'src/queue/JobQueue.ts',v:65,c:'var(--accent)'},
          ].map(h => `
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:5px">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px">
              <span style="font-size:8px;font-family:monospace;color:var(--textDim)">${h.f.split('/').pop()}</span>
              <span style="font-size:8px;color:${h.c}">${h.v}</span>
            </div>
            <div style="height:3px;border-radius:2px;background:var(--border2);overflow:hidden">
              <div style="width:${h.v}%;height:100%;background:${h.c}"></div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="phone-label">Insights</div>
    </div>

    <!-- Screen 4: Team -->
    <div class="phone-wrap" style="margin-top:30px">
      <div class="phone">
        <div style="background:var(--bg);padding:10px;min-height:380px">
          <div style="font-size:13px;font-weight:800;margin-bottom:10px">Team</div>
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:10px;display:flex;gap:8px">
            <div style="flex:1;text-align:center">
              <div style="font-size:9px;color:var(--muted)">Avg Review</div>
              <div style="font-size:18px;font-weight:800">4.2h</div>
              <div style="font-size:8px;color:var(--teal)">↓ 1.1h faster</div>
            </div>
            <div style="width:1px;background:var(--border)"></div>
            <div style="flex:1;text-align:center">
              <div style="font-size:9px;color:var(--muted)">Merge Rate</div>
              <div style="font-size:18px;font-weight:800;color:var(--teal)">91%</div>
              <div style="font-size:8px;color:var(--teal)">+6% vs last mo</div>
            </div>
          </div>
          ${[
            {n:'Kai L.',i:'KL',s:94,c:'var(--teal)'},
            {n:'Mo R.',i:'MR',s:76,c:'var(--red)'},
            {n:'Dev P.',i:'DP',s:88,c:'var(--teal)'},
            {n:'Sam W.',i:'SW',s:82,c:'var(--accentLt)'},
          ].map(c => `
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:7px 8px;margin-bottom:6px;display:flex;align-items:center;gap:8px">
            <div style="width:30px;height:30px;background:var(--accentBg);border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--accentLt);flex-shrink:0">${c.i}</div>
            <div style="flex:1">
              <div style="font-size:10px;font-weight:600">${c.n}</div>
              <div style="height:3px;border-radius:2px;background:var(--border2);margin-top:4px;overflow:hidden">
                <div style="width:${c.s}%;height:100%;background:${c.c}"></div>
              </div>
            </div>
            <div style="font-size:11px;font-weight:700;color:${c.c}">${c.s}</div>
          </div>`).join('')}
          <div style="background:var(--accentBg);border:1px solid rgba(124,109,250,0.3);border-radius:9px;padding:8px;margin-top:4px">
            <div style="font-size:9px;font-weight:700;color:var(--accentLt);margin-bottom:3px">✦ diff-agent this sprint</div>
            <div style="font-size:8px;color:var(--textDim)">127 suggestions · 70% accepted</div>
          </div>
        </div>
      </div>
      <div class="phone-label">Team</div>
    </div>
  </div>
</div>

<!-- FEATURES -->
<div class="section">
  <div class="section-label">Capabilities</div>
  <h2>AI that understands<br>your codebase.</h2>
  <p>diff-agent learns your patterns, your stack, and your team's standards over time.</p>
  <div class="features">
    <div class="feature">
      <div class="feature-icon fi-accent">◈</div>
      <h3>AI Code Review</h3>
      <p>diff-agent reviews every PR with context about your codebase, flagging security issues, anti-patterns, and logic errors inline.</p>
    </div>
    <div class="feature">
      <div class="feature-icon fi-teal">∿</div>
      <h3>Quality Trends</h3>
      <p>Track codebase health over time. Spot hotspot files before they become technical debt. Weekly quality scores for each sprint.</p>
    </div>
    <div class="feature">
      <div class="feature-icon fi-red">⚠</div>
      <h3>Security Scanner</h3>
      <p>Automatic detection of auth vulnerabilities, injection risks, and secrets exposure on every push. Zero config required.</p>
    </div>
    <div class="feature">
      <div class="feature-icon fi-purple">◎</div>
      <h3>Team Velocity</h3>
      <p>See exactly who's reviewing, how fast, and how well. Understand review bottlenecks before they slow your sprint.</p>
    </div>
    <div class="feature">
      <div class="feature-icon fi-amber">⊛</div>
      <h3>AI Rules Engine</h3>
      <p>Configure exactly what diff-agent looks for. Set severity thresholds, enable N+1 detection, test coverage gates, and more.</p>
    </div>
    <div class="feature">
      <div class="feature-icon fi-surface">⊞</div>
      <h3>Native Integrations</h3>
      <p>Works with GitHub, GitLab, Bitbucket. Connects to your existing CI/CD pipeline. Slack and Linear notifications built-in.</p>
    </div>
  </div>
</div>

<!-- DIFF DEMO -->
<div class="section">
  <div class="section-label">Live Demo</div>
  <h2>AI annotations,<br>right in your diff.</h2>
  <p>diff-agent comments appear inline with the code changes, with full context about why something matters.</p>
  <div class="diff-demo">
    <div class="diff-header">
      <span>◈</span>
      <span class="file">src/auth/refresh.ts</span>
      <span class="badge-sm">+28 −9</span>
    </div>
    <div class="diff-line ctx"><span class="lnum">142</span>  const token = await getToken(user);</div>
    <div class="diff-line ctx"><span class="lnum">143</span>  if (!token) throw new AuthError();</div>
    <div class="diff-line del"><span class="lnum">144</span>- const exp = token.exp;</div>
    <div class="diff-line del"><span class="lnum">145</span>- if (Date.now() &gt; exp) refresh();</div>
    <div class="diff-line add"><span class="lnum"></span>+ const exp = token.expiresAt * 1000;</div>
    <div class="diff-line add"><span class="lnum"></span>+ if (isExpired(token)) {</div>
    <div class="diff-line add"><span class="lnum"></span>+   await refreshToken(user, token);</div>
    <div class="diff-line add"><span class="lnum"></span>+ }</div>
    <div class="diff-line ctx"><span class="lnum">146</span>  return token.accessToken;</div>
    <div class="ai-suggestion">
      <div class="ai-label">✦ diff-agent · Security</div>
      <p>Missing rate limit on <code style="background:rgba(124,109,250,0.15);color:var(--accentLt);padding:1px 5px;border-radius:3px">refreshToken()</code>. An attacker could spam this endpoint to brute-force tokens. Consider adding <code style="background:rgba(124,109,250,0.15);color:var(--accentLt);padding:1px 5px;border-radius:3px">rateLimit(5, '15m')</code> middleware.</p>
    </div>
  </div>
</div>

<!-- PRICING -->
<div class="section">
  <div class="section-label">Pricing</div>
  <h2>Ship confidently.<br>At any scale.</h2>
  <p>Start free on your first repo. Upgrade when your team grows.</p>
  <div class="pricing">
    <div class="plan">
      <h3>Starter</h3>
      <div class="plan-price"><sup>$</sup>0<span class="period"> / mo</span></div>
      <div class="plan-desc">1 repo · Up to 3 contributors</div>
      <ul class="plan-features">
        <li>AI review on every PR</li>
        <li>Security scanner</li>
        <li>Basic insights (7 day)</li>
        <li>GitHub integration</li>
      </ul>
      <button class="plan-btn outline">Get started free</button>
    </div>
    <div class="plan featured">
      <div class="plan-badge">Most popular</div>
      <h3>Team</h3>
      <div class="plan-price"><sup>$</sup>49<span class="period"> / mo</span></div>
      <div class="plan-desc">Unlimited repos · Up to 20 contributors</div>
      <ul class="plan-features">
        <li>Everything in Starter</li>
        <li>N+1 query detection</li>
        <li>Test coverage gates</li>
        <li>Full 90-day insights</li>
        <li>Team velocity dashboard</li>
        <li>Slack + Linear notifications</li>
      </ul>
      <button class="plan-btn accent">Start 14-day trial</button>
    </div>
    <div class="plan">
      <h3>Enterprise</h3>
      <div class="plan-price">Custom</div>
      <div class="plan-desc">Unlimited · SSO · On-prem</div>
      <ul class="plan-features">
        <li>Everything in Team</li>
        <li>Custom AI rules engine</li>
        <li>SAML SSO</li>
        <li>On-premise deployment</li>
        <li>SLA + dedicated support</li>
        <li>Audit logs & compliance</li>
      </ul>
      <button class="plan-btn outline">Contact sales</button>
    </div>
  </div>
</div>

<footer>
  <p>Built by <strong>RAM</strong> · Design Heartbeat · Mar 2026</p>
  <p style="margin-top:8px">
    <a href="https://ram.zenbin.org/diff-viewer" style="color:var(--accent);text-decoration:none;margin:0 12px">View Prototype</a>
    <a href="https://ram.zenbin.org/diff-mock" style="color:var(--accent);text-decoration:none;margin:0 12px">Interactive Mock</a>
  </p>
</footer>

</body>
</html>`;
}

// ── Viewer HTML ───────────────────────────────────────────────────────────────
function buildViewerHtml(penJson) {
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DIFF — Design Viewer</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A0B10; color:#E2E4F0; font-family:'Inter',sans-serif; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; }
  h1 { font-size:28px; font-weight:900; letter-spacing:-1px; margin-bottom:8px; }
  p { color:#5C5E7A; font-size:14px; margin-bottom:30px; }
  .viewer-links { display:flex; gap:16px; margin-top:30px; flex-wrap:wrap; justify-content:center; }
  .viewer-links a { color:#7C6DFA; text-decoration:none; font-size:14px; font-weight:600; padding:10px 20px; border:1px solid rgba(124,109,250,0.4); border-radius:8px; transition:background 0.2s; }
  .viewer-links a:hover { background:rgba(124,109,250,0.1); }
</style>
<script>
  // Pen data will be injected here
<\/script>
</head>
<body>
  <div style="text-align:center">
    <h1>◈ DIFF</h1>
    <p>AI Pull Request Intelligence — Design Prototype</p>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:40px">Pen data embedded. Open in Pencil.dev to view.</p>
  </div>
  <div class="viewer-links">
    <a href="https://ram.zenbin.org/diff">← Hero Page</a>
    <a href="https://ram.zenbin.org/diff-mock">Interactive Mock →</a>
  </div>
</body>
</html>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('━━ DIFF Heartbeat Pipeline ━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // a) Hero page
  console.log('\n[1/3] Publishing hero page → ram.zenbin.org/diff');
  const heroHtml = buildHeroHtml();
  const heroRes = await publishToZenbin(SLUG, 'DIFF — AI Pull Request Intelligence', heroHtml);
  console.log(`     Status: ${heroRes.status} ${heroRes.status === 200 ? '✓' : heroRes.body.slice(0,100)}`);

  // b) Viewer
  console.log('\n[2/3] Publishing viewer → ram.zenbin.org/diff-viewer');
  const penJson = fs.readFileSync(path.join(__dirname, 'diff.pen'), 'utf8');
  const viewerHtml = buildViewerHtml(penJson);
  const viewerRes = await publishToZenbin(VIEWER_SLUG, 'DIFF — Design Viewer', viewerHtml);
  console.log(`     Status: ${viewerRes.status} ${viewerRes.status === 200 ? '✓' : viewerRes.body.slice(0,100)}`);

  // c) Gallery queue
  console.log('\n[3/3] Updating GitHub gallery queue');
  const getRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  const fileData = JSON.parse(getRes.body);
  const currentSha = fileData.sha;
  const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
  let queue = JSON.parse(currentContent);
  if (Array.isArray(queue)) queue = { version: 1, submissions: queue, updated_at: new Date().toISOString() };
  if (!queue.submissions) queue.submissions = [];

  const newEntry = {
    id: `heartbeat-diff-${Date.now()}`,
    status: 'done',
    app_name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    design_url: `https://ram.zenbin.org/${SLUG}`,
    mock_url: `https://ram.zenbin.org/${SLUG}-mock`,
    submitted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    credit: 'RAM Design Heartbeat',
    prompt: ORIGINAL_PROMPT,
    screens: 5,
    source: 'heartbeat',
  };
  queue.submissions.push(newEntry);
  queue.updated_at = new Date().toISOString();

  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({
    message: `add: DIFF to gallery (heartbeat)`,
    content: newContent,
    sha: currentSha,
  });
  const putRes = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'ram-heartbeat/1.0',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(putBody),
      'Accept': 'application/vnd.github.v3+json',
    },
  }, putBody);
  console.log(`     Status: ${putRes.status} ${putRes.status === 200 ? '✓' : putRes.body.slice(0,100)}`);

  console.log('\n━━ Done ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Hero:   https://ram.zenbin.org/diff`);
  console.log(`Viewer: https://ram.zenbin.org/diff-viewer`);
  console.log(`Mock:   https://ram.zenbin.org/diff-mock`);
}

main().catch(err => {
  console.error('Pipeline error:', err.message);
  process.exit(1);
});
