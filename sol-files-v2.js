#!/usr/bin/env node
'use strict';
const https = require('https');

const SLUG  = 'sol-files';
const TITLE = 'SOL — Data Import & File Management';

/* ── publish helper ────────────────────────────────────────────────────────── */
function publish(slug, title, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ html, title, overwrite: true });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    'ram',
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

/* ══════════════════════════════════════════════════════════════════════════════
   SOL — DATA IMPORT & FILE MANAGEMENT  ·  SOTA mockup
   Palette: Cream #F7F5F0 | Amber #D97706 | Warm Black #1C1612 | Sage #4A7C6A
══════════════════════════════════════════════════════════════════════════════ */
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${TITLE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #F7F5F0;
  --surface:   #FFFFFF;
  --surface2:  #FDFCF9;
  --border:    #EAE5DC;
  --border2:   #DDD7CC;
  --text:      #1C1612;
  --text2:     #5C5248;
  --muted:     #9A9088;
  --amber:     #D97706;
  --amber-l:   #FEF9EE;
  --amber-m:   #FDE68A;
  --amber-d:   #B45309;
  --sage:      #4A7C6A;
  --sage-l:    #EEF5F2;
  --rose:      #C4607A;
  --rose-l:    #FDF0F3;
  --blue:      #3B6EAF;
  --blue-l:    #EEF3FA;
  --purple:    #7C5CB4;
  --purple-l:  #F3F0FA;
  --green:     #2D8A5A;
  --green-l:   #EDFAF3;
  --red:       #C0392B;
  --red-l:     #FDECEA;
  --sidebar-w: 232px;
  --topbar-h:  56px;
  --radius:    10px;
  --shadow:    0 1px 3px rgba(28,22,18,.07), 0 4px 12px rgba(28,22,18,.05);
  --shadow-md: 0 4px 16px rgba(28,22,18,.10), 0 1px 3px rgba(28,22,18,.06);
  --shadow-lg: 0 12px 40px rgba(28,22,18,.14), 0 2px 8px rgba(28,22,18,.08);
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 13px;
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: var(--topbar-h) 1fr;
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-areas: "topbar topbar" "sidebar main";
}

/* ── TOP BAR ── */
#topbar {
  grid-area: topbar;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  z-index: 200;
}

.logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-mark {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #D97706, #F59E0B);
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  font-family: 'Playfair Display', serif;
  box-shadow: 0 2px 6px rgba(217,119,6,.35);
}
.logo-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--text);
  letter-spacing: -.01em;
}

.topbar-divider { width: 1px; height: 20px; background: var(--border); flex-shrink: 0; }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--muted);
}
.breadcrumb a { color: var(--muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--text); }
.breadcrumb .current { color: var(--text); font-weight: 500; }
.bc-sep { font-size: 11px; color: var(--border2); }

.search-wrap {
  flex: 1;
  max-width: 420px;
  position: relative;
  margin-left: 8px;
}
.search-wrap input {
  width: 100%;
  padding: 8px 40px 8px 36px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-size: 13px;
  color: var(--text);
  font-family: inherit;
  outline: none;
  transition: all .15s;
}
.search-wrap input:focus { border-color: var(--amber); background: #fff; box-shadow: 0 0 0 3px rgba(217,119,6,.1); }
.search-wrap input::placeholder { color: var(--muted); }
.s-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 14px; pointer-events: none; }
.s-kbd {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  display: flex; gap: 2px;
}
.kbd { background: var(--border); border: 1px solid var(--border2); border-radius: 4px; padding: 1px 5px; font-size: 10px; color: var(--muted); font-family: monospace; }

.topbar-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }

.icon-btn {
  width: 36px; height: 36px;
  background: none; border: 1.5px solid transparent;
  border-radius: 9px; cursor: pointer;
  display: grid; place-items: center;
  color: var(--muted); font-size: 16px;
  transition: all .15s; position: relative;
}
.icon-btn:hover { background: var(--bg); border-color: var(--border); color: var(--text); }
.notif-dot {
  position: absolute; top: 6px; right: 6px;
  width: 7px; height: 7px;
  background: var(--rose); border-radius: 50%;
  border: 1.5px solid var(--surface);
}

.btn-import {
  background: var(--amber);
  color: #fff;
  border: none;
  border-radius: 9px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background .15s;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(217,119,6,.3);
}
.btn-import:hover { background: var(--amber-d); }

.avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--amber), #F59E0B);
  display: grid; place-items: center;
  color: #fff; font-weight: 700; font-size: 12px;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: var(--shadow);
}

/* ── SIDEBAR ── */
#sidebar {
  grid-area: sidebar;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 14px 0 20px;
}

.sid-section { padding: 0 10px; margin-bottom: 6px; }
.sid-label {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: var(--muted);
  padding: 8px 8px 4px;
}
.nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 8px; border-radius: 8px;
  cursor: pointer; color: var(--text2); font-size: 13px;
  transition: all .12s; user-select: none;
  position: relative;
}
.nav-item:hover { background: var(--bg); color: var(--text); }
.nav-item.active { background: var(--amber-l); color: var(--amber-d); font-weight: 600; }
.nav-item .ni-icon { font-size: 15px; width: 22px; text-align: center; flex-shrink: 0; }
.nav-item .ni-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ni-count {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 20px; padding: 1px 7px;
  font-size: 10.5px; font-weight: 600; color: var(--muted);
  flex-shrink: 0;
}
.nav-item.active .ni-count { background: rgba(217,119,6,.15); border-color: rgba(217,119,6,.2); color: var(--amber-d); }

/* Source pills */
.source-list { padding: 0 10px; display: flex; flex-direction: column; gap: 3px; }
.source-item {
  display: flex; align-items: center; gap: 9px;
  padding: 6px 8px; border-radius: 8px;
  cursor: pointer; font-size: 12px; color: var(--text2);
  transition: all .12s;
}
.source-item:hover { background: var(--bg); }
.src-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.src-name { flex: 1; font-weight: 500; }
.src-status { font-size: 10px; padding: 1px 6px; border-radius: 20px; font-weight: 600; }
.src-active { background: var(--green-l); color: var(--green); }
.src-paused { background: var(--bg); color: var(--muted); border: 1px solid var(--border); }
.src-error  { background: var(--red-l); color: var(--red); }

