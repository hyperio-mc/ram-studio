// PIQUE — Personal Style Intelligence
// Inspired by: Overlay (lapa.ninja) — floating annotation hotspot pattern over editorial photography
// Theme: LIGHT (previous design HERD was dark)
// Palette: warm ivory editorial, terracotta accent, sage secondary

const fs = require('fs');
const path = require('path');

const W = 390, H = 844;
const BG       = '#FDFAF6';
const SURFACE  = '#F5EFE8';
const SURFACE2 = '#EDE5D8';
const TEXT      = '#2A1F1B';
const TEXT_MUT  = '#8C7B73';
const ACCENT    = '#C07A56'; // terracotta
const ACCENT2   = '#7BA897'; // sage
const ACCENT3   = '#D4A853'; // warm gold
const BORDER    = '#E5DDD5';
const WHITE     = '#FDFAF6';

// ── helpers ────────────────────────────────────────────────────────────────

function statusBar(theme = 'dark') {
  const color = theme === 'dark' ? TEXT : BG;
  return `
    <text x="20" y="26" font-family="SF Pro Display,Helvetica,sans-serif" font-size="14" font-weight="600" fill="${color}">9:41</text>
    <g transform="translate(310,14)" fill="${color}">
      <rect x="0" y="2" width="3" height="7" rx="1" opacity="0.4"/>
      <rect x="5" y="0" width="3" height="9" rx="1" opacity="0.6"/>
      <rect x="10" y="-2" width="3" height="11" rx="1" opacity="0.9"/>
      <rect x="17" y="1" width="7" height="5" rx="1.5" opacity="0.85" fill="none" stroke="${color}" stroke-width="1.2"/>
      <rect x="18" y="2" width="4" height="3" rx="0.5" opacity="0.85"/>
      <rect x="26" y="2" width="1.5" height="3" rx="0.8" opacity="0.85"/>
    </g>`;
}

function navBar(active = 'discover') {
  const tabs = [
    { id: 'discover', icon: sparkleIcon, label: 'Discover' },
    { id: 'wardrobe', icon: gridIcon,    label: 'Wardrobe' },
    { id: 'style',    icon: starIcon,    label: 'Style' },
    { id: 'profile',  icon: userIcon,    label: 'Me' },
  ];
  const tabW = W / tabs.length;
  return `
    <rect x="0" y="${H - 83}" width="${W}" height="83" fill="${WHITE}"/>
    <line x1="0" y1="${H - 83}" x2="${W}" y2="${H - 83}" stroke="${BORDER}" stroke-width="0.75"/>
    ${tabs.map((t, i) => {
      const cx = tabW * i + tabW / 2;
      const isActive = t.id === active;
      const col = isActive ? ACCENT : TEXT_MUT;
      return `
        <g transform="translate(${cx - 12}, ${H - 70})">
          ${t.icon(col)}
        </g>
        <text x="${cx}" y="${H - 46}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="10" fill="${col}" text-anchor="middle" font-weight="${isActive ? '600' : '400'}">${t.label}</text>
        ${isActive ? `<rect x="${cx - 12}" y="${H - 80}" width="24" height="3" rx="1.5" fill="${ACCENT}"/>` : ''}
      `;
    }).join('')}
    <rect x="147" y="${H - 10}" width="96" height="4" rx="2" fill="${TEXT}" opacity="0.15"/>
  `;
}

// icon functions
const sparkleIcon = (color) => `<path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" fill="${color}"/>`;
const gridIcon = (color) => `<rect x="2" y="2" width="8" height="8" rx="1.5" fill="${color}"/><rect x="14" y="2" width="8" height="8" rx="1.5" fill="${color}"/><rect x="2" y="14" width="8" height="8" rx="1.5" fill="${color}"/><rect x="14" y="14" width="8" height="8" rx="1.5" fill="${color}"/>`;
const starIcon = (color) => `<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="${color}"/>`;
const userIcon = (color) => `<circle cx="12" cy="8" r="4" fill="${color}"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>`;

