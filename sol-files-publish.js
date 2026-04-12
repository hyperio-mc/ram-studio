#!/usr/bin/env node
const https = require('https');

const SLUG  = 'sol-files';
const TITLE = 'SOL — File Management';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SOL — File Management</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       #F7F5F2;
    --surface:  #FFFFFF;
    --border:   #E8E3DC;
    --text:     #1A1612;
    --muted:    #8A7F74;
    --accent:   #D97706;
    --accent-l: #FEF3C7;
    --accent-d: #B45309;
    --danger:   #DC2626;
    --ok:       #16A34A;
    --blue:     #2563EB;
    --purple:   #7C3AED;
    --sidebar-w: 220px;
    --topbar-h:  52px;
    --radius:    10px;
    --shadow:    0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.06);
    --shadow-lg: 0 8px 32px rgba(0,0,0,.14);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
  }

  body { background: var(--bg); color: var(--text); height: 100vh; overflow: hidden; display: grid;
    grid-template-rows: var(--topbar-h) 1fr;
    grid-template-columns: var(--sidebar-w) 1fr;
    grid-template-areas: "topbar topbar" "sidebar main"; }

  /* TOP BAR */
  #topbar {
    grid-area: topbar;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px; padding: 0 16px;
    z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px;
    color: var(--text); text-decoration: none; white-space: nowrap; }
  .logo-dot { width: 26px; height: 26px; background: var(--accent); border-radius: 8px;
    display: grid; place-items: center; color: #fff; font-size: 14px; font-weight: 800; }
  .breadcrumb { display: flex; align-items: center; gap: 4px; color: var(--muted); font-size: 13px; padding: 0 8px; }
  .breadcrumb span { color: var(--text); font-weight: 500; }
  .search-wrap { flex: 1; max-width: 380px; position: relative; }
  .search-wrap input { width: 100%; padding: 7px 36px 7px 34px; background: var(--bg);
    border: 1.5px solid var(--border); border-radius: 8px; font-size: 13px; color: var(--text);
    outline: none; transition: border .15s; }
  .search-wrap input:focus { border-color: var(--accent); background: #fff; }
  .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: var(--muted); font-size: 13px; pointer-events: none; }
  .kbd-hint { position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    background: var(--border); border-radius: 4px; padding: 1px 5px; font-size: 10px;
    color: var(--muted); font-family: monospace; cursor: pointer; }
  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .icon-btn { width: 34px; height: 34px; background: none; border: none; border-radius: 8px;
    cursor: pointer; display: grid; place-items: center; color: var(--muted); font-size: 16px;
    transition: background .15s; }
  .icon-btn:hover { background: var(--bg); color: var(--text); }
  .btn-upload { background: var(--accent); color: #fff; border: none; border-radius: 8px;
    padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 6px; transition: background .15s; white-space: nowrap; }
  .btn-upload:hover { background: var(--accent-d); }
  .avatar { width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), #F59E0B);
    display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 13px; cursor: pointer; }

  /* SIDEBAR */
  #sidebar { grid-area: sidebar; background: var(--surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow-y: auto; padding: 12px 0; }
  .sidebar-label { font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; color: var(--muted); padding: 8px 16px 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 7px 12px;
    border-radius: 8px; cursor: pointer; color: var(--muted); font-size: 13px;
    transition: all .12s; margin: 0 8px; }
  .nav-item:hover { background: var(--bg); color: var(--text); }
  .nav-item.active { background: var(--accent-l); color: var(--accent-d); font-weight: 600; }
  .ni-icon { font-size: 15px; width: 20px; text-align: center; }
  .ni-count { margin-left: auto; background: var(--border); border-radius: 20px;
    padding: 1px 7px; font-size: 11px; font-weight: 600; color: var(--muted); }
  .nav-item.active .ni-count { background: rgba(217,119,6,.2); color: var(--accent-d); }
  .storage-card { margin: 12px; background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 12px; }
  .storage-bar { background: var(--border); border-radius: 99px; height: 5px; overflow: hidden; margin: 6px 0; }
  .storage-fill { background: linear-gradient(90deg, var(--accent), #F59E0B);
    border-radius: 99px; height: 100%; width: 0; transition: width 1s ease; }
  .storage-nums { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); }
  .storage-nums strong { color: var(--text); }

  /* MAIN */
  #main { grid-area: main; overflow-y: auto; padding: 20px 24px;
    display: flex; flex-direction: column; gap: 20px; }

  /* TOOLBAR */
  .toolbar { display: flex; align-items: center; gap: 10px; }
  .tab-group { display: flex; background: var(--border); border-radius: 8px; padding: 2px; }
  .tab { padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
    cursor: pointer; color: var(--muted); transition: all .15s; user-select: none; }
  .tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.1); }
  .sort-select { background: var(--surface); border: 1.5px solid var(--border); border-radius: 8px;
    padding: 5px 10px; font-size: 12px; color: var(--muted); cursor: pointer; outline: none; }
  .spacer { flex: 1; }
  .view-toggle { display: flex; background: var(--border); border-radius: 8px; padding: 2px; }
  .vt-btn { width: 28px; height: 28px; border: none; background: none; border-radius: 6px;
    cursor: pointer; display: grid; place-items: center; color: var(--muted); font-size: 13px;
    transition: all .15s; }
  .vt-btn.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.1); }

  /* DROP ZONE */
  .drop-zone { border: 2px dashed var(--border); border-radius: 14px; background: var(--surface);
    padding: 28px 24px; transition: all .2s; cursor: pointer;
    display: flex; align-items: center; gap: 20px; }
  .drop-zone.drag-over { border-color: var(--accent); background: var(--accent-l); transform: scale(1.005); }
  .dz-icon { font-size: 36px; flex-shrink: 0; }
  .dz-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
  .dz-sub { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
  .dz-chips { display: flex; gap: 5px; flex-wrap: wrap; }
  .chip { background: var(--bg); border: 1px solid var(--border); border-radius: 20px;
    padding: 2px 8px; font-size: 11px; font-weight: 600; color: var(--muted); }
  .btn-browse { flex-shrink: 0; margin-left: auto; background: var(--surface);
    border: 1.5px solid var(--border); border-radius: 8px; padding: 9px 18px;
    font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text);
    transition: all .15s; white-space: nowrap; }
  .btn-browse:hover { border-color: var(--accent); color: var(--accent); }

  /* UPLOAD PROGRESS */
  .section-row { display: flex; align-items: center; justify-content: space-between; }
  .section-title { font-size: 13px; font-weight: 700; color: var(--text); }
  .section-sub { font-size: 12px; color: var(--muted); cursor: pointer; }
  .section-sub:hover { color: var(--accent); }
  .upload-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .upload-item { background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
    padding: 10px 14px; display: flex; align-items: center; gap: 12px; }
  .upload-icon { width: 36px; height: 36px; border-radius: 6px; display: grid;
    place-items: center; font-size: 18px; flex-shrink: 0; }
  .upload-info { flex: 1; min-width: 0; }
  .upload-name { font-size: 13px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .upload-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .progress-track { background: var(--bg); border-radius: 99px; height: 4px; margin-top: 6px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), #F59E0B);
    position: relative; transition: width .4s ease; }
  .progress-fill::after { content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);
    animation:shimmer 1.2s infinite; }
  @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  .upload-pct { font-size: 12px; font-weight: 700; color: var(--accent); white-space: nowrap; }

  /* FILE GRID */
  .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
  .file-card { background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--radius); overflow: hidden; cursor: pointer;
    transition: all .18s; position: relative;
    animation: fadeUp .3s ease both; }
  .file-card:hover { border-color: var(--accent); box-shadow: var(--shadow); transform: translateY(-2px); }
  .file-card.selected { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-l); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .thumb { height: 110px; display: grid; place-items: center; font-size: 38px;
    position: relative; overflow: hidden; }
  .thumb-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.42);
    display: flex; align-items: center; justify-content: center; gap: 6px;
    opacity: 0; transition: opacity .18s; }
  .file-card:hover .thumb-overlay { opacity: 1; }
  .ov-btn { background: rgba(255,255,255,.9); border: none; border-radius: 6px;
    padding: 5px 8px; font-size: 13px; cursor: pointer; }
  .ov-btn:hover { background: #fff; }
  .file-checkbox { position: absolute; top: 8px; left: 8px; width: 20px; height: 20px;
    border-radius: 6px; border: 2px solid rgba(255,255,255,.7); background: rgba(255,255,255,.2);
    display: grid; place-items: center; backdrop-filter: blur(4px);
    transition: all .15s; cursor: pointer; }
  .file-card.selected .file-checkbox,
  .file-card:hover .file-checkbox { border-color: var(--accent); background: var(--accent); }
  .check-mark { opacity: 0; font-size: 12px; color: #fff; }
  .file-card.selected .check-mark { opacity: 1; }
  .badge { position: absolute; top: 8px; right: 8px; color: #fff;
    font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 20px;
    letter-spacing: .04em; text-transform: uppercase; }
  .badge-new    { background: var(--ok); }
  .badge-proc   { background: var(--purple); }
  .badge-shared { background: var(--blue); }

  .file-info { padding: 10px; }
  .file-name { font-size: 12px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .file-meta { font-size: 11px; color: var(--muted); display: flex; justify-content: space-between; }

  /* LIST VIEW */
  .file-list { display: flex; flex-direction: column; gap: 4px; }
  .file-row { background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    display: flex; align-items: center; gap: 12px; padding: 10px 14px;
    cursor: pointer; transition: all .15s; }
  .file-row:hover { border-color: var(--accent); }
  .file-row.selected { border-color: var(--accent); background: var(--accent-l); }
  .row-icon { font-size: 20px; flex-shrink: 0; }
  .row-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-type { width: 90px; font-size: 12px; color: var(--muted); }
  .row-size { width: 70px; font-size: 12px; color: var(--muted); text-align: right; }
  .row-date { width: 100px; font-size: 12px; color: var(--muted); text-align: right; }

  /* FLOATING ACTION BAR */
  #action-bar { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px);
    background: var(--text); color: #fff; border-radius: 14px; padding: 10px 16px;
    display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-lg);
    transition: transform .28s cubic-bezier(.34,1.56,.64,1); z-index: 200; white-space: nowrap; }
  #action-bar.visible { transform: translateX(-50%) translateY(0); }
  .ab-count { font-size: 13px; font-weight: 700; padding-right: 10px;
    border-right: 1px solid rgba(255,255,255,.2); }
  .ab-actions { display: flex; gap: 4px; }
  .ab-btn { background: rgba(255,255,255,.12); border: none; border-radius: 8px;
    padding: 6px 12px; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer;
    transition: background .15s; display: flex; align-items: center; gap: 5px; }
  .ab-btn:hover { background: rgba(255,255,255,.22); }
  .ab-btn.danger:hover { background: rgba(220,38,38,.5); }
  .ab-close { background: none; border: none; color: rgba(255,255,255,.5);
    font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1; }
  .ab-close:hover { color: #fff; }

  /* DETAIL PANEL */
  #detail-panel { position: fixed; right: 0; top: var(--topbar-h); bottom: 0; width: 300px;
    background: var(--surface); border-left: 1px solid var(--border);
    transform: translateX(100%); transition: transform .25s ease; z-index: 150;
    display: flex; flex-direction: column; }
  #detail-panel.open { transform: translateX(0); }
  .dp-header { padding: 16px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center; }
  .dp-title { font-size: 14px; font-weight: 700; }
  .dp-close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--muted); }
  .dp-preview { height: 160px; background: var(--bg); display: grid; place-items: center;
    font-size: 56px; border-bottom: 1px solid var(--border); }
  .dp-body { padding: 16px; flex: 1; overflow-y: auto; }
  .dp-filename { font-size: 15px; font-weight: 700; margin-bottom: 16px; word-break: break-all; }
  .dp-row { display: flex; justify-content: space-between; padding: 8px 0;
    border-bottom: 1px solid var(--border); font-size: 12px; }
  .dp-label { color: var(--muted); }
  .dp-val { font-weight: 600; color: var(--text); }
  .dp-actions { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  .dp-btn { flex: 1; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: opacity .15s; border: 1.5px solid var(--border);
    background: var(--surface); color: var(--text); }
  .dp-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  .dp-btn:hover { opacity: .82; }

  /* CONTEXT MENU */
  #ctx-menu { position: fixed; background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; box-shadow: var(--shadow-lg); padding: 4px; min-width: 180px;
    z-index: 300; display: none; }
  #ctx-menu.open { display: block; animation: menuIn .12s ease; }
  @keyframes menuIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  .ctx-item { padding: 7px 12px; border-radius: 7px; font-size: 13px; cursor: pointer;
    display: flex; align-items: center; gap: 8px; color: var(--text); }
  .ctx-item:hover { background: var(--bg); }
  .ctx-item.danger { color: var(--danger); }
  .ctx-item.danger:hover { background: #FEF2F2; }
  .ctx-sep { height: 1px; background: var(--border); margin: 4px 0; }

  /* CMD PALETTE */
  #cmd-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5);
    z-index: 400; display: none; place-items: start center; padding-top: 100px;
    backdrop-filter: blur(4px); }
  #cmd-overlay.open { display: grid; animation: fadeIn .15s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .cmd-box { background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; width: min(560px, 90vw); overflow: hidden;
    box-shadow: var(--shadow-lg); animation: cmdIn .18s cubic-bezier(.34,1.56,.64,1); }
  @keyframes cmdIn { from{opacity:0;transform:translateY(-20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .cmd-top { display: flex; align-items: center; gap: 10px; padding: 14px 16px;
    border-bottom: 1px solid var(--border); }
  .cmd-input { flex: 1; border: none; outline: none; font-size: 15px; background: none; color: var(--text); }
  .cmd-esc-btn { background: var(--border); border: none; border-radius: 5px; padding: 2px 7px;
    font-size: 11px; font-family: monospace; color: var(--muted); cursor: pointer; }
  .cmd-sec { padding: 8px 12px 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .08em; color: var(--muted); }
  .cmd-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer;
    font-size: 13px; color: var(--text); border-radius: 7px; margin: 1px 4px; }
  .cmd-item:hover, .cmd-item.hi { background: var(--accent-l); }
  .cmd-item-icon { font-size: 16px; width: 24px; text-align: center; }
  .cmd-item-label { flex: 1; }
  .cmd-item-kbd { font-size: 11px; font-family: monospace; background: var(--border);
    border-radius: 4px; padding: 2px 6px; color: var(--muted); }
  .cmd-footer-row { padding: 8px 16px; border-top: 1px solid var(--border);
    display: flex; gap: 12px; font-size: 11px; color: var(--muted); }

  /* TOASTS */
  #toast-stack { position: fixed; bottom: 20px; right: 20px; z-index: 500;
    display: flex; flex-direction: column; gap: 8px; }
  .toast { background: var(--text); color: #fff; border-radius: 10px;
    padding: 11px 16px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg);
    display: flex; align-items: center; gap: 10px; min-width: 220px;
    animation: toastIn .25s cubic-bezier(.34,1.56,.64,1); }
  .toast.out { animation: toastOut .2s ease forwards; }
  @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastOut { to{opacity:0;transform:translateX(40px)} }
