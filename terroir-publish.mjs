// TERROIR — Hero page + Viewer publish script
import fs from 'fs';
import https from 'https';

const SLUG = 'terroir';
const APP_NAME = 'TERROIR';
const TAGLINE = 'Discover the world\'s finest artisan foods & drinks';

function publish(slug, html, title = APP_NAME) {
  const payload = JSON.stringify({ title: title || slug, html });
  const body = Buffer.from(payload);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://ram.zenbin.org/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:         '#FAF7F2',
  surface:    '#FFFFFF',
  surfaceWarm:'#F0E9DF',
  text:       '#2C1A0E',
  textMid:    '#7A5F4A',
  accent:     '#C4622D',
  accentSoft: '#F5E8DF',
  sage:       '#7B9E6B',
  sageSoft:   '#EBF2E7',
  border:     'rgba(44,26,14,0.12)',
  muted:      'rgba(44,26,14,0.45)',
};

// ── Screen data for phone mockups ──────────────────────────────────────────────
const screens = [
  {
    id: 'discover',
    label: 'Discover',
    bg: '#FAF7F2',
    accent: '#C4622D',
    content: `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:18px;font-weight:800;letter-spacing:2px;color:#2C1A0E">TERROIR</span>
        <span style="color:#C4622D;font-size:18px">⊕</span>
      </div>
      <div style="background:#fff;border-radius:18px;border:1px solid rgba(44,26,14,0.12);padding:10px 14px;font-size:12px;color:rgba(44,26,14,0.4);margin-bottom:12px">⌕ Search artisan foods, regions…</div>
      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">
        <span style="background:#C4622D;color:#fff;padding:4px 10px;border-radius:12px;font-size:10px;font-weight:700">Matcha 🍵</span>
        <span style="background:#fff;border:1px solid rgba(44,26,14,0.12);color:#2C1A0E;padding:4px 10px;border-radius:12px;font-size:10px">Raw Honey 🍯</span>
        <span style="background:#7B9E6B;color:#fff;padding:4px 10px;border-radius:12px;font-size:10px;font-weight:700">Spice 🌶️</span>
      </div>
      <div style="background:#E8DDD0;border-radius:16px;padding:16px;margin-bottom:12px">
        <div style="background:#C4622D;display:inline-block;color:#fff;font-size:9px;font-weight:700;padding:3px 8px;border-radius:8px;margin-bottom:8px;letter-spacing:1px">NEW DROP ✦</div>
        <div style="font-size:17px;font-weight:800;color:#2C1A0E;line-height:1.2;margin-bottom:4px">Umbrian Black<br>Truffle Oil</div>
        <div style="font-size:10px;color:rgba(44,26,14,0.6);margin-bottom:8px">Umbria, Italy · Cold-pressed · Limited</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:18px;font-weight:800;color:#C4622D">$48</span>
          <span style="background:#2C1A0E;color:#fff;font-size:10px;font-weight:700;padding:6px 12px;border-radius:14px">Add to Cellar</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid rgba(44,26,14,0.08)">
          <div style="background:#D4E8D4;height:70px;display:flex;align-items:center;justify-content:center;font-size:28px">🍵</div>
          <div style="padding:8px">
            <div style="font-size:11px;font-weight:700;color:#2C1A0E;line-height:1.3">Ceremonial<br>Matcha</div>
            <div style="font-size:10px;color:rgba(44,26,14,0.5);margin:2px 0">Uji, Japan</div>
            <div style="font-size:12px;font-weight:800;color:#C4622D">$32</div>
          </div>
        </div>
        <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid rgba(44,26,14,0.08)">
          <div style="background:#F0E4C8;height:70px;display:flex;align-items:center;justify-content:center;font-size:28px">🍯</div>
          <div style="padding:8px">
            <div style="font-size:11px;font-weight:700;color:#2C1A0E;line-height:1.3">Wildflower<br>Raw Honey</div>
            <div style="font-size:10px;color:rgba(44,26,14,0.5);margin:2px 0">Provence, France</div>
            <div style="font-size:12px;font-weight:800;color:#C4622D">$28</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'product',
    label: 'Product',
    bg: '#FAF7F2',
    accent: '#7B9E6B',
    content: `
      <div style="margin-bottom:10px;font-size:12px;color:#C4622D;font-weight:600">← Back</div>
      <div style="background:#E8DDD0;border-radius:18px;height:160px;display:flex;align-items:center;justify-content:center;font-size:56px;margin-bottom:12px;position:relative">
        🫒
        <span style="position:absolute;top:10px;left:10px;background:#7B9E6B;color:#fff;font-size:9px;font-weight:700;padding:3px 8px;border-radius:8px">Organic ✓</span>
      </div>
      <div style="font-size:9px;font-weight:700;color:rgba(44,26,14,0.5);letter-spacing:1.5px;margin-bottom:4px">FRANTOIO MURAGLIA · ANDRIA, ITALY</div>
      <div style="font-size:20px;font-weight:800;color:#2C1A0E;line-height:1.2;margin-bottom:6px">Monocultivar<br>Coratina EVOO</div>
      <div style="font-size:11px;color:#C4622D;margin-bottom:10px">★★★★★  4.9  (142 notes)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${['Peppery','Grassy','Artichoke','Citrus'].map(n => `<span style="background:#FAF7F2;border:1px solid rgba(44,26,14,0.12);color:#2C1A0E;padding:3px 8px;border-radius:10px;font-size:10px">${n}</span>`).join('')}
      </div>
      <div style="background:#fff;border-radius:12px;padding:10px;font-size:10px;color:#2C1A0E;line-height:1.5;font-style:italic;margin-bottom:12px">"Cold-pressed within 4 hours of harvest from century-old Coratina trees. Polyphenol count: 680 mg/kg."</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:10px;color:rgba(44,26,14,0.4)">Price</div>
          <div style="font-size:22px;font-weight:800;color:#2C1A0E">$52</div>
          <div style="font-size:10px;color:rgba(44,26,14,0.5)">500ml · Free shipping over $80</div>
        </div>
      </div>
      <div style="background:#2C1A0E;color:#FAF7F2;text-align:center;padding:12px;border-radius:20px;font-size:13px;font-weight:700;margin-top:10px">Add to Cellar  ✦</div>
    `
  },
  {
    id: 'collections',
    label: 'Collections',
    bg: '#FAF7F2',
    accent: '#C4622D',
    content: `
      <div style="font-size:20px;font-weight:800;color:#2C1A0E;margin-bottom:4px">Collections</div>
      <div style="font-size:11px;color:rgba(44,26,14,0.5);margin-bottom:12px">Curated by our team of artisan experts</div>
      <div style="background:#C4622D;border-radius:16px;padding:16px;margin-bottom:10px;position:relative;overflow:hidden">
        <div style="position:absolute;right:16px;top:16px;font-size:40px">🇯🇵</div>
        <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:2px;margin-bottom:4px">CURATED COLLECTION</div>
        <div style="font-size:20px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:6px">The Japan<br>Pack</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.8)">12 products · from $28</div>
      </div>
      <div style="background:#3D6B5C;border-radius:16px;padding:16px;margin-bottom:10px;position:relative;overflow:hidden">
        <div style="position:absolute;right:16px;top:16px;font-size:40px">🫒</div>
        <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.6);letter-spacing:2px;margin-bottom:4px">SEASONAL EDIT</div>
        <div style="font-size:20px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:6px">Mediterranean<br>Table</div>
        <div style="font-size:10px;color:rgba(255,255,255,0.8)">8 products · from $32</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:#F0E4C8;border-radius:14px;padding:12px">
          <div style="font-size:28px;margin-bottom:6px">🍯</div>
          <div style="font-size:13px;font-weight:800;color:#2C1A0E;line-height:1.2">Honey<br>World Tour</div>
          <div style="font-size:10px;color:rgba(44,26,14,0.6);margin-top:4px">6 items</div>
        </div>
        <div style="background:#E8D4D4;border-radius:14px;padding:12px">
          <div style="font-size:28px;margin-bottom:6px">🌶️</div>
          <div style="font-size:13px;font-weight:800;color:#2C1A0E;line-height:1.2">Heat<br>Seeker</div>
          <div style="font-size:10px;color:rgba(44,26,14,0.6);margin-top:4px">9 items</div>
        </div>
      </div>
    `
  },
  {
    id: 'makers',
    label: 'Makers',
    bg: '#FAF7F2',
    accent: '#2C1A0E',
    content: `
      <div style="font-size:20px;font-weight:800;color:#2C1A0E;margin-bottom:4px">Makers</div>
      <div style="font-size:11px;color:rgba(44,26,14,0.5);margin-bottom:12px">The artisans behind every product</div>
      ${[
        { emoji: '🧑‍🌾', name: 'Nakai Tea House', loc: 'Uji, Kyoto Prefecture', tags: 'Matcha · Gyokuro · Sencha', count: '12', tagColor: '#7B9E6B', bg: '#E8DDD0' },
        { emoji: '👨‍🍳', name: 'Frantoio Muraglia', loc: 'Andria, Puglia, Italy', tags: 'Extra Virgin Olive Oil', count: '7', tagColor: '#C4622D', bg: '#D4E8D4' },
        { emoji: '👩‍🌾', name: 'Miels de Provence', loc: 'Luberon, Provence, France', tags: 'Raw Honey · Pollen', count: '4', tagColor: '#C4622D', bg: '#F0E4C8' },
        { emoji: '🧂', name: 'Salinas del Mañana', loc: 'Guerande, Brittany', tags: 'Fleur de Sel · Sea Salt', count: '3', tagColor: '#C4622D', bg: '#E8D4D4' },
      ].map(m => `
        <div style="background:#fff;border-radius:16px;border:1px solid rgba(44,26,14,0.06);padding:12px;margin-bottom:8px;display:flex;gap:10px;align-items:center">
          <div style="background:${m.bg};border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${m.emoji}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700;color:#2C1A0E">${m.name}</div>
            <div style="font-size:10px;color:rgba(44,26,14,0.5)">📍 ${m.loc}</div>
            <div style="font-size:10px;color:${m.tagColor};font-weight:600">${m.tags}</div>
          </div>
          <div style="font-size:14px;color:#C4622D">→</div>
        </div>
      `).join('')}
    `
  },
  {
    id: 'cellar',
    label: 'My Cellar',
    bg: '#FAF7F2',
    accent: '#C4622D',
    content: `
      <div style="font-size:20px;font-weight:800;color:#2C1A0E;margin-bottom:4px">My Cellar</div>
      <div style="font-size:11px;color:rgba(44,26,14,0.5);margin-bottom:12px">3 items saved · 1 order in transit</div>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <span style="background:#2C1A0E;color:#fff;padding:5px 12px;border-radius:14px;font-size:11px;font-weight:700">Saved (3)</span>
        <span style="background:#fff;border:1px solid rgba(44,26,14,0.12);color:#2C1A0E;padding:5px 12px;border-radius:14px;font-size:11px">Orders (2)</span>
      </div>
      ${[
        { emoji: '🍵', name: 'Ceremonial Matcha', maker: 'Nakai Tea House · Japan', price: '$32', bg: '#D4E8D4' },
        { emoji: '🫒', name: 'Coratina EVOO', maker: 'Frantoio Muraglia · Italy', price: '$52', bg: '#E8DDD0' },
        { emoji: '🍯', name: 'Wildflower Raw Honey', maker: 'Miels de Provence · France', price: '$28', bg: '#F0E4C8' },
      ].map(item => `
        <div style="background:#fff;border-radius:16px;border:1px solid rgba(44,26,14,0.06);padding:10px;margin-bottom:8px;display:flex;gap:10px;align-items:center">
          <div style="background:${item.bg};border-radius:10px;width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${item.emoji}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700;color:#2C1A0E">${item.name}</div>
            <div style="font-size:10px;color:rgba(44,26,14,0.5)">${item.maker}</div>
            <div style="font-size:13px;font-weight:800;color:#C4622D">${item.price}</div>
          </div>
          <span style="background:#2C1A0E;color:#fff;font-size:10px;font-weight:600;padding:5px 10px;border-radius:12px">Add</span>
        </div>
      `).join('')}
      <div style="background:#EFF5ED;border-radius:14px;padding:12px;margin-bottom:10px;display:flex;gap:10px;align-items:center">
        <span style="font-size:24px">📦</span>
        <div>
          <div style="font-size:12px;font-weight:700;color:#2C1A0E">Order #TR-2847 — In Transit</div>
          <div style="font-size:10px;color:rgba(44,26,14,0.6)">Japan Pack × 1 · ETA: Mar 28</div>
          <div style="font-size:11px;color:#7B9E6B;font-weight:600">Track shipment →</div>
        </div>
      </div>
      <div style="background:#C4622D;color:#fff;text-align:center;padding:12px;border-radius:18px;font-size:13px;font-weight:700">Go to Bag · $80 total</div>
    `
  },
];

// ── Hero HTML ─────────────────────────────────────────────────────────────────
const heroHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — ${TAGLINE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${P.bg};
    --surface: ${P.surface};
    --surface-warm: ${P.surfaceWarm};
    --text: ${P.text};
    --text-mid: ${P.textMid};
    --accent: ${P.accent};
    --accent-soft: ${P.accentSoft};
    --sage: ${P.sage};
    --sage-soft: ${P.sageSoft};
    --border: ${P.border};
    --muted: ${P.muted};
  }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Nav */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 48px;
    background: rgba(250,247,242,0.9);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 900; color: var(--text);
    text-decoration: none; letter-spacing: 2px;
  }
  .nav-logo span { color: var(--accent); }
  .nav-links { display: flex; gap: 36px; }
  .nav-links a { color: var(--text-mid); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
  .nav-links a:hover { color: var(--text); }
  .nav-cta {
    background: var(--text); color: var(--bg);
    padding: 10px 22px; border-radius: 24px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    transition: opacity 0.2s;
  }
  .nav-cta:hover { opacity: 0.8; }

  /* Hero */
  .hero {
    padding: 130px 48px 80px;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1.1fr;
    gap: 80px; align-items: center;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--accent-soft); color: var(--accent);
    padding: 5px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    margin-bottom: 24px;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(42px, 5.5vw, 72px);
    font-weight: 900; line-height: 1.06;
    letter-spacing: -1px; color: var(--text);
    margin-bottom: 22px;
  }
  .hero-title em { font-style: italic; color: var(--accent); }
  .hero-subtitle {
    font-size: 17px; color: var(--text-mid); line-height: 1.7;
    margin-bottom: 40px; max-width: 480px;
  }
  .hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .btn-primary {
    background: var(--accent); color: #fff;
    padding: 15px 30px; border-radius: 30px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    display: inline-flex; align-items: center; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 6px 24px rgba(196,98,45,0.35);
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(196,98,45,0.4); }
  .btn-secondary {
    background: transparent; color: var(--text);
    padding: 15px 26px; border-radius: 30px;
    border: 1.5px solid var(--border);
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* Phone strip */
  .phones-strip {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    overflow: hidden;
    justify-content: center;
  }
  .phone-wrap {
    flex-shrink: 0;
    transform: translateY(0);
    transition: transform 0.3s;
  }
  .phone-wrap:nth-child(2) { transform: translateY(-20px); }
  .phone-wrap:nth-child(4) { transform: translateY(-20px); }
  .phone-wrap:hover { transform: translateY(-8px); }
  .phone-wrap:nth-child(2):hover { transform: translateY(-28px); }
  .phone-wrap:nth-child(4):hover { transform: translateY(-28px); }
  .phone-frame {
    width: 170px;
    background: var(--surface);
    border-radius: 24px;
    border: 1px solid var(--border);
    box-shadow: 0 20px 60px rgba(44,26,14,0.14), 0 4px 16px rgba(44,26,14,0.06);
    overflow: hidden;
  }
  .phone-label {
    text-align: center; font-size: 10px; font-weight: 600;
    color: var(--text-mid); margin-top: 8px; letter-spacing: 0.5px;
  }
  .phone-status {
    display: flex; justify-content: space-between; padding: 8px 12px 4px;
    font-size: 9px; font-weight: 700; color: var(--text-mid);
    background: var(--bg);
  }
  .phone-content {
    background: var(--bg); padding: 10px 10px 12px; min-height: 320px;
    font-size: 11px;
  }

  /* Features */
  .features {
    padding: 80px 48px;
    max-width: 1200px; margin: 0 auto;
  }
  .section-eyebrow {
    font-size: 11px; font-weight: 700; letter-spacing: 2.5px; color: var(--text-mid);
    text-transform: uppercase; margin-bottom: 14px;
  }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 4vw, 48px); font-weight: 700;
    line-height: 1.15; letter-spacing: -0.5px; color: var(--text);
    margin-bottom: 16px;
  }
  .section-title em { font-style: italic; color: var(--accent); }
  .section-sub { font-size: 16px; color: var(--text-mid); max-width: 520px; line-height: 1.65; margin-bottom: 56px; }
  .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .feature-card {
    background: var(--surface); border-radius: 20px; padding: 28px;
    border: 1px solid var(--border);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(44,26,14,0.08); }
  .feature-icon { font-size: 30px; margin-bottom: 16px; display: block; }
  .feature-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .feature-desc { font-size: 13px; color: var(--text-mid); line-height: 1.6; }

  /* Palette swatches */
  .palette-section {
    padding: 60px 48px;
    max-width: 1200px; margin: 0 auto;
  }
  .swatches { display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap; }
  .swatch {
    border-radius: 16px; width: 100px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(44,26,14,0.06);
  }
  .swatch-color { height: 72px; }
  .swatch-label {
    background: var(--surface); padding: 8px 10px;
    font-size: 10px; font-weight: 600; color: var(--text-mid);
    line-height: 1.3;
  }
  .swatch-hex { font-size: 9px; color: rgba(44,26,14,0.4); margin-top: 2px; }

  /* Makers teaser */
  .makers-section {
    padding: 60px 48px;
    max-width: 1200px; margin: 0 auto;
    background: var(--surface-warm);
    border-radius: 32px;
    margin-left: 48px; margin-right: 48px;
    margin-bottom: 60px;
  }
  .makers-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 36px; }
  .maker-card {
    background: var(--surface); border-radius: 18px; padding: 20px;
    border: 1px solid var(--border); text-align: center;
    transition: transform 0.2s;
  }
  .maker-card:hover { transform: translateY(-4px); }
  .maker-avatar {
    width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 12px;
    display: flex; align-items: center; justify-content: center; font-size: 28px;
  }
  .maker-name { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .maker-loc { font-size: 11px; color: var(--text-mid); margin-bottom: 6px; }
  .maker-tag { font-size: 10px; font-weight: 700; color: var(--accent); }

  /* CTA */
  .cta-section {
    padding: 80px 48px; text-align: center;
    background: var(--text); color: var(--bg);
    margin: 0 48px 60px; border-radius: 28px;
  }
  .cta-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 48px); font-weight: 900;
    margin-bottom: 14px; line-height: 1.1;
  }
  .cta-section h2 em { font-style: italic; color: var(--accent); }
  .cta-section p { font-size: 16px; opacity: 0.6; margin-bottom: 36px; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .btn-warm {
    background: var(--accent); color: #fff;
    padding: 15px 30px; border-radius: 30px;
    font-size: 15px; font-weight: 700; text-decoration: none;
    transition: opacity 0.2s;
  }
  .btn-warm:hover { opacity: 0.88; }
  .btn-outline {
    background: transparent; color: var(--bg);
    padding: 15px 26px; border-radius: 30px;
    border: 1.5px solid rgba(250,247,242,0.3);
    font-size: 15px; font-weight: 600; text-decoration: none;
    transition: border-color 0.2s;
  }
  .btn-outline:hover { border-color: rgba(250,247,242,0.7); }

  /* Footer */
  footer {
    padding: 40px 48px; text-align: center;
    color: var(--text-mid); font-size: 13px;
    border-top: 1px solid var(--border);
  }
  footer strong { color: var(--text); }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 48px; padding: 110px 24px 60px; }
    .phones-strip { display: none; }
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .makers-grid { grid-template-columns: repeat(2, 1fr); }
    nav { padding: 14px 24px; }
    .nav-links { display: none; }
    .features { padding: 60px 24px; }
    .palette-section { padding: 40px 24px; }
    .makers-section { margin-left: 24px; margin-right: 24px; padding: 40px 24px; }
    .cta-section { margin: 0 24px 40px; padding: 60px 24px; }
    footer { padding: 30px 24px; }
  }
</style>
</head>
<body>

<!-- Nav -->
<nav>
  <a class="nav-logo" href="#"><span>T</span>ERROIR</a>
  <div class="nav-links">
    <a href="#features">Features</a>
    <a href="#palette">Palette</a>
    <a href="#makers">Makers</a>
    <a href="https://ram.zenbin.org/terroir-mock">Interactive Mock</a>
  </div>
  <a class="nav-cta" href="https://ram.zenbin.org/terroir-mock">Explore Mock →</a>
</nav>

<!-- Hero -->
<section class="hero">
  <div>
    <div class="hero-eyebrow">🫒 Artisan Food Discovery · Spring 2026</div>
    <h1 class="hero-title">
      Discover the<br>
      world's <em>finest</em><br>
      artisan foods.
    </h1>
    <p class="hero-subtitle">
      TERROIR connects you to the world's most exceptional artisan producers —
      from ceremonial matcha in Uji to cold-pressed truffle oil in Umbria.
      Curated. Direct. Extraordinary.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://ram.zenbin.org/terroir-mock">
        🫒 Explore Interactive Mock
      </a>
      <a class="btn-secondary" href="https://ram.zenbin.org/terroir-viewer">
        View Design →
      </a>
    </div>
  </div>
  <div class="phones-strip">
    ${screens.slice(0, 4).map((scr, i) => `
    <div class="phone-wrap">
      <div class="phone-frame">
        <div class="phone-status">
          <span>9:41</span>
          <span>●●● 🔋</span>
        </div>
        <div class="phone-content">${scr.content}</div>
      </div>
      <div class="phone-label">${scr.label}</div>
    </div>`).join('')}
  </div>
</section>

<!-- Features -->
<section class="features" id="features">
  <p class="section-eyebrow">Why TERROIR</p>
  <h2 class="section-title">A world of <em>taste</em><br>in your pocket</h2>
  <p class="section-sub">TERROIR is the editorial ecommerce platform for artisan food lovers — bringing the warmth and depth of great food culture to your phone.</p>
  <div class="features-grid">
    ${[
      { icon: '🧑‍🌾', title: '140+ Artisan Makers', desc: 'Direct relationships with family farms, co-ops, and independent producers across 28 countries.' },
      { icon: '✦', title: 'Curated Collections', desc: 'Seasonal and thematic bundles assembled by our team of food writers and sourcing experts.' },
      { icon: '🍵', title: 'Tasting Notes', desc: 'Detailed flavour profiles written by our in-house tasters — peppery, grassy, floral, bright.' },
      { icon: '📦', title: 'Direct from Source', desc: 'Every product ships direct from the producer. No middlemen, no warehouses — just freshness.' },
    ].map(f => `
    <div class="feature-card">
      <span class="feature-icon">${f.icon}</span>
      <div class="feature-title">${f.title}</div>
      <p class="feature-desc">${f.desc}</p>
    </div>`).join('')}
  </div>
</section>

<!-- Palette Swatches -->
<section class="palette-section" id="palette">
  <p class="section-eyebrow">Design Palette</p>
  <h2 class="section-title">Warm cream &amp; <em>terracotta</em></h2>
  <p class="section-sub">Light-first design inspired by lifestyle editorial ecommerce — Idle Hour Matcha, Woset, and the warm amber photography trend from Superpower on godly.website.</p>
  <div class="swatches">
    ${[
      { color: '#FAF7F2', label: 'Background', role: 'Warm Cream' },
      { color: '#FFFFFF', label: 'Surface', role: 'Pure White' },
      { color: '#2C1A0E', label: 'Text', role: 'Dark Earth' },
      { color: '#C4622D', label: 'Accent', role: 'Terracotta Spice' },
      { color: '#7B9E6B', label: 'Accent 2', role: 'Sage Green' },
      { color: '#E8DDD0', label: 'Card Warm', role: 'Parchment' },
      { color: '#F0E4C8', label: 'Card Gold', role: 'Honey Amber' },
      { color: '#D4E8D4', label: 'Card Green', role: 'Tea Leaf' },
    ].map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${s.color};${s.color === '#FFFFFF' ? 'border-bottom:1px solid rgba(44,26,14,0.08)' : ''}"></div>
      <div class="swatch-label">
        <div>${s.label}</div>
        <div class="swatch-hex">${s.color}</div>
        <div style="font-size:9px;color:rgba(44,26,14,0.35);margin-top:1px">${s.role}</div>
      </div>
    </div>`).join('')}
  </div>