// annotation pin
function annotationPin(cx, cy, label, sublabel, align = 'right') {
  const PW = 130, PH = 44, PR = 10;
  const px = align === 'right' ? cx + 14 : cx - 14 - PW;
  const py = cy - PH / 2;
  return `
    <!-- dot + ring -->
    <circle cx="${cx}" cy="${cy}" r="12" fill="${WHITE}" opacity="0.85"/>
    <circle cx="${cx}" cy="${cy}" r="7" fill="${ACCENT}"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="${WHITE}"/>
    <!-- connector -->
    <line x1="${align === 'right' ? cx + 12 : cx - 12}" y1="${cy}" x2="${align === 'right' ? px : px + PW}" y2="${cy}" stroke="${WHITE}" stroke-width="1" opacity="0.7"/>
    <!-- tooltip -->
    <rect x="${px}" y="${py}" width="${PW}" height="${PH}" rx="${PR}" fill="${WHITE}" opacity="0.92"/>
    <rect x="${px}" y="${py}" width="${PW}" height="${PH}" rx="${PR}" fill="none" stroke="${BORDER}" stroke-width="0.75"/>
    <text x="${px + 12}" y="${py + 16}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" font-weight="600" fill="${TEXT}">${label}</text>
    <text x="${px + 12}" y="${py + 30}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="10" fill="${TEXT_MUT}">${sublabel}</text>
  `;
}

// editorial photo placeholder (fashion item silhouette)
function editorialPhoto(x, y, w, h, colorA, colorB, shape = 'dress') {
  return `
    <defs>
      <linearGradient id="photo_${x}_${y}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorA}"/>
        <stop offset="100%" stop-color="${colorB}"/>
      </linearGradient>
    </defs>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0" fill="url(#photo_${x}_${y})"/>
    ${shape === 'dress' ? `
      <!-- dress silhouette -->
      <path d="M${x+w/2-25} ${y+20} L${x+w/2-35} ${y+h*0.6} L${x+w/2-50} ${y+h-20} L${x+w/2+50} ${y+h-20} L${x+w/2+35} ${y+h*0.6} L${x+w/2+25} ${y+20} Q${x+w/2} ${y+10} ${x+w/2-25} ${y+20}Z" fill="${WHITE}" opacity="0.12"/>
      <ellipse cx="${x+w/2}" cy="${y+20}" rx="20" ry="18" fill="${WHITE}" opacity="0.1"/>
    ` : shape === 'jacket' ? `
      <!-- jacket silhouette -->
      <path d="M${x+w/2-40} ${y+h-20} L${x+w/2-45} ${y+30} L${x+w/2-15} ${y+15} L${x+w/2} ${y+25} L${x+w/2+15} ${y+15} L${x+w/2+45} ${y+30} L${x+w/2+40} ${y+h-20}Z" fill="${WHITE}" opacity="0.12"/>
    ` : `
      <!-- bag silhouette -->
      <rect x="${x+w/2-35}" y="${y+h*0.3}" width="70" height="55" rx="8" fill="${WHITE}" opacity="0.12"/>
      <path d="M${x+w/2-20} ${y+h*0.3} Q${x+w/2-20} ${y+h*0.15} ${x+w/2} ${y+h*0.15} Q${x+w/2+20} ${y+h*0.15} ${x+w/2+20} ${y+h*0.3}" stroke="${WHITE}" stroke-width="3" fill="none" opacity="0.15"/>
    `}
  `;
}

// color swatch dot
function swatchDot(cx, cy, color, ring = false) {
  return `
    <circle cx="${cx}" cy="${cy}" r="10" fill="${color}"/>
    ${ring ? `<circle cx="${cx}" cy="${cy}" r="13" fill="none" stroke="${ACCENT}" stroke-width="1.5"/>` : ''}
  `;
}

// ── screens ────────────────────────────────────────────────────────────────

