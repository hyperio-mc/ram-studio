#!/usr/bin/env node
'use strict';

const fs    = require('fs');
const https = require('https');
const path  = require('path');

const SLUG = 'volta-travel';
const HOST = 'zenbin.org';

function publish(slug, html, title, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const heroHtml = fs.readFileSync(path.join(__dirname, 'volta-hero.html'), 'utf8');

const penJson   = fs.readFileSync(path.join(__dirname, 'volta.pen'), 'utf8');
let viewerHtml  = fs.readFileSync(path.join(__dirname, 'viewer.html'), 'utf8');
const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
viewerHtml      = viewerHtml.replace('<script>', injection + '\n<script>');

(async () => {
  console.log('Publishing hero…');
  let r = await publish(SLUG, heroHtml, 'VOLTA — Journeys, elevated.');
  console.log('Hero:', r.status, r.body.slice(0,120));

  console.log('Publishing viewer…');
  r = await publish(`${SLUG}-viewer`, viewerHtml, 'VOLTA — Interactive Viewer');
  console.log('Viewer:', r.status, r.body.slice(0,120));

  console.log('');
  console.log('Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
})();
