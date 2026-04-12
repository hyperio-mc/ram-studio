#!/usr/bin/env node
// ember-new-publish.js — EMBER Podcast AI: Hero + Viewer publisher

'use strict';
const fs    = require('fs');
const https = require('https');

const SLUG      = 'ember';
const APP_NAME  = 'Ember';
const TAGLINE   = 'Your podcast, deeply understood';
const SUBDOMAIN = 'ram';
const HOST      = 'zenbin.org';

function post(hostname, pathname, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = {
      hostname, path: pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const r = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

const heroHtml = fs.readFileSync('/workspace/group/design-studio/ember-hero.html', 'utf8');
const viewerHtml = fs.readFileSync('/workspace/group/design-studio/ember-viewer.html', 'utf8');

async function run() {
  console.log('Publishing hero page...');
  const r1 = await post(HOST, '/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG },
    { html: heroHtml, slug: SLUG, subdomain: SUBDOMAIN });
  console.log('Hero:', r1.status, r1.status === 200 ? '✓' : r1.body.slice(0,120));

  console.log('Publishing viewer...');
  const r2 = await post(HOST, '/api/publish',
    { 'X-Subdomain': SUBDOMAIN, 'X-Slug': SLUG + '-viewer' },
    { html: viewerHtml, slug: SLUG + '-viewer', subdomain: SUBDOMAIN });
  console.log('Viewer:', r2.status, r2.status === 200 ? '✓' : r2.body.slice(0,120));

  console.log('\nHero:   https://ram.zenbin.org/' + SLUG);
  console.log('Viewer: https://ram.zenbin.org/' + SLUG + '-viewer');
}

run().catch(console.error);