// SCREEN 1: Discover — editorial hero with floating annotation pins
function screen1() {
  return `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${statusBar('dark')}
    
    <!-- header -->
    <text x="20" y="58" font-family="SF Pro Display,Helvetica,sans-serif" font-size="24" font-weight="700" fill="${TEXT}">Discover</text>
    <text x="20" y="78" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT_MUT}">Curated for your aesthetic</text>
    
    <!-- search pill -->
    <rect x="20" y="90" width="${W - 40}" height="38" rx="19" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>
    <text x="50" y="114" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT_MUT}">Search styles, brands, occasions…</text>
    <circle cx="38" cy="109" r="8" fill="${BORDER}"/>
    <path d="M35 106 Q38 103 41 106 Q44 109 41 112 Q38 115 35 112 Q32 109 35 106Z M40 113 L43 116" stroke="${TEXT_MUT}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    
    <!-- editorial hero photo -->
    ${editorialPhoto(0, 136, W, 370, '#D4B896', '#A07A6A', 'dress')}
    
    <!-- gradient overlay bottom of photo -->
    <defs>
      <linearGradient id="heroOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${BG}" stop-opacity="0"/>
        <stop offset="100%" stop-color="${BG}" stop-opacity="0.6"/>
      </linearGradient>
    </defs>
    <rect x="0" y="136" width="${W}" height="370" fill="url(#heroOverlay)"/>
    
    <!-- collection badge -->
    <rect x="16" y="150" width="120" height="26" rx="13" fill="${WHITE}" opacity="0.88"/>
    <text x="28" y="167" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" font-weight="600" fill="${ACCENT}">✦ AUTUMN EDIT</text>
    
    <!-- save button -->
    <circle cx="${W - 28}" cy="163" r="18" fill="${WHITE}" opacity="0.88"/>
    <path d="M${W-28-7} 157 Q${W-28} 153 ${W-28+7} 157 L${W-28+7} 169 L${W-28} 165 L${W-28-7} 169Z" stroke="${TEXT}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- floating annotation pins -->
    ${annotationPin(145, 220, 'Wrap Dress', 'Silk chiffon', 'right')}
    ${annotationPin(255, 310, 'Waist Tie', 'Self-belt detail', 'left')}
    ${annotationPin(110, 390, 'Midi Length', '105cm drop', 'right')}
    
    <!-- caption at bottom of photo -->
    <text x="20" y="488" font-family="SF Pro Display,Helvetica,sans-serif" font-size="18" font-weight="700" fill="${TEXT}">Côte d'Azur Edit</text>
    <text x="20" y="508" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT_MUT}">3 pieces tagged · Tap pins to explore</text>
    
    <!-- horizontal cards strip -->
    <text x="20" y="538" font-family="SF Pro Text,Helvetica,sans-serif" font-size="14" font-weight="600" fill="${TEXT}">More like this</text>
    
    <!-- card 1 -->
    <rect x="20" y="548" width="105" height="130" rx="12" fill="${SURFACE}"/>
    ${editorialPhoto(20, 548, 105, 100, '#C9A896', '#8A6A5A', 'jacket')}
    <rect x="20" y="648" width="105" height="30" rx="0" fill="${SURFACE}"/>
    <rect x="20" y="648" width="105" height="30" rx="12" fill="${SURFACE}"/>
    <text x="32" y="667" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" font-weight="600" fill="${TEXT}">Blazer</text>
    
    <!-- card 2 -->
    <rect x="138" y="548" width="105" height="130" rx="12" fill="${SURFACE}"/>
    ${editorialPhoto(138, 548, 105, 100, '#B5C4BE', '#7A9A8E', 'dress')}
    <rect x="138" y="648" width="105" height="30" rx="12" fill="${SURFACE}"/>
    <text x="150" y="667" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" font-weight="600" fill="${TEXT}">Maxi Dress</text>
    
    <!-- card 3 -->
    <rect x="256" y="548" width="114" height="130" rx="12" fill="${SURFACE}"/>
    ${editorialPhoto(256, 548, 114, 100, '#D4C4A8', '#A89878', 'bag')}
    <rect x="256" y="648" width="114" height="30" rx="12" fill="${SURFACE}"/>
    <text x="268" y="667" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" font-weight="600" fill="${TEXT}">Tote</text>
    
    <!-- nav -->
    ${navBar('discover')}
  </svg>`;
}

