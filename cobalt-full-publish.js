#!/usr/bin/env node
// COBALT — Full pipeline publisher using correct zenbin v1 API
'use strict';

const fs    = require('fs');
const https = require('https');

const SLUG      = 'cobalt';
const SUBDOMAIN = 'ram';
const APP_NAME  = 'COBALT';
const TAGLINE   = 'Your stack. One terminal.';
const penJson   = fs.readFileSync('cobalt.pen', 'utf8');

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function post(hostname, urlPath, headers, body) {
  return new Promise((res, rej) => {
    const buf = Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const r = https.request({ hostname, path: urlPath, method: 'POST',
      headers: { ...headers, 'Content-Length': buf.length }
    }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej);
    r.write(buf); r.end();
  });
}

function httpGet(hostname, urlPath) {
  return new Promise((res, rej) => {
    https.get({ hostname, path: urlPath }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    }).on('error', rej);
  });
}

function zenBinPut(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return post('zenbin.org', `/v1/pages/${slug}`, {
    'Content-Type': 'application/json',
    'X-Subdomain': SUBDOMAIN,
  }, body);
}

// ─── Build viewer HTML ────────────────────────────────────────────────────────
async function buildViewerHTML() {
  const resp = await httpGet('zenbin.org', '/p/pen-viewer-3');
  if (resp.status !== 200) throw new Error('Could not fetch pen-viewer-3: ' + resp.status);
  let viewerHtml = resp.body;
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  return viewerHtml;
}

// ─── Hero HTML ────────────────────────────────────────────────────────────────
const heroHtml = fs.readFileSync('cobalt-hero.html', 'utf8');

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('1/2  Publishing hero…');
  const heroRes = await zenBinPut(SLUG, `${APP_NAME} — ${TAGLINE}`, heroHtml);
  console.log(`     ${heroRes.status === 200 ? '✓' : '✗'} https://ram.zenbin.org/${SLUG}  [${heroRes.status}]`);
  if (heroRes.status !== 200) console.log('     ', heroRes.body.slice(0, 200));

  console.log('2/2  Building + publishing viewer…');
  const viewerHtml = await buildViewerHTML();
  const viewerRes  = await zenBinPut(`${SLUG}-viewer`, `${APP_NAME} Viewer`, viewerHtml);
  console.log(`     ${viewerRes.status === 200 ? '✓' : '✗'} https://ram.zenbin.org/${SLUG}-viewer  [${viewerRes.status}]`);
  if (viewerRes.status !== 200) console.log('     ', viewerRes.body.slice(0, 200));

  console.log(`\n✓ Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`✓ Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
})().catch(console.error);