</style>
</head>
<body>

<!-- TOP BAR -->
<header id="topbar">
  <a class="logo" href="#">
    <div class="logo-dot">S</div> Sol
  </a>
  <div class="breadcrumb">
    <span style="color:var(--muted)">All Files</span>
    <span style="opacity:.4;margin:0 4px">/</span>
    <span>Projects</span>
  </div>
  <div class="search-wrap">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="Search files…" id="search-input">
    <span class="kbd-hint" onclick="openCmd()">⌘K</span>
  </div>
  <div class="topbar-right">
    <button class="icon-btn" title="Notifications">🔔</button>
    <button class="icon-btn" title="Settings">⚙️</button>
    <button class="btn-upload" onclick="toast('📁 File picker opened')">⬆ Upload</button>
    <div class="avatar" title="Rakis">R</div>
  </div>
</header>

<!-- SIDEBAR -->
<nav id="sidebar">
  <div class="sidebar-label">Library</div>
  <div class="nav-item active"><span class="ni-icon">📂</span> All Files <span class="ni-count">248</span></div>
  <div class="nav-item"><span class="ni-icon">🕐</span> Recent <span class="ni-count">12</span></div>
  <div class="nav-item"><span class="ni-icon">⭐</span> Starred <span class="ni-count">7</span></div>
  <div class="sidebar-label" style="margin-top:8px">By Type</div>
  <div class="nav-item"><span class="ni-icon">🖼</span> Images <span class="ni-count">84</span></div>
  <div class="nav-item"><span class="ni-icon">📄</span> Documents <span class="ni-count">63</span></div>
  <div class="nav-item"><span class="ni-icon">🎬</span> Video <span class="ni-count">21</span></div>
  <div class="nav-item"><span class="ni-icon">🎵</span> Audio <span class="ni-count">18</span></div>
  <div class="nav-item"><span class="ni-icon">🗃</span> Other <span class="ni-count">62</span></div>
  <div class="sidebar-label" style="margin-top:8px">Team</div>
  <div class="nav-item"><span class="ni-icon">🤝</span> Shared <span class="ni-count">34</span></div>
  <div class="nav-item"><span class="ni-icon">📤</span> My Shares <span class="ni-count">9</span></div>
  <div class="nav-item" style="color:var(--danger)"><span class="ni-icon">🗑</span> Trash</div>
  <div style="flex:1"></div>
  <div class="storage-card">
    <div style="font-size:11px;color:var(--muted);margin-bottom:6px">Storage</div>
    <div class="storage-bar"><div class="storage-fill" id="storage-fill"></div></div>
    <div class="storage-nums"><span><strong>3.8 GB</strong> used</span><span>10 GB</span></div>
  </div>