// SCREEN 2: Item Detail — full annotated view + breakdown panel
function screen2() {
  return `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${statusBar('dark')}
    
    <!-- back button -->
    <circle cx="34" cy="56" r="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>
    <path d="M37 50 L31 56 L37 62" stroke="${TEXT}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- title -->
    <text x="W/2" y="50" text-anchor="middle" font-family="SF Pro Display,Helvetica,sans-serif" font-size="16" font-weight="600" fill="${TEXT}" x="${W/2}">Item Detail</text>
    
    <!-- share -->
    <circle cx="${W-34}" cy="56" r="18" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>
    <path d="M${W-34-5} 58 L${W-34} 52 L${W-34+5} 58 M${W-34} 52 L${W-34} 64" stroke="${TEXT}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- main editorial photo with annotations -->
    ${editorialPhoto(0, 78, W, 310, '#C8AE94', '#9A7A6A', 'jacket')}
    
    <!-- annotation pins on jacket detail -->
    ${annotationPin(130, 140, 'Collar', 'Italian lapel', 'right')}
    ${annotationPin(200, 200, 'Linen Blend', '67% linen', 'left')}
    ${annotationPin(155, 280, 'Pocket', 'Patch detail', 'right')}
    
    <!-- bottom sheet panel -->
    <rect x="0" y="376" width="${W}" height="${H - 376}" rx="0" fill="${WHITE}"/>
    <!-- pull tab -->
    <rect x="${W/2 - 20}" y="386" width="40" height="4" rx="2" fill="${BORDER}"/>
    
    <!-- item name & price -->
    <text x="20" y="416" font-family="SF Pro Display,Helvetica,sans-serif" font-size="21" font-weight="700" fill="${TEXT}">Linen Safari Jacket</text>
    <text x="20" y="440" font-family="SF Pro Text,Helvetica,sans-serif" font-size="14" fill="${TEXT_MUT}">ARKET · Spring Collection 2026</text>
    
    <!-- price badge -->
    <rect x="${W - 100}" y="403" width="80" height="30" rx="15" fill="${SURFACE}"/>
    <text x="${W - 60}" y="422" font-family="SF Pro Display,Helvetica,sans-serif" font-size="16" font-weight="700" fill="${ACCENT}" text-anchor="middle">£189</text>
    
    <!-- fabric pills -->
    <text x="20" y="464" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" font-weight="600" fill="${TEXT_MUT}" letter-spacing="0.5">FABRIC COMPOSITION</text>
    <rect x="20" y="472" width="80" height="24" rx="12" fill="${SURFACE2}"/>
    <text x="60" y="488" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT}" text-anchor="middle">67% Linen</text>
    <rect x="110" y="472" width="90" height="24" rx="12" fill="${SURFACE2}"/>
    <text x="155" y="488" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT}" text-anchor="middle">33% Cotton</text>
    
    <!-- color swatches -->
    <text x="20" y="518" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" font-weight="600" fill="${TEXT_MUT}" letter-spacing="0.5">AVAILABLE COLOURS</text>
    ${swatchDot(36, 540, '#C8AE94', true)}
    ${swatchDot(66, 540, '#8C9A8A')}
    ${swatchDot(96, 540, '#2A1F1B')}
    ${swatchDot(126, 540, '#D4C4A8')}
    <text x="150" y="545" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}">+2 more</text>
    
    <!-- style score bar -->
    <text x="20" y="572" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" font-weight="600" fill="${TEXT_MUT}" letter-spacing="0.5">YOUR STYLE MATCH</text>
    <rect x="20" y="580" width="${W - 40}" height="8" rx="4" fill="${SURFACE}"/>
    <rect x="20" y="580" width="${(W - 40) * 0.88}" height="8" rx="4" fill="${ACCENT}"/>
    <text x="${W - 20}" y="591" font-family="SF Pro Display,Helvetica,sans-serif" font-size="14" font-weight="700" fill="${ACCENT}" text-anchor="end">88%</text>
    
    <!-- CTA buttons -->
    <rect x="20" y="606" width="${W/2 - 28}" height="46" rx="23" fill="${ACCENT}"/>
    <text x="${W/4 - 8}" y="633" font-family="SF Pro Text,Helvetica,sans-serif" font-size="15" font-weight="600" fill="${WHITE}" text-anchor="middle">Save to Wardrobe</text>
    <rect x="${W/2 + 8}" y="606" width="${W/2 - 28}" height="46" rx="23" fill="${SURFACE}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${W * 3/4 + 8}" y="633" font-family="SF Pro Text,Helvetica,sans-serif" font-size="15" font-weight="600" fill="${TEXT}" text-anchor="middle">Shop Now</text>
    
    <!-- nav -->
    ${navBar('discover')}
  </svg>`;
}

