import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Lodge',
  tagline:   'Boutique Nature Retreats',
  archetype: 'hospitality-booking-editorial',
  palette: {
    bg:      '#2A2018',
    surface: '#3A3028',
    text:    '#FAF7F2',
    accent:  '#C4973C',
    accent2: '#7B9B6B',
    muted:   'rgba(250,247,242,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#2A2018',
    accent:  '#4A3728',
    accent2: '#7B9B6B',
    muted:   'rgba(42,32,24,0.45)',
  },
  screens: [
    {
      id: 'discover',
      label: 'Discover',
      hero: { type: 'stat', value: '240+', label: 'Vetted Retreats', change: 'Hand-selected', positive: true },
      metrics: [
        { label: 'Avg rating',   value: '4.91',    sub: 'across all stays' },
        { label: 'Superhosts',   value: '94%',     sub: 'of listings' },
        { label: 'Regions',      value: '18',      sub: 'covered' },
      ],
      alerts: [
        { type: 'info', title: 'New: Pacific Northwest edit', body: '14 new cabins added this week' },
      ],
      items: [
        { name: 'Tall Pines Retreat',   value: '$280/night', sub: 'Olympic Peninsula, WA · ★ 4.9', progress: 92 },
        { name: 'Lakehouse Studio',     value: '$190/night', sub: 'Hood River, OR · ★ 4.8',        progress: 80 },
        { name: 'Desert Clay Dome',     value: '$240/night', sub: 'Joshua Tree, CA · ★ 4.9',       progress: 88 },
        { name: 'Forest Micro-cabin',   value: '$155/night', sub: 'Ashland, OR · ★ 5.0',           progress: 95 },
      ],
    },
    {
      id: 'property',
      label: 'Property',
      hero: { type: 'stat', value: '$280', label: 'Per Night', change: '$1,400 for 5 nights', positive: true },
      metrics: [
        { label: 'Rating',     value: '4.9 ★',   sub: '84 reviews' },
        { label: 'Bedrooms',   value: '2',        sub: '4 guests max' },
        { label: 'Acreage',    value: '3 ac',     sub: 'private land' },
      ],
      items: [
        { name: '🌲 Forest trails',  value: 'On-site',    sub: '2 miles of private paths' },
        { name: '🛁 Wood-fired tub', value: 'Included',   sub: 'Ready at dusk' },
        { name: '🔥 Fireplace',      value: 'Indoor',     sub: 'Firewood provided' },
        { name: '☕ Espresso bar',   value: 'Stocked',    sub: 'Local roaster' },
        { name: '🌐 Wi-Fi',          value: '100 Mbps',   sub: 'Starlink' },
      ],
    },
    {
      id: 'booking',
      label: 'Book',
      hero: { type: 'stat', value: 'Apr 12', label: 'Check-in', change: '→ Apr 17 check-out', positive: true },
      metrics: [
        { label: 'Nights',     value: '5',        sub: 'selected' },
        { label: 'Guests',     value: '2',        sub: 'adults' },
        { label: 'Total est.', value: '$1,575',   sub: 'incl. fees' },
      ],
      items: [
        { name: 'Nightly rate',   value: '$280 × 5', sub: 'Base rate',    progress: 89 },
        { name: 'Cleaning fee',   value: '$85',      sub: 'One-time',     progress: 27 },
        { name: 'Service fee',    value: '$90',      sub: 'Lodge fee',    progress: 28 },
        { name: 'Total',          value: '$1,575',   sub: 'All-in price', progress: 100 },
      ],
    },
    {
      id: 'policy',
      label: 'Policy',
      hero: { type: 'stat', value: 'Moderate', label: 'Cancellation', change: 'Read before confirming', positive: false },
      metrics: [
        { label: 'Free cancel', value: 'Until Apr 5',  sub: 'Full refund' },
        { label: 'Half refund', value: 'Apr 5–10',     sub: '50% back' },
        { label: 'No refund',   value: 'After Apr 10', sub: '0% back' },
      ],
      alerts: [
        { type: 'warning', title: 'Non-refundable in 3 days', body: 'Free cancellation window closes Apr 10' },
        { type: 'info',    title: 'Dates locked 72hr out',    body: 'Modifications not available near check-in' },
      ],
      items: [
        { name: 'House rules accepted',    value: 'Required', sub: 'No smoking, no pets',    badge: 'Required', badgeType: 'warning' },
        { name: 'Check-in instructions',   value: 'Via app',  sub: 'Lockbox code sent 24hr', badge: 'Auto',     badgeType: 'ok' },
      ],
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      hero: { type: 'stat', value: '✓', label: 'Booking Confirmed', change: 'LDG-8471', positive: true },
      metrics: [
        { label: 'Check-in',  value: 'Apr 12',   sub: 'After 3pm' },
        { label: 'Check-out', value: 'Apr 17',   sub: 'Before 11am' },
        { label: 'Total paid',value: '$1,575',   sub: 'Charged' },
      ],
      alerts: [
        { type: 'info', title: 'James says:', body: '"Firewood will be ready. Enjoy the forest."' },
      ],
      items: [
        { name: 'Directions saved',   value: '3h 20m',   sub: 'From Seattle',        badge: 'Ready', badgeType: 'ok' },
        { name: 'Check-in guide',     value: 'PDF',      sub: 'Download anytime',    badge: 'Ready', badgeType: 'ok' },
        { name: 'Host contact',       value: 'James',    sub: 'Message in-app',      badge: 'Active', badgeType: 'ok' },
      ],
    },
  ],
};

console.log('Generating Svelte component...');
const svelteSource = generateSvelteComponent(design);

console.log('Building mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

console.log('Publishing mock...');
const result = await publishMock(html, 'lodge-mock', 'Lodge — Interactive Mock');
console.log('Mock live at:', result.url || result.status);