/* Storage widget */
.storage-card {
  margin: 16px 10px 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
}
.storage-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.storage-title { font-size: 11.5px; font-weight: 600; color: var(--text2); }
.storage-action { font-size: 11px; color: var(--amber); cursor: pointer; font-weight: 500; }
.storage-bar { background: var(--border); border-radius: 99px; height: 5px; overflow: hidden; }
.storage-fill {
  background: linear-gradient(90deg, var(--amber), #F59E0B);
  border-radius: 99px; height: 100%; width: 0;
  transition: width 1.4s cubic-bezier(.25,.1,.25,1);
}
.storage-nums { display: flex; justify-content: space-between; margin-top: 5px; }
.storage-nums span { font-size: 10.5px; color: var(--muted); }
.storage-nums strong { color: var(--text2); font-weight: 600; }

/* ── MAIN ── */
#main {
  grid-area: main;
  overflow-y: auto;
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

/* ── DROP ZONE ── */
#drop-zone {
  border: 2px dashed var(--border2);
  border-radius: 16px;
  background: var(--surface);
  padding: 0;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  overflow: hidden;
}
#drop-zone:hover, #drop-zone.drag-over {
  border-color: var(--amber);
  background: var(--amber-l);
  box-shadow: 0 0 0 4px rgba(217,119,6,.08);
}
#drop-zone.drag-over .dz-pulse { opacity: 1; }

.dz-inner {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
}

/* Left panel — drop target */
.dz-drop {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px 24px;
  border-right: 1px dashed var(--border2);
  min-height: 130px;
}
#drop-zone:hover .dz-drop, #drop-zone.drag-over .dz-drop { border-right-color: rgba(217,119,6,.3); }

.dz-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(217,119,6,.12), rgba(245,158,11,.08));
  border: 1.5px solid rgba(217,119,6,.2);
  display: grid; place-items: center;
  font-size: 24px;
  transition: transform .2s;
  position: relative;
}
#drop-zone:hover .dz-icon-wrap { transform: scale(1.06); }
.dz-icon-ring {
  position: absolute; inset: -5px;
  border: 2px dashed rgba(217,119,6,.25);
  border-radius: 18px;
  animation: spin-slow 8s linear infinite;
  opacity: 0;
  transition: opacity .2s;
}
#drop-zone:hover .dz-icon-ring { opacity: 1; }
@keyframes spin-slow { to { transform: rotate(360deg); } }

.dz-text { text-align: center; }
.dz-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
.dz-sub { font-size: 12px; color: var(--muted); line-height: 1.5; }
.dz-sub em { color: var(--amber); font-style: normal; font-weight: 600; cursor: pointer; }

.dz-formats {
  display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;
}
.fmt-chip {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text2);
  font-family: 'SF Mono', 'Fira Code', monospace;
  letter-spacing: .02em;
  transition: all .12s;
}
#drop-zone:hover .fmt-chip { border-color: rgba(217,119,6,.3); background: rgba(217,119,6,.05); }

/* Right panel — quick sources */
.dz-sources {
  width: 280px;
  flex-shrink: 0;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dz-sources-title {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--muted);
  margin-bottom: 2px;
}
.quick-source {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: 9px; padding: 8px 10px;
  cursor: pointer; transition: all .15s;
}
.quick-source:hover { border-color: var(--amber); background: var(--amber-l); transform: translateX(2px); }
.qs-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
.qs-name { font-size: 12px; font-weight: 600; color: var(--text); flex: 1; }
.qs-type { font-size: 10px; color: var(--muted); }
.qs-arrow { font-size: 11px; color: var(--muted); }

/* ── SECTION ROW ── */
.section-row {
  display: flex; align-items: center; justify-content: space-between;
}
.section-title { font-size: 13px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 7px; }
.section-title .s-badge {
  background: var(--amber-l); color: var(--amber-d);
  border-radius: 20px; padding: 1px 8px;
  font-size: 11px; font-weight: 600;
}
.section-link { font-size: 12px; color: var(--amber); cursor: pointer; font-weight: 500; }
.section-link:hover { color: var(--amber-d); }

/* ── UPLOAD PROGRESS ── */
.upload-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }

.upload-item {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 11px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all .15s;
  position: relative;
  overflow: hidden;
}
.upload-item:hover { border-color: var(--border2); box-shadow: var(--shadow); }
.upload-item::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 11px 0 0 11px;
}
.upload-item.uploading::before { background: var(--amber); }
.upload-item.processing::before { background: var(--purple); }
.upload-item.done::before { background: var(--green); }
.upload-item.error::before { background: var(--red); }

