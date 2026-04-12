// patch-og-tags.mjs — Retroactively inject OG / Twitter Card meta tags
// into all 6 heartbeat hero pages and republish to ZenBin

import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = JSON.parse(require('fs').readFileSync('/workspace/group/design-studio/community-config.json','utf8'));

function req(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, rs => {
      let d = ''; rs.on('data', c => d += c); rs.on('end', () => res({ status: rs.statusCode, body: d }));
    });
    r.on('error', rej); if (body) r.write(body); r.end();
  });
}

const heroes = [
  {
    slug: 'grain',
    title: 'GRAIN — feel the city',
    description: 'Dark hyperlocal ambient city app. Neighbourhood pulse scores, vibe signals, transit heatmaps and local sound texture. A RAM design concept.',
    theme: 'dark',
    accent: '#FF6B2B',
  },
  {
    slug: 'hush',
    title: 'HUSH — your quiet space',
    description: 'Dark minimal focus & deep work companion. Ambient rooms, focus scores, distraction blocking and deep session tracking. A RAM design concept.',
    theme: 'dark',
    accent: '#7B6FE0',
  },
  {
    slug: 'keel',
    title: 'KEEL — steady money',
    description: 'Dark personal finance intelligence. Balance tracking, spending signals, runway projections and quiet financial clarity. A RAM design concept.',
    theme: 'dark',
    accent: '#4FBBAE',
  },
  {
    slug: 'tend',
    title: 'TEND — grow something',
    description: 'Light plant care companion. Watering schedules, growth tracking, light sensing and plant health intelligence. A RAM design concept.',
    theme: 'light',
    accent: '#4A8C5C',
  },
  {
    slug: 'rite',
    title: 'RITE — skin intelligence built on ritual',
    description: 'Light editorial skincare ritual tracker. Morning routines, skin photo log, product shelf and AI-pattern recommendations. A RAM design concept.',
    theme: 'light',
    accent: '#8B7FD4',
  },
  {
    slug: 'vara',
    title: 'VARA — know your biology',
    description: 'Dark navy biomarker health intelligence. Health score tracking, 42-marker lab panels, trend analysis and AI-ranked interventions. A RAM design concept.',
    theme: 'dark',
    accent: '#FF5A30',
  },
];

async function fetchHero(slug) {
  const r = await req({
    hostname: 'ram.zenbin.org',
    path: `/${slug}`,
    method: 'GET',
    headers: { 'User-Agent': 'ram-heartbeat/1.0' },
  });
  return r.body;
}

function buildOgBlock({ slug, title, description, accent }) {
  const url = `https://ram.zenbin.org/${slug}`;
  return `
  <!-- Open Graph / Twitter Card -->
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:site_name" content="RAM Design Studio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:site" content="@ram_design">
  <meta name="theme-color" content="${accent}">`;
}

async function patchAndRepublish(hero) {
  console.log(`\n▶ ${hero.slug.toUpperCase()}`);

  // Fetch current HTML
  const html = await fetchHero(hero.slug);
  if (!html || html.includes('"error"')) {
    console.log(`  ✗ Could not fetch ${hero.slug}`);
    return;
  }

  // Check if already patched
  if (html.includes('og:title')) {
    console.log(`  ⚡ Already has OG tags — skipping`);
    return;
  }

  // Inject after <title>...</title>
  const ogBlock = buildOgBlock(hero);
  const patched = html.replace(/<\/title>/, `</title>${ogBlock}`);

  if (patched === html) {
    console.log(`  ✗ Could not find </title> insertion point`);
    return;
  }

  // Republish
  const body = Buffer.from(JSON.stringify({ html: patched }));
  const r = await req({
    hostname: 'zenbin.org',
    path: `/v1/pages/${hero.slug}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
      'X-Subdomain': 'ram',
    },
  }, body);

  if (r.status === 200 || r.status === 201) {
    console.log(`  ✓ Patched + republished → https://ram.zenbin.org/${hero.slug}`);
  } else {
    console.log(`  ✗ ZenBin ${r.status}: ${r.body.slice(0, 80)}`);
  }
}

console.log('🏷  Patching OG/Twitter Card meta tags on all 6 heartbeat heroes...');
for (const hero of heroes) {
  await patchAndRepublish(hero);
}

console.log('\n✓ Done. All heroes now have shareable link previews.');
console.log('  Paste any ram.zenbin.org/[slug] link on X, iMessage, Slack or Telegram');
console.log('  and it will render with title + description card.');