// SCREEN 3: Wardrobe — masonry grid with color extraction
function screen3() {
  const items = [
    { x: 16, y: 138, w: 175, h: 220, ca: '#C8AE94', cb: '#9A7A6A', shape: 'jacket', name: 'Linen Jacket', brand: 'ARKET', pins: 3 },
    { x: 199, y: 138, w: 175, h: 160, ca: '#B5C4BE', cb: '#7A9A8E', shape: 'dress', name: 'Wrap Dress', brand: 'Réalisation', pins: 4 },
    { x: 199, y: 306, w: 175, h: 170, ca: '#D4C4A8', cb: '#A89878', shape: 'bag', name: 'Raffia Tote', brand: 'Jacquemus', pins: 2 },
    { x: 16, y: 366, w: 175, h: 180, ca: '#C4B0D8', cb: '#8A7A9A', shape: 'dress', name: 'Midi Dress', brand: 'Sandro', pins: 5 },
    { x: 199, y: 484, w: 175, h: 140, ca: '#D4A890', cb: '#A87860', shape: 'jacket', name: 'Blazer', brand: 'Cos', pins: 2 },
    { x: 16, y: 554, w: 175, h: 160, ca: '#C8D4B8', cb: '#8AA878', shape: 'bag', name: 'Mini Bag', brand: 'Polène', pins: 1 },
  ];
  return `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${statusBar('dark')}
    
    <!-- header -->
    <text x="20" y="58" font-family="SF Pro Display,Helvetica,sans-serif" font-size="24" font-weight="700" fill="${TEXT}">Wardrobe</text>
    <text x="20" y="78" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT_MUT}">24 pieces · 6 complete outfits</text>
    
    <!-- filter pills -->
    <rect x="20" y="90" width="58" height="28" rx="14" fill="${ACCENT}"/>
    <text x="49" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" font-weight="600" fill="${WHITE}" text-anchor="middle">All</text>
    <rect x="86" y="90" width="68" height="28" rx="14" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>
    <text x="120" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" text-anchor="middle">Tops</text>
    <rect x="162" y="90" width="74" height="28" rx="14" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>
    <text x="199" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" text-anchor="middle">Dresses</text>
    <rect x="244" y="90" width="60" height="28" rx="14" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>
    <text x="274" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" text-anchor="middle">Bags</text>
    <rect x="312" y="90" width="62" height="28" rx="14" fill="${SURFACE}" stroke="${BORDER}" stroke-width="0.75"/>
    <text x="343" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" text-anchor="middle">Shoes</text>
    
    <!-- masonry grid -->
    ${items.map(item => `
      <!-- card -->
      <rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="14" fill="${SURFACE}"/>
      ${editorialPhoto(item.x, item.y, item.w, item.h - 50, item.ca, item.cb, item.shape)}
      <rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="14" fill="none" stroke="${BORDER}" stroke-width="0.5"/>
      <!-- info row -->
      <rect x="${item.x}" y="${item.y + item.h - 50}" width="${item.w}" height="50" rx="0" fill="${SURFACE}"/>
      <rect x="${item.x}" y="${item.y + item.h - 50}" width="${item.w}" height="50" rx="14" fill="${SURFACE}"/>
      <text x="${item.x + 12}" y="${item.y + item.h - 30}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" font-weight="600" fill="${TEXT}">${item.name}</text>
      <text x="${item.x + 12}" y="${item.y + item.h - 14}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" fill="${TEXT_MUT}">${item.brand}</text>
      <!-- pin count badge -->
      <rect x="${item.x + item.w - 36}" y="${item.y + item.h - 38}" width="28" height="20" rx="10" fill="${SURFACE2}"/>
      <circle cx="${item.x + item.w - 28}" cy="${item.y + item.h - 28}" r="3" fill="${ACCENT}"/>
      <text x="${item.x + item.w - 16}" y="${item.y + item.h - 24}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="10" font-weight="600" fill="${ACCENT}" text-anchor="middle">${item.pins}</text>
    `).join('')}
    
    <!-- nav -->
    ${navBar('wardrobe')}
  </svg>`;
}