</section>

<!-- Makers Teaser -->
<section class="makers-section" id="makers">
  <p class="section-eyebrow">Featured Makers</p>
  <h2 class="section-title">Behind every <em>extraordinary</em> product</h2>
  <p class="section-sub">TERROIR's maker network spans 28 countries — every producer vetted by our team for craft, authenticity, and direct-sourcing.</p>
  <div class="makers-grid">
    ${[
      { emoji: '🧑‍🌾', name: 'Nakai Tea House', loc: 'Uji, Kyoto Prefecture', tag: 'Matcha · Gyokuro', bg: '#E8DDD0', count: 12 },
      { emoji: '👨‍🍳', name: 'Frantoio Muraglia', loc: 'Andria, Puglia, Italy', tag: 'Extra Virgin Olive Oil', bg: '#D4E8D4', count: 7 },
      { emoji: '👩‍🌾', name: 'Miels de Provence', loc: 'Luberon, Provence', tag: 'Raw Honey · Pollen', bg: '#F0E4C8', count: 4 },
      { emoji: '🧂', name: 'Salinas del Mañana', loc: 'Guerande, Brittany', tag: 'Fleur de Sel · Sea Salt', bg: '#E8D4D4', count: 3 },
    ].map(m => `
    <div class="maker-card">
      <div class="maker-avatar" style="background:${m.bg}">${m.emoji}</div>
      <div class="maker-name">${m.name}</div>
      <div class="maker-loc">📍 ${m.loc}</div>
      <div class="maker-tag">${m.tag}</div>
      <div style="font-size:10px;color:rgba(44,26,14,0.35);margin-top:6px">${m.count} products</div>
    </div>`).join('')}
  </div>
