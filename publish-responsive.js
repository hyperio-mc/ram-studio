#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://zenbin.org/v1/pages';

const designs = [
  { file: 'hive-d1.html', slug: 'hive-r1', title: 'Hive — Neon Cyberpunk' },
  { file: 'hive-d2.html', slug: 'hive-r2', title: 'Hive — Honeycomb' },
  { file: 'hive-d3.html', slug: 'hive-r3', title: 'Hive — Aurora Glass' },
  { file: 'hive-d4.html', slug: 'hive-r4', title: 'Hive — Brutalist Newspaper' },
  { file: 'hive-d5.html', slug: 'hive-r5', title: 'Hive — Matrix Rain' },
  { file: 'hive-d6.html', slug: 'hive-r6', title: 'Hive — Memphis 80s' },
  { file: 'hive-d7.html', slug: 'hive-r7', title: 'Hive — Holographic' },
  { file: 'hive-d8.html', slug: 'hive-r8', title: 'Hive — Isometric 3D' },
  { file: 'hive-d9.html', slug: 'hive-r9', title: 'Hive — Japanese Minimal' },
  { file: 'hive-d10.html', slug: 'hive-r10', title: 'Hive — Retro BBS' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function publish(design) {
  const html = fs.readFileSync(path.join(__dirname, design.file), 'utf8');
  const res = await fetch(`${BASE_URL}/${design.slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: design.title, html }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { slug: design.slug, status: res.status, url: data.url || data.raw };
}

(async () => {
  for (const d of designs) {
    const result = await publish(d);
    console.log(`[${result.status}] ${result.slug} → ${result.url || 'err'}`);
    await sleep(3500);
  }
  console.log('\nAll done!');
})();