// SCREEN 4: Style Profile — palette + stats
function screen4() {
  const palette = ['#C8AE94', '#B5C4BE', '#D4C4A8', '#C4B0D8', '#8A6A5A', '#2A1F1B'];
  return `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${statusBar('dark')}
    
    <!-- header -->
    <text x="20" y="58" font-family="SF Pro Display,Helvetica,sans-serif" font-size="24" font-weight="700" fill="${TEXT}">Your Style</text>
    <text x="20" y="78" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT_MUT}">Updated this week</text>
    
    <!-- archetype card -->
    <rect x="20" y="92" width="${W - 40}" height="110" rx="18" fill="${SURFACE}"/>
    <defs>
      <linearGradient id="archetypeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="${ACCENT2}" stop-opacity="0.08"/>
      </linearGradient>
    </defs>
    <rect x="20" y="92" width="${W - 40}" height="110" rx="18" fill="url(#archetypeGrad)"/>
    <text x="36" y="122" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" font-weight="600" fill="${ACCENT}" letter-spacing="1">YOUR ARCHETYPE</text>
    <text x="36" y="148" font-family="SF Pro Display,Helvetica,sans-serif" font-size="26" font-weight="700" fill="${TEXT}">The Minimalist</text>
    <text x="36" y="168" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT_MUT}">Clean lines · Neutral palette · Quality over quantity</text>
    <!-- archetype icon -->
    <circle cx="${W - 52}" cy="147" r="28" fill="${ACCENT}" opacity="0.12"/>
    <path d="M${W-66} 137 L${W-38} 137 M${W-66} 147 L${W-44} 147 M${W-66} 157 L${W-50} 157" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round"/>
    
    <!-- palette section -->
    <text x="20" y="228" font-family="SF Pro Text,Helvetica,sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Your Palette</text>
    <text x="${W-20}" y="228" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${ACCENT}" text-anchor="end">See all →</text>
    
    <!-- palette swatches with percentages -->
    ${palette.map((col, i) => {
      const sw = (W - 40) / palette.length - 6;
      const sx = 20 + i * (sw + 6);
      const pcts = [28, 22, 18, 14, 10, 8];
      return `
        <rect x="${sx}" y="238" width="${sw}" height="${sw}" rx="10" fill="${col}"/>
        <text x="${sx + sw/2}" y="${238 + sw + 16}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" fill="${TEXT_MUT}" text-anchor="middle">${pcts[i]}%</text>
      `;
    }).join('')}
    
    <!-- stats grid -->
    <text x="20" y="330" font-family="SF Pro Text,Helvetica,sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Style Intelligence</text>
    
    <!-- 4 stat cards -->
    ${[
      { label: 'Pieces Saved', value: '24', sub: '+3 this week', color: ACCENT },
      { label: 'Outfits Built', value: '6', sub: 'Complete looks', color: ACCENT2 },
      { label: 'Style Score', value: '91', sub: 'Top 12%', color: ACCENT3 },
      { label: 'Annotations', value: '47', sub: 'Detail tags', color: ACCENT },
    ].map((stat, i) => {
      const col = i % 2 === 0 ? 20 : W/2 + 8;
      const row = i < 2 ? 342 : 456;
      const cardW = W/2 - 28;
      return `
        <rect x="${col}" y="${row}" width="${cardW}" height="102" rx="16" fill="${SURFACE}"/>
        <text x="${col + 20}" y="${row + 30}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" font-weight="500">${stat.label}</text>
        <text x="${col + 20}" y="${row + 64}" font-family="SF Pro Display,Helvetica,sans-serif" font-size="34" font-weight="700" fill="${stat.color}">${stat.value}</text>
        <text x="${col + 20}" y="${row + 86}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" fill="${TEXT_MUT}">${stat.sub}</text>
      `;
    }).join('')}
    
    <!-- occasions radar -->
    <text x="20" y="582" font-family="SF Pro Text,Helvetica,sans-serif" font-size="14" font-weight="600" fill="${TEXT}">Occasion Breakdown</text>
    ${[
      { label: 'Everyday', pct: 72 },
      { label: 'Smart Casual', pct: 55 },
      { label: 'Evening', pct: 38 },
      { label: 'Holiday', pct: 64 },
    ].map((occ, i) => `
      <text x="20" y="${600 + i * 32}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT}">${occ.label}</text>
      <rect x="130" y="${590 + i * 32}" width="${W - 170}" height="8" rx="4" fill="${SURFACE}"/>
      <rect x="130" y="${590 + i * 32}" width="${(W - 170) * occ.pct/100}" height="8" rx="4" fill="${ACCENT2}"/>
      <text x="${W - 20}" y="${600 + i * 32}" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" text-anchor="end">${occ.pct}%</text>
    `).join('')}
    
    <!-- nav -->
    ${navBar('style')}
  </svg>`;
}