</nav>

<!-- MAIN -->
<main id="main">

  <!-- TOOLBAR -->
  <div class="toolbar">
    <div class="tab-group">
      <div class="tab active">All</div>
      <div class="tab">Recent</div>
      <div class="tab">Timeline</div>
    </div>
    <select class="sort-select">
      <option>Modified: Newest</option>
      <option>Modified: Oldest</option>
      <option>Name A–Z</option>
      <option>Size: Largest</option>
    </select>
    <div class="spacer"></div>
    <div class="view-toggle">
      <button class="vt-btn active" id="btn-grid" title="Grid">⊞</button>
      <button class="vt-btn" id="btn-list" title="List">☰</button>
    </div>
  </div>

  <!-- DROP ZONE -->
  <div class="drop-zone" id="drop-zone">
    <div class="dz-icon">☁️</div>
    <div>
      <div class="dz-title">Drop files to upload instantly</div>
      <div class="dz-sub">Files are indexed and processed automatically</div>
      <div class="dz-chips">
        <span class="chip">PNG</span><span class="chip">JPG</span><span class="chip">PDF</span>
        <span class="chip">MP4</span><span class="chip">CSV</span><span class="chip">ZIP</span>
        <span class="chip">+ more</span>
      </div>
    </div>
    <button class="btn-browse" onclick="toast('📂 File picker opened')">Browse files</button>
  </div>

  <!-- ACTIVE UPLOADS -->
  <div id="uploads-section">
    <div class="section-row">
      <div class="section-title">Uploading</div>
      <div class="section-sub" onclick="document.getElementById('uploads-section').style.display='none'">Clear all</div>
    </div>
    <div class="upload-list">
      <div class="upload-item">
        <div class="upload-icon" style="background:#FEF3C7">🖼</div>
        <div class="upload-info">
          <div class="upload-name">north-field-satellite-2026.jpg</div>
          <div class="upload-meta">4.2 MB · JPEG Image</div>
          <div class="progress-track"><div class="progress-fill" id="prog-bar" style="width:72%"></div></div>
        </div>
        <div class="upload-pct" id="prog-pct">72%</div>
      </div>
      <div class="upload-item">
        <div class="upload-icon" style="background:#DCFCE7">📄</div>
        <div class="upload-info">
          <div class="upload-name">season-report-spring-2026.pdf</div>
          <div class="upload-meta">1.8 MB · PDF · Upload complete</div>
          <div class="progress-track"><div class="progress-fill" style="width:100%;animation:none"></div></div>
        </div>
        <div style="font-size:16px">✅</div>
      </div>
    </div>
  </div>

  <!-- FILES -->
  <div>
    <div class="section-row">
      <div class="section-title">All Files</div>
      <div class="section-sub">248 files</div>
    </div>
    <div style="height:10px"></div>
    <div id="file-container"></div>
  </div>

