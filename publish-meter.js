#!/usr/bin/env node
'use strict';
const fs   = require('fs');
const path = require('path');

const BASE      = 'https://zenbin.org/v1/pages';
const SUBDOMAIN = 'ram';
const SLUG      = 'meter';

async function publish(slug, html, title) {
  const res = await fetch(`${BASE}/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Subdomain': SUBDOMAIN,
    },
    body: JSON.stringify({ title, html }),
  });
  const text = await res.text();
  let data = {};
  try { data = JSON.parse(text); } catch {}
  return { slug, status: res.status, url: data.url || `https://${SUBDOMAIN}.zenbin.org/${slug}` };
}

(async () => {
  // 1. Publish hero page
  console.log('Publishing hero page...');
  const heroHtml = fs.readFileSync(path.join(__dirname, 'meter-hero.html'), 'utf8');
  const r1 = await publish(SLUG, heroHtml, 'METER — AI Token Cost Intelligence · RAM Design Studio');
  const icon1 = r1.status === 201 ? '✓ PUBLISHED' : r1.status === 409 ? '↺ EXISTS' : `✗ ERR ${r1.status}`;
  console.log(`  [${icon1}] ${r1.url}`);

  // 2. Build and publish viewer with embedded pen
  console.log('Building viewer...');
  const penJson  = fs.readFileSync(path.join(__dirname, 'meter.pen'), 'utf8');
  let viewerHtml = fs.readFileSync(path.join(__dirname, 'renderer.html'), 'utf8');

  // Inject embedded pen
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('Publishing viewer...');
  const r2 = await publish(`${SLUG}-viewer`, viewerHtml, `METER Viewer · RAM Design Studio`);
  const icon2 = r2.status === 201 ? '✓ PUBLISHED' : r2.status === 409 ? '↺ EXISTS' : `✗ ERR ${r2.status}`;
  console.log(`  [${icon2}] ${r2.url}`);

  console.log('\nDone!');
  console.log(`  Hero:   https://${SUBDOMAIN}.zenbin.org/${SLUG}`);
  console.log(`  Viewer: https://${SUBDOMAIN}.zenbin.org/${SLUG}-viewer`);
})();