// SCREEN 5: Outfit Builder — annotated assembly grid
function screen5() {
  return `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${statusBar('dark')}
    
    <!-- header -->
    <text x="20" y="58" font-family="SF Pro Display,Helvetica,sans-serif" font-size="24" font-weight="700" fill="${TEXT}">Build Outfit</text>
    <text x="20" y="78" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" fill="${TEXT_MUT}">Occasion: Smart Casual</text>
    
    <!-- occasion chips -->
    <rect x="20" y="90" width="100" height="28" rx="14" fill="${ACCENT}" opacity="0.12" stroke="${ACCENT}" stroke-width="1"/>
    <text x="70" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" font-weight="600" fill="${ACCENT}" text-anchor="middle">Smart Casual</text>
    <rect x="130" y="90" width="72" height="28" rx="14" fill="${SURFACE}"/>
    <text x="166" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" text-anchor="middle">Evening</text>
    <rect x="212" y="90" width="70" height="28" rx="14" fill="${SURFACE}"/>
    <text x="247" y="108" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}" text-anchor="middle">Holiday</text>
    
    <!-- outfit canvas — central mannequin area -->
    <rect x="20" y="126" width="${W - 40}" height="300" rx="18" fill="${SURFACE}"/>
    
    <!-- layered items in outfit view -->
    <!-- Item A: top -->
    <rect x="90" y="148" width="210" height="120" rx="12" fill="${SURFACE2}" stroke="${BORDER}" stroke-width="0.75"/>
    ${editorialPhoto(90, 148, 210, 120, '#C8AE94', '#9A7A6A', 'jacket')}
    <rect x="90" y="148" width="210" height="120" rx="12" fill="none" stroke="${ACCENT}" stroke-width="2"/>
    <rect x="90" y="148" width="80" height="22" rx="11" fill="${ACCENT}"/>
    <text x="130" y="163" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" font-weight="600" fill="${WHITE}" text-anchor="middle">Linen Jacket</text>
    
    <!-- Item B: bottom -->
    <rect x="90" y="278" width="100" height="120" rx="12" fill="${SURFACE2}" stroke="${BORDER}" stroke-width="0.75"/>
    ${editorialPhoto(90, 278, 100, 120, '#D4C4A8', '#A89878', 'dress')}
    <rect x="90" y="278" width="100" height="120" rx="12" fill="none" stroke="${BORDER}" stroke-width="1.5" stroke-dasharray="4,3"/>
    
    <!-- Item C: bag -->
    <rect x="200" y="278" width="100" height="120" rx="12" fill="${SURFACE2}" stroke="${BORDER}" stroke-width="0.75"/>
    ${editorialPhoto(200, 278, 100, 120, '#C4B0D8', '#8A7A9A', 'bag')}
    
    <!-- + add slot -->
    <rect x="90" y="416" width="${W-130}" height="0" rx="12" fill="none"/>
    
    <!-- annotation pin on outfit -->
    ${annotationPin(190, 185, 'Hero Piece', 'Anchor this look', 'right')}
    
    <!-- compatibility score -->
    <rect x="20" y="440" width="${W-40}" height="68" rx="16" fill="${SURFACE}"/>
    <text x="36" y="464" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" font-weight="600" fill="${TEXT_MUT}" letter-spacing="0.5">OUTFIT HARMONY</text>
    <rect x="36" y="472" width="${(W-80) * 0.82}" height="8" rx="4" fill="${BORDER}"/>
    <rect x="36" y="472" width="${(W-80) * 0.82}" height="8" rx="4" fill="${ACCENT2}"/>
    <text x="${W-36}" y="480" font-family="SF Pro Display,Helvetica,sans-serif" font-size="14" font-weight="700" fill="${ACCENT2}" text-anchor="end">82%</text>
    <text x="36" y="497" font-family="SF Pro Text,Helvetica,sans-serif" font-size="11" fill="${TEXT_MUT}">Palette aligned · Occasion suitable · 1 suggestion</text>
    
    <!-- suggestions -->
    <text x="20" y="530" font-family="SF Pro Text,Helvetica,sans-serif" font-size="14" font-weight="600" fill="${TEXT}">AI Suggestions</text>
    
    <!-- suggestion pill -->
    <rect x="20" y="540" width="${W-40}" height="56" rx="14" fill="${SURFACE}"/>
    <circle cx="46" cy="568" r="16" fill="${ACCENT}" opacity="0.15"/>
    <path d="M40 568 L52 568 M46 562 L46 574" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round"/>
    <text x="70" y="561" font-family="SF Pro Text,Helvetica,sans-serif" font-size="13" font-weight="600" fill="${TEXT}">Add tan sandals</text>
    <text x="70" y="578" font-family="SF Pro Text,Helvetica,sans-serif" font-size="12" fill="${TEXT_MUT}">Completes the earthy palette story</text>
    <text x="${W-30}" y="571" font-family="SF Pro Text,Helvetica,sans-serif" font-size="20" fill="${ACCENT}" text-anchor="end">+</text>
    
    <!-- save CTA -->
    <rect x="20" y="610" width="${W-40}" height="46" rx="23" fill="${ACCENT}"/>
    <text x="${W/2}" y="637" font-family="SF Pro Text,Helvetica,sans-serif" font-size="15" font-weight="700" fill="${WHITE}" text-anchor="middle">Save Outfit Look</text>
    
    <!-- nav -->
    ${navBar('wardrobe')}
  </svg>`;
}

