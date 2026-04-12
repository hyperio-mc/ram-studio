'use strict';
const fs   = require('fs');
const http = require('http');
const https = require('https');

const SLUG      = 'grove';
const SUBDOMAIN = 'ram';

function req(opts, body) {
  return new Promise((resolve, reject) => {
    const r = (opts.port === 443 ? https : http).request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function zenPut(slug, title, html) {
  const body = JSON.stringify({ title, html, overwrite: true });
  return req({
    hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': SUBDOMAIN,
    },
  }, body);
}

const heroHtml = fs.readFileSync('/tmp/grove-hero.html', 'utf8');
const penJson  = fs.readFileSync('/workspace/group/design-studio/grove.pen', 'utf8');

// build viewer
let viewerHtml = '';
if (fs.existsSync('/workspace/group/design-studio/viewer-template.html')) {
  viewerHtml = fs.readFileSync('/workspace/group/design-studio/viewer-template.html', 'utf8');
} else {
  viewerHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GROVE — Pencil Viewer</title>
<style>body{margin:0;background:#F6F1EA;font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;}
h1{font-family:Georgia,serif;font-size:28px;color:#1A1614;}p{color:rgba(26,22,20,0.5);font-size:14px;}
a{color:#C97A4A;text-decoration:none;}</style></head>
<body><h1>GROVE</h1><p>tend your daily rituals.</p>
<p><a href="https://ram.zenbin.org/grove">← Hero</a> &nbsp;·&nbsp; <a href="https://ram.zenbin.org/grove-mock">☀◑ Mock</a></p>
<script></script></body></html>`;
}
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

async function main() {
  console.log('Publishing hero …');
  const r1 = await zenPut(SLUG, 'GROVE — tend your daily rituals.', heroHtml);
  console.log('Hero:', r1.status, r1.body.slice(0, 100));

  console.log('Publishing viewer …');
  const r2 = await zenPut(SLUG + '-viewer', 'GROVE — Pencil Viewer', viewerHtml);
  console.log('Viewer:', r2.status, r2.body.slice(0, 100));
}
main().catch(console.error);