</section>

<!-- CTA -->
<div>
  <div class="cta-section">
    <h2>Taste the world's <em>finest.</em></h2>
    <p>140+ makers. 800+ products. All curated, all direct.</p>
    <div class="cta-btns">
      <a class="btn-warm" href="https://ram.zenbin.org/terroir-mock">🫒 Try the Interactive Mock</a>
      <a class="btn-outline" href="https://ram.zenbin.org/terroir-viewer">Interactive Mock →</a>
    </div>
  </div>
</div>

<!-- Footer -->
<footer>
  <p><strong>TERROIR</strong> — Artisan Food Discovery · A RAM Design Heartbeat project · March 2026</p>
  <p style="margin-top:8px;font-size:11px">Designed by RAM · Inspired by Idle Hour Matcha &amp; Woset (land-book.com) + Superpower (godly.website) · Built with pencil.dev v2.8</p>
</footer>

</body>
</html>`;

// ── Build Viewer HTML ─────────────────────────────────────────────────────────
const penJson = fs.readFileSync('/workspace/group/design-studio/terroir.pen', 'utf8');

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${APP_NAME} — Design Screens Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#FAF7F2;font-family:'Inter',sans-serif;color:#2C1A0E;min-height:100vh}
  header{padding:18px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(44,26,14,0.1);background:rgba(250,247,242,0.92);backdrop-filter:blur(10px);position:sticky;top:0;z-index:10}
  .logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#2C1A0E;letter-spacing:2px}
  .logo span{color:#C4622D}
  .back-btn{background:#C4622D;color:white;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:700;text-decoration:none;transition:opacity 0.2s}
  .back-btn:hover{opacity:0.85}
  .viewer-wrap{max-width:440px;margin:40px auto;padding:0 20px 80px}
  .viewer-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:#2C1A0E;margin-bottom:6px}
  .viewer-sub{font-size:13px;color:rgba(44,26,14,0.5);margin-bottom:24px}
  .screen-frame{background:#FFFFFF;border-radius:32px;border:1px solid rgba(44,26,14,0.1);box-shadow:0 20px 60px rgba(44,26,14,0.12);overflow:hidden;margin-bottom:20px}
  .screen-render{padding:0;min-height:580px;background:#FAF7F2;position:relative}
  .screen-canvas{width:390px;height:844px;position:relative;overflow:hidden;transform-origin:top left}
  .loading{text-align:center;padding:80px 20px;color:rgba(44,26,14,0.4);font-size:14px}
  .screen-nav{display:flex;gap:8px;overflow-x:auto;padding:14px 16px;background:white;border-top:1px solid rgba(44,26,14,0.06);scrollbar-width:none}
  .screen-nav::-webkit-scrollbar{display:none}
  .screen-btn{flex-shrink:0;padding:7px 16px;border-radius:20px;font-size:12px;font-weight:600;border:1.5px solid rgba(44,26,14,0.12);cursor:pointer;background:transparent;color:rgba(44,26,14,0.55);transition:all 0.15s;font-family:'Inter',sans-serif}
  .screen-btn.active{background:#C4622D;color:white;border-color:#C4622D}
  .screen-btn:hover:not(.active){border-color:rgba(196,98,45,0.4);color:#C4622D}
</style>
</head>
<body>
<header>
  <div class="logo"><span>T</span>ERROIR — Viewer</div>
  <a class="back-btn" href="https://ram.zenbin.org/terroir">← Hero Page</a>
</header>
<div class="viewer-wrap">
  <div class="viewer-title">Design Screens</div>
  <div class="viewer-sub">5 screens · 390×844 · Light theme · pencil.dev v2.8</div>
  <div class="screen-frame">
    <div class="screen-render" id="render">
      <div class="loading">Loading TERROIR screens…</div>
    </div>
    <div class="screen-nav" id="screen-nav"></div>
  </div>
</div>
<script>window.TERROIR_PLACEHOLDER = true;</script>
<script>
(function() {
  function init() {
    const pen = window.EMBEDDED_PEN;
    if (!pen) { document.getElementById('render').innerHTML = '<div class="loading">No pen data found.</div>'; return; }
    const data = typeof pen === 'string' ? JSON.parse(pen) : pen;
    const screens = data.screens || [];
    const nav = document.getElementById('screen-nav');
    const render = document.getElementById('render');

    function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function renderScreen(scr) {
      const scale = Math.min(1, 390 / (scr.width || 390));
      const W = scr.width || 390;
      const H = scr.height || 844;
      let html = '<div style="position:relative;width:' + (W * scale) + 'px;height:' + (H * scale) + 'px;overflow:hidden;background:' + (data.palette?.bg || '#FAF7F2') + '">';
      html += '<div style="transform:scale(' + scale + ');transform-origin:top left;width:' + W + 'px;height:' + H + 'px;position:absolute;top:0;left:0">';
      for (const el of (scr.elements || [])) {
        if (el.type === 'rect') {
          const r = el.radius ? 'border-radius:' + el.radius + 'px;' : '';
          const s = el.stroke ? 'border:' + (el.strokeWidth||1) + 'px solid ' + el.stroke + ';' : '';
          html += '<div style="position:absolute;left:' + el.x + 'px;top:' + el.y + 'px;width:' + el.w + 'px;height:' + el.h + 'px;background:' + (el.fill||'transparent') + ';' + r + s + '"></div>';
        } else if (el.type === 'text') {
          const fw = el.fontWeight ? 'font-weight:' + el.fontWeight + ';' : '';
          const ls = el.letterSpacing ? 'letter-spacing:' + el.letterSpacing + 'px;' : '';
          const lh = el.lineHeight ? 'line-height:' + el.lineHeight + ';' : '';
          const ws = el.text && el.text.includes('\\n') ? 'white-space:pre-line;' : '';
          html += '<div style="position:absolute;left:' + el.x + 'px;top:' + el.y + 'px;font-size:' + (el.fontSize||14) + 'px;color:' + (el.color||'#000') + ';' + fw + ls + lh + ws + '">' + escHtml(el.text||'') + '</div>';
        }
      }
      html += '</div></div>';
      return html;
    }

    screens.forEach((scr, i) => {
      const btn = document.createElement('button');
      btn.className = 'screen-btn' + (i === 0 ? ' active' : '');
      btn.textContent = scr.name || ('Screen ' + (i+1));
      btn.onclick = () => {
        render.innerHTML = renderScreen(scr);
        document.querySelectorAll('.screen-btn').forEach((b, j) => b.classList.toggle('active', j === i));
      };
      nav.appendChild(btn);
    });

    if (screens.length > 0) render.innerHTML = renderScreen(screens[0]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
</body>
</html>`;

// Inject EMBEDDED_PEN
const viewerWithPen = viewerHtml.replace(
  '<script>window.TERROIR_PLACEHOLDER = true;</script>',
  `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`
);

// ── Publish ───────────────────────────────────────────────────────────────────
console.log('Publishing hero page…');
const heroResult = await publish(SLUG, heroHtml, `${APP_NAME} — ${TAGLINE}`);
console.log('Hero published:', heroResult.url || `https://ram.zenbin.org/${SLUG}`);

console.log('Publishing viewer…');
const viewerResult = await publish(`${SLUG}-viewer`, viewerWithPen, `${APP_NAME} — Design Screens Viewer`);
console.log('Viewer published:', viewerResult.url || `https://ram.zenbin.org/${SLUG}-viewer`);
