#!/usr/bin/env node
// publish-hive-designs.js
// Publishes all 10 Hive design variants to zenbin.org

const fs = require('fs');
const path = require('path');

const ZENBIN_TOKEN = process.env.ZENBIN_TOKEN;
const BASE_URL = 'https://zenbin.org/v1/pages';

const designs = [
  { file: 'hive-d1.html', slug: 'hive-design-1', title: 'Hive — Neon Cyberpunk' },
  { file: 'hive-d2.html', slug: 'hive-design-2', title: 'Hive — Honeycomb' },
  { file: 'hive-d3.html', slug: 'hive-design-3', title: 'Hive — Aurora Glass' },
  { file: 'hive-d4.html', slug: 'hive-design-4', title: 'Hive — Brutalist Newspaper' },
  { file: 'hive-d5.html', slug: 'hive-design-5', title: 'Hive — Matrix Rain' },
  { file: 'hive-d6.html', slug: 'hive-design-6', title: 'Hive — Memphis 80s' },
  { file: 'hive-d7.html', slug: 'hive-design-7', title: 'Hive — Holographic' },
  { file: 'hive-d8.html', slug: 'hive-design-8', title: 'Hive — Isometric 3D' },
  { file: 'hive-d9.html', slug: 'hive-design-9', title: 'Hive — Japanese Minimal' },
  { file: 'hive-d10.html', slug: 'hive-design-10', title: 'Hive — Retro BBS' },
];

async function publish(design) {
  const filePath = path.join(__dirname, design.file);
  const html = fs.readFileSync(filePath, 'utf8');

  const headers = { 'Content-Type': 'application/json' };
  if (ZENBIN_TOKEN) headers['Authorization'] = `Bearer ${ZENBIN_TOKEN}`;

  // Try POST first
  let res = await fetch(`${BASE_URL}/${design.slug}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: design.title, html }),
  });

  if (res.status === 409) {
    // Already exists — try PATCH or PUT
    res = await fetch(`${BASE_URL}/${design.slug}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ title: design.title, html }),
    });
    if (!res.ok) {
      // Try PATCH
      res = await fetch(`${BASE_URL}/${design.slug}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ title: design.title, html }),
      });
    }
  }

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return { design, status: res.status, data };
}

async function main() {
  console.log('Publishing 10 Hive designs to zenbin.org...\n');
  const results = [];

  for (const design of designs) {
    process.stdout.write(`  Publishing ${design.slug}... `);
    try {
      const result = await publish(design);
      const ok = result.status >= 200 && result.status < 300;
      console.log(ok ? `✓ ${result.status}` : `✗ ${result.status} — ${JSON.stringify(result.data)}`);
      results.push({ ...result, ok });
    } catch (e) {
      console.log(`✗ ERROR: ${e.message}`);
      results.push({ design, ok: false, error: e.message });
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log('Published URLs:');
  results.forEach(r => {
    const url = `https://zenbin.org/p/${r.design.slug}`;
    console.log(`  ${r.ok ? '✓' : '✗'} ${url}  (${r.design.title})`);
  });
  console.log('─────────────────────────────────────');
}

main().catch(console.error);
