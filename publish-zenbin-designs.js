#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://zenbin.org/v1/pages';

const designs = [
  { file: 'zenbin-d1.html',  slug: 'zenbin-d1',  title: 'zenbin -- Cosmic Nebula' },
  { file: 'zenbin-d2.html',  slug: 'zenbin-d2',  title: 'zenbin -- Vaporwave' },
  { file: 'zenbin-d3.html',  slug: 'zenbin-d3',  title: 'zenbin -- Liquid Chrome' },
  { file: 'zenbin-d4.html',  slug: 'zenbin-d4',  title: 'zenbin -- Brutalist Zine' },
  { file: 'zenbin-d5.html',  slug: 'zenbin-d5',  title: 'zenbin -- Neural Network' },
  { file: 'zenbin-d6.html',  slug: 'zenbin-d6',  title: 'zenbin -- Bento Grid' },
  { file: 'zenbin-d7.html',  slug: 'zenbin-d7',  title: 'zenbin -- Typewriter Race' },
  { file: 'zenbin-d8.html',  slug: 'zenbin-d8',  title: 'zenbin -- Bokeh Glass' },
  { file: 'zenbin-d9.html',  slug: 'zenbin-d9',  title: 'zenbin -- Arcade' },
  { file: 'zenbin-d10.html', slug: 'zenbin-d10', title: 'zenbin -- Ink and Paper' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function publish(design) {
  const html = fs.readFileSync(path.join(__dirname, design.file), 'utf8');
  const res = await fetch(`${BASE_URL}/${design.slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: design.title, html }),
  });
  const data = await res.json().catch(() => ({}));
  return { slug: design.slug, status: res.status, url: data.url || '' };
}

(async () => {
  console.log('Publishing 10 zenbin designs...\n');
  for (const d of designs) {
    const r = await publish(d);
    const icon = r.status === 201 ? 'OK' : r.status === 409 ? 'EXISTS' : 'ERR';
    console.log(`[${icon}] ${r.slug} -> ${r.url || r.status}`);
    await sleep(3500);
  }
  console.log('\nDone!');
})();
