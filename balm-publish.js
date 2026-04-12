'use strict';
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const SLUG     = 'balm';
const APP_NAME = 'BALM';
const TAGLINE  = 'Calm clarity for creative freelancers';
const HOST     = 'zenbin.org';
const SUBDOMAIN = 'ram';

function publish(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html, overwrite: true });
    const req = https.request({
      hostname: HOST, port: 443,
      path: `/v1/pages/${slug}`, method: 'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    SUBDOMAIN,
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

const penJson = fs.readFileSync(path.join(__dirname, 'balm.pen'), 'utf8');
const pen     = JSON.parse(penJson);

const BG      = '#F7F3EE';
const SURFACE = '#FFFFFF';
const SURFACE2= '#F0EDE8';
const BORDER  = '#E2DDD6';
const TEXT    = '#1C1917';
const MUTED   = '#9B918A';
const ACCENT  = '#C85A2A';
const GREEN   = '#4A7B6F';
const AMBER   = '#B07828';