</main>

<!-- FLOATING ACTION BAR -->
<div id="action-bar">
  <div class="ab-count"><span id="ab-num">0</span> selected</div>
  <div class="ab-actions">
    <button class="ab-btn" onclick="toast('⬇ Downloading…')">⬇ Download</button>
    <button class="ab-btn" onclick="toast('🔗 Link copied!')">🔗 Share</button>
    <button class="ab-btn" onclick="toast('📁 Move dialog…')">📁 Move</button>
    <button class="ab-btn danger" onclick="toast('🗑 Moved to trash')">🗑 Delete</button>
  </div>
  <button class="ab-close" onclick="clearSel()">✕</button>
</div>

<!-- DETAIL PANEL -->
<div id="detail-panel">
  <div class="dp-header">
    <div class="dp-title">File Details</div>
    <button class="dp-close" onclick="closeDetail()">✕</button>
  </div>
  <div class="dp-preview" id="dp-icon">🖼</div>
  <div class="dp-body">
    <div class="dp-filename" id="dp-name">—</div>
    <div class="dp-row"><span class="dp-label">Size</span><span class="dp-val" id="dp-size">—</span></div>
    <div class="dp-row"><span class="dp-label">Type</span><span class="dp-val" id="dp-type">—</span></div>
    <div class="dp-row"><span class="dp-label">Modified</span><span class="dp-val" id="dp-date">—</span></div>
    <div class="dp-row"><span class="dp-label">Dimensions</span><span class="dp-val" id="dp-dims">—</span></div>
    <div class="dp-row"><span class="dp-label">Owner</span><span class="dp-val">Rakis</span></div>
  </div>
  <div class="dp-actions">
    <button class="dp-btn" onclick="toast('⬇ Downloading…')">⬇ Download</button>
    <button class="dp-btn primary" onclick="toast('🔗 Link copied!')">🔗 Share</button>
  </div>