// ── assemble pen file ────────────────────────────────────────────────────────

const screens = [
  { id: 'screen-discover', label: 'Discover',       svg: screen1() },
  { id: 'screen-detail',   label: 'Item Detail',    svg: screen2() },
  { id: 'screen-wardrobe', label: 'Wardrobe',        svg: screen3() },
  { id: 'screen-style',    label: 'Style Profile',  svg: screen4() },
  { id: 'screen-builder',  label: 'Outfit Builder', svg: screen5() },
];

const pen = {
  version: '2.8',
  meta: {
    title: 'PIQUE — Personal Style Intelligence',
    description: 'Inspired by Overlay (lapa.ninja) — floating annotation hotspot pattern over editorial photography. Light, editorial, warm-ivory palette. A fashion curation and virtual styling assistant.',
    theme: 'light',
    backgroundColor: BG,
    accentColor: ACCENT,
    tags: ['fashion', 'light-mode', 'annotation', 'editorial', 'curation', 'ai-styling'],
    created: new Date().toISOString(),
  },
  screens: screens.map(s => ({
    id: s.id,
    label: s.label,
    width: W,
    height: H,
    svg: s.svg,
  })),
};

fs.writeFileSync(path.join(__dirname, 'pique.pen'), JSON.stringify(pen, null, 2));
console.log('✓ pique.pen written');
console.log(`  ${screens.length} screens: ${screens.map(s => s.label).join(', ')}`);
