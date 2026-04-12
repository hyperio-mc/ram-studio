#!/usr/bin/env node
// GATE — Hero page + pen viewer publisher

'use strict';
const fs = require('fs');
const https = require('https');

const SLUG    = 'gate';
const APP_NAME = 'GATE';
const TAGLINE = 'Every merge, reviewed.';
const SUBDOMAIN = 'ram';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    };
    const r = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data); r.end();
  });
}

// ─── HERO HTML ───────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>GATE — Every merge, reviewed.</title>
  <meta name="description" content="GATE is an AI-powered code quality gate. Every pull request scored, reviewed, and improved by agents before it reaches main.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0B0E14;
      --surf: #131720;
      --surf2: #1C2130;
      --surf3: #252A3D;
      --emerald: #00D4A4;
      --emerald-soft: rgba(0,212,164,0.10);
      --emerald-glow: rgba(0,212,164,0.20);
      --violet: #7B6FFF;
      --violet-soft: rgba(123,111,255,0.12);
      --coral: #FF5A5A;
      --amber: #FFB443;
      --text: #E0E6F2;
      --muted: rgba(224,230,242,0.50);
      --dim: rgba(224,230,242,0.20);
      --divider: rgba(224,230,242,0.08);
      --border: rgba(224,230,242,0.10);
      --shadow: 0 4px 32px rgba(0,0,0,0.4), 0 1px 8px rgba(0,0,0,0.3);
      --glow: 0 0 40px rgba(0,212,164,0.15);
    }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }
    .mono { font-family: 'JetBrains Mono', monospace; }

    /* ── NAV ── */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(11,14,20,0.90); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--divider); }
    .nav-inner { max-width: 1140px; margin: 0 auto; padding: 0 32px;
      display: flex; align-items: center; height: 60px; gap: 40px; }
    .logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 16px;
      color: var(--emerald); letter-spacing: 2px; text-decoration: none; }
    .nav-links { display: flex; gap: 28px; margin-left: auto; }
    .nav-links a { color: var(--muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta { background: var(--emerald); color: var(--bg); padding: 8px 20px; border-radius: 6px;
      font-size: 14px; font-weight: 600; text-decoration: none; margin-left: 8px;
      font-family: 'JetBrains Mono', monospace; transition: opacity 0.2s; }
    .nav-cta:hover { opacity: 0.9; }

    /* ── HERO ── */
    .hero { padding: 140px 32px 80px; max-width: 1140px; margin: 0 auto; display: grid;
      grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--emerald);
      letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;
      display: flex; align-items: center; gap: 8px; }
    .eyebrow::before { content: ''; width: 24px; height: 1px; background: var(--emerald); }
    h1 { font-size: clamp(38px, 5vw, 64px); font-weight: 800; line-height: 1.08; letter-spacing: -1.5px;
      margin-bottom: 24px; }
    h1 em { color: var(--emerald); font-style: normal; }
    .hero-sub { font-size: 18px; color: var(--muted); line-height: 1.7; margin-bottom: 36px; max-width: 460px; }
    .cta-row { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
    .btn-primary { background: var(--emerald); color: var(--bg); padding: 14px 28px; border-radius: 8px;
      font-size: 15px; font-weight: 700; text-decoration: none; font-family: 'JetBrains Mono', monospace;
      transition: box-shadow 0.2s, transform 0.2s; }
    .btn-primary:hover { box-shadow: 0 0 32px rgba(0,212,164,0.4); transform: translateY(-1px); }
    .btn-ghost { color: var(--text); padding: 14px 28px; border-radius: 8px; font-size: 15px;
      font-weight: 500; text-decoration: none; border: 1px solid var(--border);
      transition: border-color 0.2s, background 0.2s; }
    .btn-ghost:hover { border-color: var(--emerald); background: var(--emerald-soft); }
    .hero-note { font-size: 12px; color: var(--dim); margin-top: 14px; font-family: 'JetBrains Mono', monospace; }
    .hero-note span { color: var(--emerald); }

    /* ── MOCK PHONE ── */
    .phone-wrap { display: flex; justify-content: center; position: relative; }
    .phone-wrap::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 300px; height: 300px; background: radial-gradient(circle, rgba(0,212,164,0.12) 0%, transparent 70%);
      pointer-events: none; }
    .phone { background: var(--surf2); border-radius: 40px; border: 1px solid var(--border);
      box-shadow: var(--shadow), var(--glow); overflow: hidden; width: 280px; }
    .phone-header { background: var(--bg); padding: 16px 20px 12px; display: flex; align-items: center; justify-content: space-between; }
    .phone-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; color: var(--emerald); letter-spacing: 2px; }
    .phone-status { font-size: 10px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
    .phone-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; padding: 10px 14px; }
    .stat-card { background: var(--surf); border-radius: 8px; padding: 8px 10px; }
    .stat-num { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; }
    .stat-label { font-size: 9px; color: var(--muted); margin-top: 2px; }
    .pr-list { padding: 6px 14px 14px; display: flex; flex-direction: column; gap: 6px; }
    .pr-item { background: var(--surf); border-radius: 10px; padding: 10px 12px; border: 1px solid var(--divider);
      display: flex; align-items: center; gap: 10px; }
    .pr-item.active { border-color: var(--emerald); background: var(--surf3); }
    .pr-body { flex: 1; min-width: 0; }
    .pr-title { font-size: 10px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pr-branch { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--emerald); margin-top: 2px; }
    .pr-meta { font-size: 8px; color: var(--muted); margin-top: 2px; }
    .score-ring { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; flex-shrink: 0; }

    /* ── FEATURES ── */
    .section { padding: 80px 32px; max-width: 1140px; margin: 0 auto; }
    .section-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--emerald);
      letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
    h2 { font-size: clamp(28px, 3.5vw, 44px); font-weight: 700; letter-spacing: -0.8px; line-height: 1.15; margin-bottom: 14px; }
    .section-sub { font-size: 17px; color: var(--muted); max-width: 520px; line-height: 1.7; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 48px; }
    .feat-card { background: var(--surf); border-radius: 16px; padding: 28px; border: 1px solid var(--divider);
      transition: border-color 0.2s, box-shadow 0.2s; }
    .feat-card:hover { border-color: var(--emerald-soft); box-shadow: 0 0 24px rgba(0,212,164,0.08); }
    .feat-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--emerald-soft);
      border: 1px solid rgba(0,212,164,0.2); display: flex; align-items: center; justify-content: center;
      font-size: 18px; margin-bottom: 16px; }
    .feat-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .feat-body { font-size: 14px; color: var(--muted); line-height: 1.65; }

    /* ── DIFF SHOWCASE ── */
    .diff-section { padding: 80px 32px; background: var(--surf); }
    .diff-inner { max-width: 1140px; margin: 0 auto; display: grid;
      grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
    .diff-block { background: var(--bg); border-radius: 12px; overflow: hidden;
      border: 1px solid var(--divider); font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .diff-header { padding: 10px 16px; background: var(--surf2); border-bottom: 1px solid var(--divider);
      font-size: 11px; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }
    .diff-score { color: var(--amber); font-weight: 700; }
    .diff-row { padding: 4px 16px; display: flex; gap: 8px; }
    .diff-row.add { background: rgba(0,212,164,0.06); }
    .diff-row.del { background: rgba(255,90,90,0.06); }
    .diff-sign { width: 10px; flex-shrink: 0; }
    .diff-row.add .diff-sign { color: var(--emerald); }
    .diff-row.del .diff-sign { color: var(--coral); }
    .diff-code { color: var(--dim); }
    .diff-row.add .diff-code { color: var(--emerald); }
    .diff-row.del .diff-code { color: var(--coral); opacity: 0.7; }
    .suggestion-card { background: var(--surf2); border-radius: 10px; padding: 16px 18px;
      border: 1px solid var(--amber); border-left-width: 3px; margin-top: 16px; }
    .sug-title { font-size: 13px; font-weight: 600; margin-bottom: 6px; display: flex; gap: 8px; align-items: center; }
    .sug-file { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--amber); margin-bottom: 8px; }
    .sug-body { font-size: 13px; color: var(--muted); }
    .sug-fix { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,180,67,0.10);
      color: var(--amber); padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
      margin-top: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace; }

    /* ── AGENTS SECTION ── */
    .agents-section { padding: 80px 32px; max-width: 1140px; margin: 0 auto; }
    .agents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
    .agent-card { background: var(--surf); border-radius: 16px; padding: 28px; border: 1px solid var(--divider); }
    .agent-card.primary { border-color: var(--emerald); background: linear-gradient(135deg, rgba(0,212,164,0.05), var(--surf)); }
    .agent-header { display: flex; gap: 14px; align-items: center; margin-bottom: 14px; }
    .agent-icon { width: 44px; height: 44px; border-radius: 12px;
      background: var(--emerald-soft); border: 1px solid rgba(0,212,164,0.25);
      display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .agent-name { font-size: 16px; font-weight: 600; }
    .agent-status { font-size: 11px; color: var(--emerald); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
    .agent-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }
    .agent-log { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .log-entry { display: flex; gap: 10px; align-items: flex-start; }
    .log-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
    .log-text { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; line-height: 1.5; }

    /* ── CTA ── */
    .cta-section { padding: 100px 32px; text-align: center;
      background: linear-gradient(180deg, var(--bg) 0%, rgba(0,212,164,0.04) 50%, var(--bg) 100%); }
    .cta-section h2 { margin-bottom: 16px; }
    .cta-section .section-sub { margin: 0 auto 36px; }
    .cta-input-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .code-block { background: var(--surf); border: 1px solid var(--divider); border-radius: 8px;
      padding: 14px 20px; font-family: 'JetBrains Mono', monospace; font-size: 14px;
      display: flex; align-items: center; gap: 12px; }
    .code-block .prompt { color: var(--emerald); }
    .code-block .cmd { color: var(--text); }

    /* ── FOOTER ── */
    footer { padding: 40px 32px; border-top: 1px solid var(--divider); }
    .foot-inner { max-width: 1140px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .foot-logo { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px;
      color: var(--emerald); letter-spacing: 2px; }
    .foot-copy { font-size: 13px; color: var(--dim); }

    @media (max-width: 768px) {
      .hero, .diff-inner, .agents-grid { grid-template-columns: 1fr; }
      .phone-wrap { display: none; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

<nav>
  <div class="nav-inner">
    <a href="#" class="logo">GATE</a>
    <div class="nav-links">
      <a href="#">Product</a><a href="#">Docs</a><a href="#">Pricing</a><a href="#">Blog</a>
    </div>
    <a href="#" class="nav-cta">Get started</a>
  </div>
</nav>

<section style="padding-top:60px">
<div class="hero">
  <div>
    <div class="eyebrow">AI code intelligence</div>
    <h1>Every merge,<br><em>reviewed.</em></h1>
    <p class="hero-sub">Gate is an AI-powered code quality gate. Every pull request scored, reviewed, and improved by agents before it reaches main.</p>
    <div class="cta-row">
      <a href="#" class="btn-primary">Start free</a>
      <a href="#" class="btn-ghost">View demo →</a>
    </div>
    <p class="hero-note">Free for solo devs · <span>14-day trial</span> for teams · Cancel anytime</p>
  </div>

  <div class="phone-wrap">
    <div class="phone">
      <div class="phone-header">
        <span class="phone-logo">GATE</span>
        <span class="phone-status">9:41 ●●●</span>
      </div>
      <div class="phone-stats">
        <div class="stat-card">
          <div class="stat-num" style="color:var(--text)">7</div>
          <div class="stat-label">Open PRs</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color:var(--emerald)">84</div>
          <div class="stat-label">Avg score</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color:var(--coral)">2</div>
          <div class="stat-label">Blocked</div>
        </div>
      </div>
      <div class="pr-list">
        <div class="pr-item">
          <div class="pr-body">
            <div class="pr-title">feat: streaming inference cache</div>
            <div class="pr-branch">feat/stream-cache</div>
            <div class="pr-meta">akshat · 2h · 8 files +142 -34</div>
          </div>
          <div class="score-ring" style="border:2px solid var(--emerald);color:var(--emerald)">91</div>
        </div>
        <div class="pr-item active">
          <div class="pr-body">
            <div class="pr-title">fix: rate limiter race condition</div>
            <div class="pr-branch">fix/rate-limit</div>
            <div class="pr-meta">mei · 5h · 3 files +28 -12</div>
          </div>
          <div class="score-ring" style="border:2px solid var(--amber);color:var(--amber)">73</div>
        </div>
        <div class="pr-item">
          <div class="pr-body">
            <div class="pr-title">refactor: auth middleware split</div>
            <div class="pr-branch">refactor/auth-mw</div>
            <div class="pr-meta">dan · 1d · 14 files +312 -278</div>
          </div>
          <div class="score-ring" style="border:2px solid var(--coral);color:var(--coral)">48</div>
        </div>
        <div class="pr-item">
          <div class="pr-body">
            <div class="pr-title">docs: API reference v2.0</div>
            <div class="pr-branch">docs/api-v2</div>
            <div class="pr-meta">priya · 1d · 2 files +88 -11</div>
          </div>
          <div class="score-ring" style="border:2px solid var(--emerald);color:var(--emerald)">96</div>
        </div>
      </div>
    </div>
  </div>
</div>
</section>

<section class="section">
  <div class="section-label">Features</div>
  <h2>Code quality at<br>every checkpoint</h2>
  <p class="section-sub">Gate sits between your commits and your main branch. It runs before humans, so reviewers see clean, scored diffs.</p>
  <div class="features-grid">
    <div class="feat-card">
      <div class="feat-icon">◈</div>
      <div class="feat-title">AI review scores</div>
      <div class="feat-body">Every PR gets a 0–100 health score. Logic, security, style, and performance — weighted by your team's history.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⟡</div>
      <div class="feat-title">Autonomous agents</div>
      <div class="feat-body">Gate agents run 24/7. They review, suggest fixes, flag regressions, and draft changelogs — without being asked.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">◉</div>
      <div class="feat-title">Codebase insights</div>
      <div class="feat-body">Track score trends, hotspot files, and issue patterns over time. Know where technical debt is accumulating before it bites.</div>
    </div>
    <div class="feat-card">
      <div class="feat-icon">⊞</div>
      <div class="feat-title">Zero config setup</div>
      <div class="feat-body">Connect your GitHub repo in one command. Gate auto-discovers your stack, test setup, and coding conventions.</div>
    </div>
  </div>
</section>

<div class="diff-section">
  <div class="diff-inner">
    <div>
      <div class="section-label">AI review</div>
      <h2>See what Gate sees</h2>
      <p class="section-sub">Gate reads every changed line with the context of your entire codebase. It understands intent, not just syntax.</p>
      <div style="margin-top:28px">
        <div class="suggestion-card">
          <div class="sug-title">◌ Promise leak risk</div>
          <div class="sug-file">rateLimit.ts:51</div>
          <div class="sug-body">Unawaited branch may silently leak on timeout path. Use <code style="color:var(--emerald)">Promise.race</code> with explicit rejection.</div>
          <div class="sug-fix">✦ Fix with AI</div>
        </div>
      </div>
    </div>
    <div>
      <div class="diff-block">
        <div class="diff-header">
          <span>fix/rate-limit  ·  rateLimit.ts:42</span>
          <span class="diff-score">score: 73</span>
        </div>
        <div style="padding:8px 0">
          <div class="diff-row"><span class="diff-sign"> </span><span class="diff-code">async acquire(key: string) {</span></div>
          <div class="diff-row"><span class="diff-sign"> </span><span class="diff-code">  const lock = await getLock(key);</span></div>
          <div class="diff-row del"><span class="diff-sign">-</span><span class="diff-code">  return lock.wait(this.timeout);</span></div>
          <div class="diff-row add"><span class="diff-sign">+</span><span class="diff-code">  const result = await Promise.race([</span></div>
          <div class="diff-row add"><span class="diff-sign">+</span><span class="diff-code">    lock.wait(this.timeout),</span></div>
          <div class="diff-row add"><span class="diff-sign">+</span><span class="diff-code">    sleep(this.timeout).then(() =></span></div>
          <div class="diff-row add"><span class="diff-sign">+</span><span class="diff-code">      { throw new Error("timeout") })</span></div>
          <div class="diff-row add"><span class="diff-sign">+</span><span class="diff-code">  ]);</span></div>
          <div class="diff-row add"><span class="diff-sign">+</span><span class="diff-code">  return result;</span></div>
          <div class="diff-row"><span class="diff-sign"> </span><span class="diff-code">}</span></div>
        </div>
      </div>
    </div>
  </div>
</div>

<section class="agents-section">
  <div class="section-label">Agents</div>
  <h2>AI that ships<br>while you sleep</h2>
  <p class="section-sub">Gate agents work autonomously. They review, fix, and report — only escalating when human judgment is genuinely needed.</p>
  <div class="agents-grid">
    <div class="agent-card primary">
      <div class="agent-header">
        <div class="agent-icon">⟡</div>
        <div>
          <div class="agent-name">Gate Review Agent</div>
          <div class="agent-status">● Active · reviewing 2 PRs</div>
        </div>
      </div>
      <div class="agent-desc">The primary review agent. Reads every changed line, scores the PR, flags issues, and suggests targeted fixes. Learns from your team's review history.</div>
      <div class="agent-log">
        <div class="log-entry"><div class="log-dot" style="background:var(--amber)"></div><div class="log-text">Detected Promise leak in rateLimit.ts:51</div></div>
        <div class="log-entry"><div class="log-dot" style="background:var(--emerald)"></div><div class="log-text">Generated fix suggestion · awaiting approval</div></div>
        <div class="log-entry"><div class="log-dot" style="background:var(--emerald)"></div><div class="log-text">Completed review: feat/stream-cache · score 91</div></div>
      </div>
    </div>
    <div>
      <div class="agent-card" style="margin-bottom:16px">
        <div class="agent-header">
          <div class="agent-icon" style="background:var(--violet-soft);border-color:rgba(123,111,255,0.25)">◈</div>
          <div>
            <div class="agent-name">Style Enforcer</div>
            <div class="agent-status" style="color:var(--emerald)">● Active</div>
          </div>
        </div>
        <div class="agent-desc">Runs ESLint + Prettier on every PR and auto-commits fixes to the branch.</div>
      </div>
      <div class="agent-card" style="margin-bottom:16px">
        <div class="agent-header">
          <div class="agent-icon" style="background:var(--violet-soft);border-color:rgba(123,111,255,0.25)">◉</div>
          <div>
            <div class="agent-name">Dep Scanner</div>
            <div class="agent-status" style="color:var(--emerald)">● Active</div>
          </div>
        </div>
        <div class="agent-desc">Checks for CVEs and outdated packages in every dependency change.</div>
      </div>
      <div class="agent-card">
        <div class="agent-header">
          <div class="agent-icon">⊞</div>
          <div>
            <div class="agent-name">Release Drafter</div>
            <div class="agent-status" style="color:var(--muted)">◌ Idle</div>
          </div>
        </div>
        <div class="agent-desc">Auto-generates changelogs and release notes from merged PRs.</div>
      </div>
    </div>
  </div>
</section>

<section class="cta-section">
  <div class="section-label" style="display:inline-block;margin-bottom:14px">Get started</div>
  <h2>Ship with confidence</h2>
  <p class="section-sub">Connect your GitHub repo in seconds. Gate handles the rest.</p>
  <div class="cta-input-row">
    <div class="code-block">
      <span class="prompt">$</span>
      <span class="cmd">npx gate-cli init</span>
    </div>
    <a href="#" class="btn-primary">Start free →</a>
  </div>
</section>

<footer>
  <div class="foot-inner">
    <span class="foot-logo">GATE</span>
    <span class="foot-copy">Built by RAM · ${new Date().getFullYear()}</span>
  </div>
</footer>

</body>
</html>`;

// ─── VIEWER HTML ─────────────────────────────────────────────────────────────
const penJson = fs.readFileSync('gate.pen', 'utf8');

let viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>GATE — Viewer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0B0E14; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  </style>
</head>
<body>
<script>
// VIEWER PLACEHOLDER
</script>
<script src="https://unpkg.com/@pencil.dev/viewer@latest/dist/viewer.umd.js"></script>
</body>
</html>`;

const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

// ─── PUBLISH ────────────────────────────────────────────────────────────────
const HOST = 'zenbin.org';
const HEADERS = { 'X-Subdomain': SUBDOMAIN };

async function publish(slug, html, title) {
  const res = await post(HOST, `/v1/pages/${slug}?overwrite=true`, HEADERS, { html, title });
  console.log(slug, res.status, res.status === 200 ? 'OK' : res.body.slice(0, 120));
  return JSON.parse(res.body);
}

(async () => {
  await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
  await publish(`${SLUG}-viewer`, viewerHtml, `${APP_NAME} — Viewer`);
  console.log(`\nHero  → https://${SUBDOMAIN}.zenbin.org/${SLUG}`);
  console.log(`Viewer → https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);
})();