</div>

<!-- CONTEXT MENU -->
<div id="ctx-menu">
  <div class="ctx-item" onclick="closeCtx();openDetail(ctxIdx)">👁 Preview</div>
  <div class="ctx-item" onclick="closeCtx();toast('⬇ Downloading…')">⬇ Download</div>
  <div class="ctx-item" onclick="closeCtx();toast('🔗 Link copied!')">🔗 Copy link</div>
  <div class="ctx-item" onclick="closeCtx();toast('✏️ Rename…')">✏️ Rename</div>
  <div class="ctx-item" onclick="closeCtx();toast('📁 Move dialog…')">📁 Move to…</div>
  <div class="ctx-item" onclick="closeCtx();toast('⭐ Starred!')">⭐ Star</div>
  <div class="ctx-sep"></div>
  <div class="ctx-item danger" onclick="closeCtx();toast('🗑 Moved to trash')">🗑 Move to Trash</div>
</div>

<!-- COMMAND PALETTE -->
<div id="cmd-overlay" onclick="if(event.target===this)closeCmd()">
  <div class="cmd-box">
    <div class="cmd-top">
      <span style="color:var(--muted)">🔍</span>
      <input class="cmd-input" id="cmd-input" placeholder="Search files, actions…">
      <button class="cmd-esc-btn" onclick="closeCmd()">ESC</button>
    </div>
    <div class="cmd-sec">Recent Files</div>
    <div class="cmd-item hi"><span class="cmd-item-icon">🖼</span><span class="cmd-item-label">north-field-satellite-2026.jpg</span><span class="cmd-item-kbd">↵</span></div>
    <div class="cmd-item"><span class="cmd-item-icon">📄</span><span class="cmd-item-label">season-report-spring-2026.pdf</span></div>
    <div class="cmd-item"><span class="cmd-item-icon">🎬</span><span class="cmd-item-label">zone-c-drone-footage.mp4</span></div>
    <div class="cmd-sec">Quick Actions</div>
    <div class="cmd-item" onclick="closeCmd();toast('⬆ Upload dialog…')"><span class="cmd-item-icon">⬆</span><span class="cmd-item-label">Upload files</span><span class="cmd-item-kbd">⌘U</span></div>
    <div class="cmd-item" onclick="closeCmd();toast('📁 New folder created')"><span class="cmd-item-icon">📁</span><span class="cmd-item-label">New folder</span><span class="cmd-item-kbd">⌘⇧N</span></div>
    <div class="cmd-item" onclick="closeCmd();toast('🔗 Share dialog…')"><span class="cmd-item-icon">🔗</span><span class="cmd-item-label">Share with team</span></div>
    <div class="cmd-footer-row"><span>↑↓ navigate</span><span>↵ open</span><span>ESC close</span></div>
  </div>