.u-icon {
  width: 38px; height: 38px;
  border-radius: 9px;
  display: grid; place-items: center;
  font-size: 20px; flex-shrink: 0;
}
.u-icon.csv   { background: #ECFDF5; }
.u-icon.pdf   { background: #FEF2F2; }
.u-icon.json  { background: #EFF6FF; }
.u-icon.xml   { background: #F5F3FF; }
.u-icon.xlsx  { background: #F0FDF4; }

.u-body { flex: 1; min-width: 0; }
.u-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.u-meta { font-size: 11px; color: var(--muted); margin-top: 2px; display: flex; gap: 8px; align-items: center; }
.u-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.u-status-dot.uploading { background: var(--amber); animation: pulse-dot 1s infinite; }
.u-status-dot.processing { background: var(--purple); animation: pulse-dot 1s infinite; }
.u-status-dot.done { background: var(--green); }
.u-status-dot.error { background: var(--red); }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }

.progress-track { background: var(--bg); border-radius: 99px; height: 3px; margin-top: 6px; overflow: hidden; }
.progress-fill {
  height: 100%; border-radius: 99px;
  position: relative;
  transition: width .6s ease;
}
.progress-fill.amber { background: linear-gradient(90deg, var(--amber), #F59E0B); }
.progress-fill.purple { background: linear-gradient(90deg, var(--purple), #9D77CC); }
.progress-fill.green { background: var(--green); }
.progress-fill.red { background: var(--red); }

.progress-fill.amber::after, .progress-fill.purple::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

.u-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.u-pct { font-size: 12px; font-weight: 700; color: var(--amber); min-width: 32px; text-align: right; }
.u-pct.done { color: var(--green); }
.u-pct.error { color: var(--red); }
.u-pct.proc { color: var(--purple); }
.u-cancel { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 14px; padding: 3px; border-radius: 4px; }
.u-cancel:hover { color: var(--red); background: var(--red-l); }

/* ── TOOLBAR ── */
.toolbar {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 11px;
  padding: 8px 12px;
}

.filter-tabs { display: flex; background: var(--bg); border-radius: 8px; padding: 2px; border: 1px solid var(--border); }
.ftab {
  padding: 5px 11px; border-radius: 6px;
  font-size: 12px; font-weight: 500; cursor: pointer;
  color: var(--muted); transition: all .15s; user-select: none;
  white-space: nowrap;
}
.ftab.active { background: var(--surface); color: var(--text); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }

.filter-btn {
  display: flex; align-items: center; gap: 5px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 7px; padding: 5px 10px;
  font-size: 12px; color: var(--text2); cursor: pointer;
  font-family: inherit; transition: all .12s;
}
.filter-btn:hover { border-color: var(--border2); background: #fff; }

.spacer { flex: 1; }

.view-toggle { display: flex; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 2px; }
.vt {
  width: 30px; height: 28px; border: none; background: none;
  border-radius: 6px; cursor: pointer;
  display: grid; place-items: center;
  color: var(--muted); font-size: 13px; transition: all .15s;
}
.vt.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.08); }

/* Multi-select floating bar */
#select-bar {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(80px);
  background: var(--text); color: #fff;
  border-radius: 14px; padding: 10px 16px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 300; font-size: 13px;
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
  white-space: nowrap;
}
#select-bar.visible { transform: translateX(-50%) translateY(0); }
.sb-count { font-weight: 700; color: var(--amber-m); }
.sb-divider { width: 1px; height: 16px; background: rgba(255,255,255,.2); }
.sb-btn {
  background: none; border: none; color: rgba(255,255,255,.8);
  font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 6px;
  font-family: inherit; font-weight: 500; transition: all .12s;
  display: flex; align-items: center; gap: 5px;
}
.sb-btn:hover { background: rgba(255,255,255,.12); color: #fff; }
.sb-btn.danger:hover { background: rgba(220,38,38,.25); color: #FCA5A5; }

/* ── FILE GRID ── */
.grid-head {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; color: var(--muted);
  padding: 0 4px;
  text-transform: uppercase; letter-spacing: .05em;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(178px, 1fr));
  gap: 12px;
}

.file-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: all .18s;
  position: relative;
  animation: fadeUp .3s ease both;
}
.file-card:hover { border-color: var(--amber); box-shadow: var(--shadow-md); transform: translateY(-2px); }
.file-card.selected { border-color: var(--amber); box-shadow: 0 0 0 3px rgba(217,119,6,.14); }
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.file-card:nth-child(2) { animation-delay: .04s; }
.file-card:nth-child(3) { animation-delay: .08s; }
.file-card:nth-child(4) { animation-delay: .12s; }
.file-card:nth-child(5) { animation-delay: .16s; }
.file-card:nth-child(6) { animation-delay: .20s; }

/* Thumb area */
.fc-thumb {
  height: 108px;
  display: flex; align-items: center; justify-content: center;
  font-size: 36px;
  position: relative;
  overflow: hidden;
}
.fc-thumb.csv    { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); }
.fc-thumb.pdf    { background: linear-gradient(135deg, #FEF2F2, #FEE2E2); }
.fc-thumb.json   { background: linear-gradient(135deg, #EFF6FF, #DBEAFE); }
.fc-thumb.xml    { background: linear-gradient(135deg, #F5F3FF, #EDE9FE); }
.fc-thumb.xlsx   { background: linear-gradient(135deg, #F0FDF4, #DCFCE7); }
.fc-thumb.zip    { background: linear-gradient(135deg, #FFFBEB, #FEF3C7); }

/* Decorative wave */
.fc-thumb::before {
  content: '';
  position: absolute;
  bottom: -15px; left: -15px; right: -15px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,.35);
}

.fc-overlay {
  position: absolute; inset: 0;
  background: rgba(28,22,18,.42);
  display: flex; align-items: center; justify-content: center; gap: 6px;
  opacity: 0; transition: opacity .18s;
}
.file-card:hover .fc-overlay { opacity: 1; }
.fco-btn {
  background: rgba(255,255,255,.92); border: none;
  border-radius: 7px; padding: 6px 9px;
  font-size: 12px; cursor: pointer; font-weight: 500;
  display: flex; align-items: center; gap: 4px;
  transition: background .1s;
}
.fco-btn:hover { background: #fff; }

/* Checkbox */
.fc-check {
  position: absolute; top: 8px; left: 8px;
  width: 21px; height: 21px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,.65);
  background: rgba(28,22,18,.25);
  backdrop-filter: blur(4px);
  display: grid; place-items: center;
  cursor: pointer; transition: all .15s;
  font-size: 11px; color: transparent;
}
.file-card.selected .fc-check,
.file-card:hover .fc-check { border-color: var(--amber); background: var(--amber); color: #fff; }
.file-card.selected .fc-check::after { content: '✓'; color: #fff; font-size: 12px; font-weight: 700; }

/* Status badge */
.fc-badge {
  position: absolute; top: 8px; right: 8px;
  font-size: 9px; font-weight: 800; letter-spacing: .04em;
  text-transform: uppercase; padding: 2px 7px;
  border-radius: 20px; color: #fff;
}
.badge-new   { background: var(--green); }
.badge-proc  { background: var(--purple); }
.badge-sync  { background: var(--blue); }
.badge-err   { background: var(--red); }

/* File info */
.fc-info { padding: 9px 10px; }
.fc-name {
  font-size: 12px; font-weight: 600; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 4px;
}
.fc-meta { display: flex; justify-content: space-between; align-items: center; }
.fc-type {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  padding: 1px 5px; border-radius: 4px; font-family: monospace;
}
.type-csv  { background: #D1FAE5; color: #065F46; }
.type-pdf  { background: #FEE2E2; color: #991B1B; }
.type-json { background: #DBEAFE; color: #1E40AF; }
.type-xml  { background: #EDE9FE; color: #5B21B6; }
.type-xlsx { background: #DCFCE7; color: #166534; }
.type-zip  { background: #FEF3C7; color: #92400E; }
.fc-size { font-size: 10.5px; color: var(--muted); }
.fc-date { font-size: 10px; color: var(--muted); margin-top: 3px; }

/* Context menu */
.ctx-menu {
  position: absolute; top: 0; right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 4px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  opacity: 0; pointer-events: none; transform: scale(.9) translateY(-4px);
  transition: all .15s cubic-bezier(.34,1.56,.64,1);
  min-width: 140px;
}
.file-card:hover .ctx-menu { opacity: 1; pointer-events: auto; transform: scale(1) translateY(0); }
.ctx-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: 6px; cursor: pointer;
  font-size: 12px; color: var(--text2); transition: all .1s;
}
.ctx-item:hover { background: var(--bg); color: var(--text); }
.ctx-item.danger { color: var(--red); }
.ctx-item.danger:hover { background: var(--red-l); }
.ctx-icon { font-size: 13px; width: 18px; text-align: center; }

/* ── DETAIL PANEL OVERLAY ── */
#detail-panel {
  position: fixed; right: 0; top: var(--topbar-h);
  width: 320px; height: calc(100vh - var(--topbar-h));
  background: var(--surface);
  border-left: 1px solid var(--border);
  z-index: 150;
  transform: translateX(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
  display: flex; flex-direction: column;
  overflow: hidden;
}
#detail-panel.open { transform: translateX(0); box-shadow: var(--shadow-lg); }

.dp-header {
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
}
.dp-back { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 16px; }
.dp-back:hover { color: var(--text); }
.dp-title { font-size: 14px; font-weight: 700; color: var(--text); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dp-close { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 16px; }
.dp-close:hover { color: var(--text); }

.dp-thumb {
  height: 140px; display: grid; place-items: center; font-size: 52px;
}
.dp-thumb.csv  { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); }
.dp-thumb.pdf  { background: linear-gradient(135deg, #FEF2F2, #FEE2E2); }
.dp-thumb.json { background: linear-gradient(135deg, #EFF6FF, #DBEAFE); }
.dp-thumb.xml  { background: linear-gradient(135deg, #F5F3FF, #EDE9FE); }
.dp-thumb.xlsx { background: linear-gradient(135deg, #F0FDF4, #DCFCE7); }

.dp-body { flex: 1; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }

.dp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dp-field { background: var(--bg); border-radius: 8px; padding: 10px 12px; }
.dp-field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); margin-bottom: 4px; }
.dp-field-value { font-size: 12px; font-weight: 600; color: var(--text); }
.dp-field-value.green { color: var(--green); }
.dp-field-value.amber { color: var(--amber); }

.dp-section { }
.dp-section-title { font-size: 11px; font-weight: 700; color: var(--text2); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }

.dp-preview {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; overflow: hidden;
}
.dp-preview-head {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0; border-bottom: 1px solid var(--border);
}
.dp-ph-cell {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; color: var(--muted);
  padding: 6px 8px; background: rgba(0,0,0,.02);
  border-right: 1px solid var(--border);
}
.dp-ph-cell:last-child { border-right: none; }
.dp-row-data {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid var(--border);
}
.dp-row-data:last-child { border-bottom: none; }
.dp-cell { font-size: 10.5px; color: var(--text2); padding: 5px 8px; border-right: 1px solid var(--border); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dp-cell:last-child { border-right: none; }

.dp-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.dp-tag { background: var(--amber-l); color: var(--amber-d); border-radius: 20px; padding: 2px 8px; font-size: 10.5px; font-weight: 600; }

.dp-actions { padding: 14px 18px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
.dp-btn {
  flex: 1; border: none; border-radius: 9px; padding: 9px;
  font-size: 12px; font-weight: 600; font-family: inherit;
  cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.dp-btn.primary { background: var(--amber); color: #fff; box-shadow: 0 2px 6px rgba(217,119,6,.25); }
.dp-btn.primary:hover { background: var(--amber-d); }
.dp-btn.secondary { background: var(--bg); border: 1.5px solid var(--border); color: var(--text2); }
.dp-btn.secondary:hover { border-color: var(--border2); background: #fff; }

/* ── EMPTY STATE ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px; gap: 12px; text-align: center;
  color: var(--muted);
}
.empty-icon { font-size: 40px; opacity: .5; }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text2); }
.empty-sub { font-size: 12px; max-width: 260px; line-height: 1.6; }

/* ── TOAST ── */
#toast {
  position: fixed; bottom: 24px; right: 24px;
  background: var(--text); color: #fff;
  border-radius: 11px; padding: 11px 16px;
  font-size: 13px; font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 400;
  transform: translateY(80px); opacity: 0;
  transition: all .3s cubic-bezier(.34,1.56,.64,1);
  display: flex; align-items: center; gap: 8px;
  max-width: 320px;
}
#toast.show { transform: translateY(0); opacity: 1; }
.toast-icon { font-size: 16px; }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

/* Stagger cards */
.file-card:nth-child(1)  { animation-delay: .00s; }
.file-card:nth-child(2)  { animation-delay: .05s; }
.file-card:nth-child(3)  { animation-delay: .10s; }
.file-card:nth-child(4)  { animation-delay: .15s; }
.file-card:nth-child(5)  { animation-delay: .20s; }
.file-card:nth-child(6)  { animation-delay: .25s; }
.file-card:nth-child(7)  { animation-delay: .30s; }
.file-card:nth-child(8)  { animation-delay: .35s; }
</style>
</head>
<body>

<!-- ══ TOP BAR ══════════════════════════════════════════════════════════════ -->
<header id="topbar">
  <a class="logo" href="https://ram.zenbin.org/sol">
    <div class="logo-mark">S</div>
    <span class="logo-name">Sol</span>
  </a>

  <div class="topbar-divider"></div>

  <div class="breadcrumb">
    <a href="#">Dashboard</a>
    <span class="bc-sep">›</span>
    <span class="current">Data Library</span>
  </div>

  <div class="search-wrap">
    <span class="s-icon">🔍</span>
    <input type="text" placeholder="Search files, sources, tags…" id="search-input">
    <div class="s-kbd"><span class="kbd">⌘</span><span class="kbd">K</span></div>
  </div>

  <div class="topbar-actions">
    <button class="icon-btn" title="Notifications">
      🔔
      <span class="notif-dot"></span>
    </button>
    <button class="icon-btn" title="Settings">⚙️</button>
    <button class="btn-import" onclick="triggerUpload()">
      ⬆️ Import Data
    </button>
    <div class="avatar" title="Profile">R</div>
  </div>
</header>

<!-- ══ SIDEBAR ══════════════════════════════════════════════════════════════ -->
<nav id="sidebar">
  <div class="sid-section">
    <div class="sid-label">Library</div>
    <div class="nav-item active" onclick="setNav(this)">
      <span class="ni-icon">📂</span>
      <span class="ni-label">All Data Files</span>
      <span class="ni-count">31</span>
    </div>
    <div class="nav-item" onclick="setNav(this)">
      <span class="ni-icon">🕐</span>
      <span class="ni-label">Recent Imports</span>
      <span class="ni-count">5</span>
    </div>
    <div class="nav-item" onclick="setNav(this)">
      <span class="ni-icon">⭐</span>
      <span class="ni-label">Starred</span>
      <span class="ni-count">4</span>
    </div>
    <div class="nav-item" onclick="setNav(this)">
      <span class="ni-icon">🔄</span>
      <span class="ni-label">Processing</span>
      <span class="ni-count" style="background:var(--purple-l);color:var(--purple);border-color:rgba(124,92,180,.2)">2</span>
    </div>
  </div>

  <div class="sid-section">
    <div class="sid-label">By Type</div>
    <div class="nav-item" onclick="setNav(this)">
      <span class="ni-icon">📊</span>
      <span class="ni-label">Sleep Data</span>
      <span class="ni-count">12</span>
    </div>
    <div class="nav-item" onclick="setNav(this)">
      <span class="ni-icon">❤️</span>
      <span class="ni-label">Heart Rate</span>
      <span class="ni-count">8</span>
    </div>
    <div class="nav-item" onclick="setNav(this)">
      <span class="ni-icon">⚡</span>
      <span class="ni-label">Activity & HRV</span>
      <span class="ni-count">7</span>
    </div>
    <div class="nav-item" onclick="setNav(this)">
      <span class="ni-icon">🧪</span>
      <span class="ni-label">Lab Results</span>
      <span class="ni-count">4</span>
    </div>
  </div>

  <div class="sid-section">
    <div class="sid-label">Connected Sources</div>
  </div>
  <div class="source-list">
    <div class="source-item">
      <div class="src-dot" style="background:#1D1D1F"></div>
      <span class="src-name">Apple Health</span>
      <span class="src-status src-active">Live</span>
    </div>
    <div class="source-item">
      <div class="src-dot" style="background:#E74C3C"></div>
      <span class="src-name">Oura Ring</span>
      <span class="src-status src-active">Live</span>
    </div>
    <div class="source-item">
      <div class="src-dot" style="background:#0066CC"></div>
      <span class="src-name">Garmin Connect</span>
      <span class="src-status src-paused">Paused</span>
    </div>
    <div class="source-item">
      <div class="src-dot" style="background:#FF6900"></div>
      <span class="src-name">Whoop</span>
      <span class="src-status src-error">Error</span>
    </div>
    <div class="source-item">
      <div class="src-dot" style="background:#4A7C6A"></div>
      <span class="src-name">Manual CSV</span>
      <span class="src-status src-active">Ready</span>
    </div>
  </div>

  <div class="storage-card">
    <div class="storage-head">
      <span class="storage-title">Storage Used</span>
      <span class="storage-action">Manage →</span>
    </div>
    <div class="storage-bar">
      <div class="storage-fill" id="storage-fill"></div>
    </div>
    <div class="storage-nums">
      <span><strong>2.4 GB</strong> used</span>
      <span>10 GB</span>
    </div>
  </div>
</nav>

<!-- ══ MAIN ══════════════════════════════════════════════════════════════════ -->
<main id="main">

  <!-- DROP ZONE -->
  <div id="drop-zone"
    ondragover="handleDragOver(event)"
    ondragleave="handleDragLeave(event)"
    ondrop="handleDrop(event)"
    onclick="triggerUpload()">
    <div class="dz-inner">
      <div class="dz-drop">
        <div class="dz-icon-wrap">
          <div class="dz-icon-ring"></div>
          📥
        </div>
        <div class="dz-text">
          <div class="dz-title">Drop health data files here</div>
          <div class="dz-sub">Drag &amp; drop or <em onclick="event.stopPropagation();triggerUpload()">browse files</em> — files are auto-parsed and indexed</div>
        </div>
        <div class="dz-formats">
          <span class="fmt-chip">.csv</span>
          <span class="fmt-chip">.json</span>
          <span class="fmt-chip">.xml</span>
          <span class="fmt-chip">.xlsx</span>
          <span class="fmt-chip">.pdf</span>
          <span class="fmt-chip">.zip</span>
        </div>
      </div>
      <div class="dz-sources" onclick="event.stopPropagation()">
        <div class="dz-sources-title">Import from source</div>
        <div class="quick-source" onclick="toast('🍎 Opening Apple Health connection…')">
          <span class="qs-icon">🍎</span>
          <div>
            <div class="qs-name">Apple Health</div>
            <div class="qs-type">Export XML · Auto-sync</div>
          </div>
          <span class="qs-arrow">→</span>
        </div>
        <div class="quick-source" onclick="toast('💍 Connecting to Oura API…')">
          <span class="qs-icon">💍</span>
          <div>
            <div class="qs-name">Oura Ring</div>
            <div class="qs-type">Sleep · HRV · Readiness</div>
          </div>
          <span class="qs-arrow">→</span>
        </div>
        <div class="quick-source" onclick="toast('🧬 Opening Garmin Connect…')">
          <span class="qs-icon">🧬</span>
          <div>
            <div class="qs-name">Garmin / Whoop</div>
            <div class="qs-type">Activity CSV · Fitness data</div>
          </div>
          <span class="qs-arrow">→</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ACTIVE UPLOADS -->
  <div id="uploads-section">
    <div class="section-row" style="margin-bottom:0">
      <div class="section-title">
        Active Imports
        <span class="s-badge" id="uploads-badge">2</span>
      </div>
      <span class="section-link" onclick="clearUploads()">Clear all</span>
    </div>
    <div class="upload-list" id="upload-list">

      <div class="upload-item uploading" id="up-1">
        <div class="u-icon csv">📊</div>
        <div class="u-body">
          <div class="u-name">oura-sleep-export-2026-Q1.csv</div>
          <div class="u-meta">
            <span class="u-status-dot uploading"></span>
            <span id="up1-status">Uploading…</span>
            <span>·</span>
            <span>4.2 MB</span>
            <span>·</span>
            <span>Sleep Data</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill amber" id="up1-bar" style="width:0%"></div>
          </div>
        </div>
        <div class="u-right">
          <span class="u-pct" id="up1-pct">0%</span>
          <button class="u-cancel">✕</button>
        </div>
      </div>

      <div class="upload-item processing" id="up-2">
        <div class="u-icon json">📋</div>
        <div class="u-body">
          <div class="u-name">apple-health-export-march-2026.json</div>
          <div class="u-meta">
            <span class="u-status-dot processing"></span>
            <span>Parsing 12,847 records…</span>
            <span>·</span>
            <span>18.4 MB</span>
            <span>·</span>
            <span>Heart Rate · HRV · Steps</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill purple" id="up2-bar" style="width:62%"></div>
          </div>
        </div>
        <div class="u-right">
          <span class="u-pct proc" id="up2-pct">62%</span>
          <button class="u-cancel">✕</button>
        </div>
      </div>

    </div>
  </div>

  <!-- TOOLBAR -->
  <div class="toolbar">
    <div class="filter-tabs">
      <div class="ftab active" onclick="setTab(this, 'all')">All Files</div>
      <div class="ftab" onclick="setTab(this, 'sleep')">Sleep</div>
      <div class="ftab" onclick="setTab(this, 'hrv')">HRV</div>
      <div class="ftab" onclick="setTab(this, 'labs')">Labs</div>
    </div>

    <button class="filter-btn">
      🗓️ Date range <span style="color:var(--muted);font-size:11px">▾</span>
    </button>
    <button class="filter-btn">
      🏷️ Source <span style="color:var(--muted);font-size:11px">▾</span>
    </button>

    <div class="spacer"></div>

    <div style="font-size:11px;color:var(--muted);font-weight:500">31 files · 2.4 GB</div>

    <div class="view-toggle">
      <button class="vt active" title="Grid view" onclick="setView('grid',this)">▦</button>
      <button class="vt" title="List view" onclick="setView('list',this)">☰</button>
    </div>
  </div>

  <!-- FILE GRID -->
  <div>
    <div class="grid-head" style="margin-bottom:8px">
      <span>Name</span>
      <span style="margin-left:auto">Type · Size · Date</span>
    </div>
    <div class="file-grid" id="file-grid">

      <div class="file-card" onclick="openDetail('oura-sleep-2026-03.csv','csv','4.2 MB','Sleep Data','Mar 31, 2026','12,847 records')">
        <div class="fc-check"></div>
        <span class="fc-badge badge-new">NEW</span>
        <div class="fc-thumb csv">📊</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('👁 Preview: oura-sleep-2026-03.csv')">👁 Preview</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">oura-sleep-2026-03.csv</div>
          <div class="fc-meta">
            <span class="fc-type type-csv">CSV</span>
            <span class="fc-size">4.2 MB</span>
          </div>
          <div class="fc-date">Mar 31, 2026 · Oura Ring</div>
        </div>
      </div>

      <div class="file-card" onclick="openDetail('apple-health-q1-2026.xml','xml','18.4 MB','All Health Metrics','Mar 28, 2026','84,211 records')">
        <div class="fc-check"></div>
        <span class="fc-badge badge-proc">Parsing</span>
        <div class="fc-thumb xml">🍎</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('⏳ Still processing…')">⏳ Wait</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('✕ Cancel import?')">✕</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">apple-health-q1-2026.xml</div>
          <div class="fc-meta">
            <span class="fc-type type-xml">XML</span>
            <span class="fc-size">18.4 MB</span>
          </div>
          <div class="fc-date">Mar 28, 2026 · Apple Health</div>
        </div>
      </div>

      <div class="file-card" onclick="openDetail('garmin-hrv-stress-2026.csv','csv','1.8 MB','HRV & Stress','Mar 15, 2026','3,104 records')">
        <div class="fc-check"></div>
        <div class="fc-thumb csv">🧬</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('👁 Preview: garmin-hrv-stress.csv')">👁 Preview</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">garmin-hrv-stress-2026.csv</div>
          <div class="fc-meta">
            <span class="fc-type type-csv">CSV</span>
            <span class="fc-size">1.8 MB</span>
          </div>
          <div class="fc-date">Mar 15, 2026 · Garmin</div>
        </div>
      </div>

      <div class="file-card" onclick="openDetail('lab-results-feb-2026.pdf','pdf','0.6 MB','Blood Panel','Feb 18, 2026','22 biomarkers')">
        <div class="fc-check"></div>
        <div class="fc-thumb pdf">🧪</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('👁 Opening PDF viewer…')">👁 View</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">lab-results-feb-2026.pdf</div>
          <div class="fc-meta">
            <span class="fc-type type-pdf">PDF</span>
            <span class="fc-size">0.6 MB</span>
          </div>
          <div class="fc-date">Feb 18, 2026 · Manual</div>
        </div>
      </div>

      <div class="file-card" onclick="openDetail('whoop-recovery-jan-2026.json','json','2.1 MB','Recovery Scores','Jan 31, 2026','5,420 records')">
        <div class="fc-check"></div>
        <div class="fc-thumb json">⚡</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('👁 Preview: whoop-recovery.json')">👁 Preview</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">whoop-recovery-jan-2026.json</div>
          <div class="fc-meta">
            <span class="fc-type type-json">JSON</span>
            <span class="fc-size">2.1 MB</span>
          </div>
          <div class="fc-date">Jan 31, 2026 · Whoop</div>
        </div>
      </div>

      <div class="file-card" onclick="openDetail('oura-readiness-2025-q4.csv','csv','3.6 MB','Readiness Data','Dec 31, 2025','8,920 records')">
        <div class="fc-check"></div>
        <span class="fc-badge badge-sync">Synced</span>
        <div class="fc-thumb csv">💤</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('👁 Preview: oura-readiness.csv')">👁 Preview</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">oura-readiness-2025-q4.csv</div>
          <div class="fc-meta">
            <span class="fc-type type-csv">CSV</span>
            <span class="fc-size">3.6 MB</span>
          </div>
          <div class="fc-date">Dec 31, 2025 · Oura Ring</div>
        </div>
      </div>

      <div class="file-card" onclick="openDetail('custom-energy-log-q1.xlsx','xlsx','0.9 MB','Manual Energy Log','Apr 1, 2026','91 entries')">
        <div class="fc-check"></div>
        <span class="fc-badge badge-new">NEW</span>
        <div class="fc-thumb xlsx">📝</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('👁 Preview: energy-log.xlsx')">👁 Preview</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">custom-energy-log-q1.xlsx</div>
          <div class="fc-meta">
            <span class="fc-type type-xlsx">XLSX</span>
            <span class="fc-size">0.9 MB</span>
          </div>
          <div class="fc-date">Apr 1, 2026 · Manual</div>
        </div>
      </div>

      <div class="file-card" onclick="openDetail('apple-health-export-2025.zip','zip','224 MB','Full Archive','Dec 31, 2025','2.1M records')">
        <div class="fc-check"></div>
        <div class="fc-thumb zip">📦</div>
        <div class="fc-overlay">
          <button class="fco-btn" onclick="event.stopPropagation();toast('📦 Extracting archive…')">📦 Extract</button>
          <button class="fco-btn" onclick="event.stopPropagation();toast('⬇ Downloading…')">⬇</button>
        </div>
        <div class="fc-info">
          <div class="fc-name">apple-health-export-2025.zip</div>
          <div class="fc-meta">
            <span class="fc-type type-zip">ZIP</span>
            <span class="fc-size">224 MB</span>
          </div>
          <div class="fc-date">Dec 31, 2025 · Apple Health</div>
        </div>
      </div>

    </div>
  </div>

</main>

<!-- ══ DETAIL PANEL ══════════════════════════════════════════════════════════ -->
<div id="detail-panel">
  <div class="dp-header">
    <button class="dp-back" onclick="closeDetail()">←</button>
    <div class="dp-title" id="dp-filename">filename.csv</div>
    <button class="dp-close" onclick="closeDetail()">✕</button>
  </div>
  <div class="dp-thumb csv" id="dp-thumb">📊</div>
  <div class="dp-body">

    <div class="dp-row">
      <div class="dp-field">
        <div class="dp-field-label">File Type</div>
        <div class="dp-field-value" id="dp-type">CSV</div>
      </div>
      <div class="dp-field">
        <div class="dp-field-label">File Size</div>
        <div class="dp-field-value" id="dp-size">4.2 MB</div>
      </div>
      <div class="dp-field">
        <div class="dp-field-label">Records</div>
        <div class="dp-field-value green" id="dp-records">12,847</div>
      </div>
      <div class="dp-field">
        <div class="dp-field-label">Import Date</div>
        <div class="dp-field-value" id="dp-date">Mar 31, 2026</div>
      </div>
    </div>

    <div class="dp-section">
      <div class="dp-section-title">📋 Data Preview — first 3 rows</div>
      <div class="dp-preview" id="dp-preview">
        <div class="dp-preview-head">
          <div class="dp-ph-cell">Date</div>
          <div class="dp-ph-cell">Score</div>
          <div class="dp-ph-cell">Deep</div>
          <div class="dp-ph-cell">HRV</div>
        </div>
        <div class="dp-row-data">
          <div class="dp-cell">2026-03-31</div>
          <div class="dp-cell">84</div>
          <div class="dp-cell">1h 42m</div>
          <div class="dp-cell">62 ms</div>
        </div>
        <div class="dp-row-data">
          <div class="dp-cell">2026-03-30</div>
          <div class="dp-cell">79</div>
          <div class="dp-cell">1h 18m</div>
          <div class="dp-cell">58 ms</div>
        </div>
        <div class="dp-row-data">
          <div class="dp-cell">2026-03-29</div>
          <div class="dp-cell">91</div>
          <div class="dp-cell">2h 04m</div>
          <div class="dp-cell">71 ms</div>
        </div>
      </div>
    </div>

    <div class="dp-section">
      <div class="dp-section-title">🏷️ Auto-detected Tags</div>
      <div class="dp-tags">
        <span class="dp-tag" id="dp-category">Sleep Data</span>
        <span class="dp-tag">Oura Ring</span>
        <span class="dp-tag">Q1 2026</span>
        <span class="dp-tag">HRV</span>
      </div>
    </div>

    <div class="dp-section">
      <div class="dp-section-title">⚡ Sol Insights</div>
      <div style="background:var(--amber-l);border:1px solid rgba(217,119,6,.2);border-radius:9px;padding:11px 12px;font-size:12px;line-height:1.6;color:var(--amber-d)">
        Your sleep score averaged <strong>84.7</strong> this quarter — <strong>+6 pts</strong> vs Q4 2025. Deep sleep correlates strongly with days following morning sunlight exposure before 8 AM.
      </div>
    </div>

  </div>
  <div class="dp-actions">
    <button class="dp-btn primary">⚡ Apply to Sol</button>
    <button class="dp-btn secondary">⬇ Download</button>
    <button class="dp-btn secondary" onclick="toast('🗑 Move to trash?')">🗑</button>
  </div>
</div>

<!-- ══ SELECT BAR ════════════════════════════════════════════════════════════ -->
<div id="select-bar">
  <span class="sb-count" id="sb-count">0 selected</span>
  <div class="sb-divider"></div>
  <button class="sb-btn" onclick="toast('⚡ Applying to Sol…')">⚡ Apply to Sol</button>
  <button class="sb-btn" onclick="toast('⬇ Preparing download…')">⬇ Download</button>
  <button class="sb-btn" onclick="toast('🏷 Tag files…')">🏷 Tag</button>
  <div class="sb-divider"></div>
  <button class="sb-btn danger" onclick="toast('🗑 Move to trash?')">🗑 Delete</button>
</div>

<!-- ══ TOAST ═════════════════════════════════════════════════════════════════ -->
<div id="toast">
  <span class="toast-icon" id="toast-icon">✅</span>
  <span id="toast-msg">Action complete</span>
</div>

<script>
/* ── UTILITIES ── */
let selectedCards = new Set();
let toastTimer;

function toast(msg, icon = '✅', duration = 2800) {
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  document.getElementById('toast-icon').textContent = icon;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── NAV ── */
function setNav(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

/* ── TABS ── */
function setTab(el, filter) {
  document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const cards = document.querySelectorAll('.file-card');
  cards.forEach(c => {
    c.style.display = 'block';
    c.style.animationDelay = '0s';
  });
}

/* ── VIEW TOGGLE ── */
function setView(mode, btn) {
  document.querySelectorAll('.vt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('file-grid');
  if (mode === 'list') {
    grid.style.gridTemplateColumns = '1fr';
    grid.querySelectorAll('.file-card').forEach(c => {
      c.style.display = 'flex'; c.style.flexDirection = 'row'; c.style.alignItems = 'center';
      const thumb = c.querySelector('.fc-thumb');
      if (thumb) { thumb.style.width = '52px'; thumb.style.height = '52px'; thumb.style.fontSize = '22px'; thumb.style.borderRadius = '8px'; thumb.style.flexShrink = '0'; }
    });
  } else {
    grid.style.gridTemplateColumns = '';
    grid.querySelectorAll('.file-card').forEach(c => {
      c.style.display = ''; c.style.flexDirection = ''; c.style.alignItems = '';
      const thumb = c.querySelector('.fc-thumb');
      if (thumb) { thumb.style.width = ''; thumb.style.height = ''; thumb.style.fontSize = ''; thumb.style.borderRadius = ''; thumb.style.flexShrink = ''; }
    });
  }
}

/* ── SELECTION ── */
document.querySelectorAll('.file-card').forEach((card, i) => {
  card.querySelector('.fc-check').addEventListener('click', e => {
    e.stopPropagation();
    card.classList.toggle('selected');
    if (card.classList.contains('selected')) selectedCards.add(i);
    else selectedCards.delete(i);
    const bar = document.getElementById('select-bar');
    document.getElementById('sb-count').textContent = selectedCards.size + ' selected';
    bar.classList.toggle('visible', selectedCards.size > 0);
  });
});

/* ── DRAG & DROP ── */
function handleDragOver(e) { e.preventDefault(); document.getElementById('drop-zone').classList.add('drag-over'); }
function handleDragLeave(e) { document.getElementById('drop-zone').classList.remove('drag-over'); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length) toast('📥 ' + files.length + ' file(s) queued for import', '📥');
}
function triggerUpload() { toast('📁 File picker opened — select health data to import', '📁'); }

/* ── UPLOAD ANIMATION ── */
let up1Pct = 0;
const up1 = setInterval(() => {
  up1Pct = Math.min(100, up1Pct + Math.random() * 6 + 1);
  const pct = Math.round(up1Pct);
  document.getElementById('up1-bar').style.width = pct + '%';
  document.getElementById('up1-pct').textContent = pct + '%';
  if (up1Pct >= 100) {
    clearInterval(up1);
    document.getElementById('up1-pct').textContent = '✅';
    document.getElementById('up1-pct').className = 'u-pct done';
    document.getElementById('up-1').className = 'upload-item done';
    document.getElementById('up1-status').textContent = 'Complete — 12,847 records indexed';
    document.getElementById('up1-bar').className = 'progress-fill green';
    document.getElementById('up1-bar').style.width = '100%';
    document.querySelector('#up-1 .u-status-dot').className = 'u-status-dot done';
    toast('✅ oura-sleep-export-2026-Q1.csv imported — 12,847 records', '✅');
  }
}, 800);

let up2Pct = 62;
const up2 = setInterval(() => {
  up2Pct = Math.min(100, up2Pct + Math.random() * 3 + 0.5);
  const pct = Math.round(up2Pct);
  document.getElementById('up2-bar').style.width = pct + '%';
  document.getElementById('up2-pct').textContent = pct + '%';
  if (up2Pct >= 100) {
    clearInterval(up2);
    document.getElementById('up2-pct').textContent = '✅';
    document.getElementById('up2-pct').className = 'u-pct done';
    document.getElementById('up-2').className = 'upload-item done';
    document.getElementById('up2-bar').className = 'progress-fill green';
    document.getElementById('up2-bar').style.width = '100%';
    document.querySelector('#up-2 .u-status-dot').className = 'u-status-dot done';
    toast('✅ Apple Health export parsed — 84,211 records indexed', '✅');
  }
}, 1200);

function clearUploads() {
  document.getElementById('uploads-section').style.opacity = '0.4';
  toast('🗑 Upload history cleared', '🗑');
}

/* ── STORAGE FILL ── */
setTimeout(() => { document.getElementById('storage-fill').style.width = '24%'; }, 400);

/* ── DETAIL PANEL ── */
const fileIcons = { csv: '📊', pdf: '📄', json: '📋', xml: '🍎', xlsx: '📝', zip: '📦' };
function openDetail(name, type, size, category, date, records) {
  document.getElementById('dp-filename').textContent = name;
  const thumb = document.getElementById('dp-thumb');
  thumb.className = 'dp-thumb ' + type;
  thumb.textContent = fileIcons[type] || '📄';
  document.getElementById('dp-type').textContent = type.toUpperCase();
  document.getElementById('dp-size').textContent = size;
  document.getElementById('dp-category').textContent = category;
  document.getElementById('dp-date').textContent = date;
  document.getElementById('dp-records').textContent = records;
  document.getElementById('detail-panel').classList.add('open');
}
function closeDetail() { document.getElementById('detail-panel').classList.remove('open'); }

/* ── SEARCH ── */
document.getElementById('search-input').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.file-card').forEach(c => {
    const name = c.querySelector('.fc-name')?.textContent.toLowerCase() || '';
    c.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
});
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
  if (e.key === 'Escape') {
    closeDetail();
    document.getElementById('search-input').blur();
    selectedCards.clear();
    document.querySelectorAll('.file-card.selected').forEach(c => c.classList.remove('selected'));
    document.getElementById('select-bar').classList.remove('visible');
  }
});
</script>
</body>
</html>`;

async function main() {
  console.log('Publishing Sol Data Import & File Management v2…');
  const res = await publish(SLUG, TITLE, html);
  console.log('Status:', res.status);
  if (res.status === 200 || res.status === 201) {
    console.log('✅ Live at: https://ram.zenbin.org/' + SLUG);
  } else {
    console.error('Error:', res.body.slice(0, 300));
  }
}

main().catch(console.error);