</div>

<!-- TOAST -->
<div id="toast-stack"></div>

<script>
const FILES = [
  {name:'north-field-2026.jpg',    icon:'🖼', bg:'#FEF3C7', size:'4.2 MB', type:'JPEG Image', date:'Apr 4, 2026', dims:'4032×3024', badge:'new'},
  {name:'zone-b-aerial.jpg',       icon:'🖼', bg:'#FEF3C7', size:'3.8 MB', type:'JPEG Image', date:'Apr 3, 2026', dims:'4032×3024', badge:''},
  {name:'soil-sample-a.jpg',       icon:'🖼', bg:'#FEF3C7', size:'1.1 MB', type:'JPEG Image', date:'Apr 3, 2026', dims:'2048×1536', badge:''},
  {name:'season-report.pdf',       icon:'📄', bg:'#FEE2E2', size:'1.8 MB', type:'PDF',        date:'Apr 2, 2026', dims:'—',         badge:'shared'},
  {name:'soil-analysis-q1.pdf',    icon:'📄', bg:'#FEE2E2', size:'2.3 MB', type:'PDF',        date:'Mar 28',     dims:'—',         badge:''},
  {name:'zone-c-drone.mp4',        icon:'🎬', bg:'#EDE9FE', size:'128 MB', type:'MP4 Video',  date:'Apr 1, 2026', dims:'4K UHD',    badge:'proc'},
  {name:'west-timelapse.mp4',      icon:'🎬', bg:'#EDE9FE', size:'74 MB',  type:'MP4 Video',  date:'Mar 29',     dims:'1080p',     badge:''},
  {name:'yield-projections.xlsx',  icon:'📊', bg:'#DCFCE7', size:'380 KB', type:'Spreadsheet',date:'Apr 2, 2026', dims:'—',         badge:''},
  {name:'sensor-data-march.csv',   icon:'📋', bg:'#DCFCE7', size:'42 KB',  type:'CSV',        date:'Mar 31',     dims:'—',         badge:''},
  {name:'field-assets.zip',        icon:'🗜', bg:'#F3F4F6', size:'220 MB', type:'ZIP Archive', date:'Mar 25',     dims:'—',         badge:''},
  {name:'ambient-field.m4a',       icon:'🎵', bg:'#FFF0F5', size:'8.4 MB', type:'Audio',      date:'Mar 20',     dims:'—',         badge:''},
  {name:'sensor-config.json',      icon:'📝', bg:'#F0FDF4', size:'12 KB',  type:'JSON',       date:'Mar 18',     dims:'—',         badge:''},
];

const sel = new Set();
let ctxIdx = 0;
let gridView = true;

const BADGE_HTML = {
  new:    '<div class="badge badge-new">New</div>',
  proc:   '<div class="badge badge-proc">Processing</div>',
  shared: '<div class="badge badge-shared">Shared</div>',
};

function renderGrid() {
  return '<div class="file-grid">' + FILES.map((f,i) => {
    const isSel = sel.has(i);
    return \`<div class="file-card \${isSel?'selected':''}" style="animation-delay:\${i*.04}s"
        onclick="toggleSel(event,\${i})" oncontextmenu="openCtx(event,\${i})">
      <div class="thumb" style="background:\${f.bg}">
        <span>\${f.icon}</span>
        <div class="thumb-overlay">
          <button class="ov-btn" onclick="event.stopPropagation();openDetail(\${i})">⤢</button>
          <button class="ov-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="file-checkbox" onclick="event.stopPropagation();toggleSel(event,\${i})">
          <span class="check-mark">✓</span>
        </div>
        \${f.badge ? BADGE_HTML[f.badge] : ''}
      </div>
      <div class="file-info">
        <div class="file-name">\${f.name}</div>
        <div class="file-meta"><span>\${f.size}</span><span>\${f.type.split(' ')[0]}</span></div>
      </div>
    </div>\`;
  }).join('') + '</div>';
}

function renderList() {
  return '<div class="file-list">' + FILES.map((f,i) => {
    const isSel = sel.has(i);
    return \`<div class="file-row \${isSel?'selected':''}"
        onclick="toggleSel(event,\${i})" oncontextmenu="openCtx(event,\${i})">
      <span class="row-icon">\${f.icon}</span>
      <span class="row-name">\${f.name}</span>
      <span class="row-type">\${f.type}</span>
      <span class="row-size">\${f.size}</span>
      <span class="row-date">\${f.date}</span>
    </div>\`;
  }).join('') + '</div>';
}

function render() {
  document.getElementById('file-container').innerHTML = gridView ? renderGrid() : renderList();
}

function toggleSel(e, idx) {
  if (sel.has(idx)) sel.delete(idx); else sel.add(idx);
  render(); updateAB();
}
function updateAB() {
  const bar = document.getElementById('action-bar');
  document.getElementById('ab-num').textContent = sel.size;
  sel.size > 0 ? bar.classList.add('visible') : bar.classList.remove('visible');
}
function clearSel() { sel.clear(); render(); updateAB(); }

function openDetail(idx) {
  const f = FILES[idx];
  document.getElementById('dp-icon').textContent = f.icon;
  document.getElementById('dp-icon').style.background = f.bg;
  document.getElementById('dp-name').textContent = f.name;
  document.getElementById('dp-size').textContent = f.size;
  document.getElementById('dp-type').textContent = f.type;
  document.getElementById('dp-date').textContent = f.date;
  document.getElementById('dp-dims').textContent = f.dims;
  document.getElementById('detail-panel').classList.add('open');
}
function closeDetail() { document.getElementById('detail-panel').classList.remove('open'); }

const ctxMenu = document.getElementById('ctx-menu');
function openCtx(e, idx) {
  e.preventDefault(); ctxIdx = idx;
  ctxMenu.style.left = Math.min(e.clientX, innerWidth-200) + 'px';
  ctxMenu.style.top  = Math.min(e.clientY, innerHeight-260) + 'px';
  ctxMenu.classList.add('open');
}
function closeCtx() { ctxMenu.classList.remove('open'); }
document.addEventListener('click', closeCtx);

function openCmd() {
  document.getElementById('cmd-overlay').classList.add('open');
  setTimeout(() => document.getElementById('cmd-input').focus(), 50);
}
function closeCmd() { document.getElementById('cmd-overlay').classList.remove('open'); }

document.addEventListener('keydown', e => {
  if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); openCmd(); }
  if (e.key==='Escape') { closeCmd(); closeDetail(); }
});

document.getElementById('search-input').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.file-card,.file-row').forEach((el,i) => {
    el.style.display = FILES[i] && FILES[i].name.toLowerCase().includes(q) ? '' : 'none';
  });
});

const dz = document.getElementById('drop-zone');
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
dz.addEventListener('drop', e => {
  e.preventDefault(); dz.classList.remove('drag-over');
  toast('\u2B06 Uploading ' + e.dataTransfer.files.length + ' file(s)\u2026');
});

document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
  });
});

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
    item.classList.add('active');
  });
});

document.getElementById('btn-grid').addEventListener('click', () => {
  gridView = true; render();
  document.getElementById('btn-grid').classList.add('active');
  document.getElementById('btn-list').classList.remove('active');
});
document.getElementById('btn-list').addEventListener('click', () => {
  gridView = false; render();
  document.getElementById('btn-list').classList.add('active');
  document.getElementById('btn-grid').classList.remove('active');
});

function toast(msg) {
  const stack = document.getElementById('toast-stack');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 3000);
}

// Upload progress animation
let pct = 72;
const bar = document.getElementById('prog-bar');
const pctEl = document.getElementById('prog-pct');
const ticker = setInterval(() => {
  pct = Math.min(100, pct + Math.random() * 5);
  bar.style.width = pct + '%';
  pctEl.textContent = Math.round(pct) + '%';
  if (pct >= 100) {
    clearInterval(ticker);
    pctEl.textContent = '';
    bar.style.animation = 'none';
    pctEl.innerHTML = '\u2705';
    toast('\u2705 north-field-satellite-2026.jpg uploaded');
  }
}, 900);

setTimeout(() => { document.getElementById('storage-fill').style.width = '38%'; }, 400);

render();
</script>
</body>
</html>`;

function publish(slug, title, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Publishing SOL file management mockup...');
  const res = await publish(SLUG, TITLE, html);
  console.log(`${SLUG} -> ${res.status} — https://ram.zenbin.org/${SLUG}`);
  if (res.status !== 200 && res.status !== 201) console.error(res.body.slice(0,200));
}

main().catch(console.error);
