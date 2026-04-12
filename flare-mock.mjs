// flare-mock.mjs — Svelte 5 interactive mock for FLARE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FLARE',
  tagline:   'Premium lifestyle card & concierge companion',
  archetype: 'fintech-lifestyle',

  palette: {                        // DARK fallback theme
    bg:      '#0D0B09',
    surface: '#1A1815',
    text:    '#F4F1EA',
    accent:  '#4A3FE8',
    accent2: '#E8430B',
    muted:   'rgba(244,241,234,0.4)',
  },

  lightPalette: {                   // LIGHT theme (primary)
    bg:      '#F4F1EA',
    surface: '#FFFFFF',
    text:    '#0D0B09',
    accent:  '#1507D6',
    accent2: '#E8430B',
    muted:   'rgba(13,11,9,0.45)',
  },

  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Available Balance', value: '$24,180', sub: 'FLARE OBSIDIAN · •••• 9421' },
        { type: 'metric-row', items: [
          { label: 'Limit', value: '$12K' },
          { label: 'Used', value: '36%' },
          { label: 'Points', value: '84.2K' },
          { label: 'Due', value: 'Apr 1' },
        ]},
        { type: 'tags', label: 'QUICK ACCESS', items: ['🍽 Dining', '🏨 Hotels', '✦ Events', '✈ Airport'] },
        { type: 'text', label: '✦ AI Concierge', value: '"Nobu is fully booked tonight — I secured a 8pm table at Zuma for two. Shall I confirm?"' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Lounge Access · JFK T4',    sub: 'Today · Delta SkyClub',     badge: 'TODAY' },
          { icon: 'star',     title: 'Restaurant Credit — $100',   sub: 'Expires in 4 days',          badge: '4 DAYS' },
        ]},
        { type: 'progress', items: [
          { label: 'Monthly spend  $4,290 / $12,000', pct: 36 },
        ]},
      ],
    },
    {
      id: 'spend', label: 'Spend',
      content: [
        { type: 'metric', label: 'March 2026', value: '$4,290', sub: '+ 3.2× FLARE Points on every purchase' },
        { type: 'text', label: '✦ AI Insight', value: 'Dining spend ↑29% vs last month. Peak: Friday evenings.' },
        { type: 'progress', items: [
          { label: 'Dining  $1,460', pct: 34 },
          { label: 'Hotels  $1,030', pct: 24 },
          { label: 'Travel  $773', pct: 18 },
          { label: 'Shopping  $601', pct: 14 },
        ]},
        { type: 'list', items: [
          { icon: 'heart',    title: 'Nobu, Fifty Seven',   sub: 'Dining · Today',         badge: '-$340' },
          { icon: 'home',     title: 'The Mark Hotel',       sub: 'Hotels · Yesterday',    badge: '-$820' },
          { icon: 'share',    title: 'Delta · JFK–LHR',      sub: 'Travel · Mar 20',       badge: '-$2,100' },
          { icon: 'grid',     title: 'SSENSE',               sub: 'Shopping · Mar 19',     badge: '-$601' },
        ]},
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'tags', label: 'FILTER', items: ['All', 'Dining', 'Hotels', 'Events', 'Wellness'] },
        { type: 'text', label: '✦ Curated for you', value: 'Based on your preferences & upcoming travel' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Zuma Tokyo',             sub: 'Japanese Contemporary · Roppongi', badge: 'MEMBERS' },
          { icon: 'home',     title: 'Aman Venice',             sub: 'Historic Palace · Grand Canal',   badge: 'LAST ROOM' },
          { icon: 'zap',      title: 'F1 Monaco · Paddock',     sub: 'VIP Paddock Club · May 25',       badge: 'EXCLUSIVE' },
          { icon: 'map',      title: 'Nobu London',             sub: 'Contemporary Japanese · Mayfair', badge: '2,200 pts' },
        ]},
        { type: 'metric-row', items: [
          { label: 'This Week', value: '24 picks' },
          { label: 'Dining',    value: '12' },
          { label: 'Hotels',    value: '8' },
          { label: 'Events',    value: '4' },
        ]},
      ],
    },
    {
      id: 'rewards', label: 'Rewards',
      content: [
        { type: 'metric', label: 'FLARE Points', value: '84,290', sub: '≈ $842 value · OBSIDIAN TIER' },
        { type: 'metric-row', items: [
          { label: 'Earned MTD', value: '+1,240' },
          { label: 'Redeemed',   value: '0' },
          { label: 'Expiry',     value: 'Never' },
          { label: 'Rate',       value: '3.2×' },
        ]},
        { type: 'progress', items: [
          { label: 'Progress to Black tier  84,290 / 100,000', pct: 84 },
        ]},
        { type: 'list', items: [
          { icon: 'home',     title: 'Hotel Nights',          sub: 'Redeem at 400+ properties',     badge: '10K pts' },
          { icon: 'heart',    title: 'Dining Credits',        sub: '$50 at any Atlas Dining venue', badge: '2K pts' },
          { icon: 'check',    title: 'Statement Credit',      sub: '$25 back on your bill',         badge: '2.5K pts' },
          { icon: 'star',     title: 'Experience Upgrade',    sub: 'F1 Paddock VIP · Monaco',       badge: '50K pts' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'James Alderton · OBSIDIAN TIER', value: 'Member', sub: 'Since October 2022 · james@alderton.co' },
        { type: 'metric-row', items: [
          { label: 'Years',    value: '3.4' },
          { label: 'Requests', value: '147' },
          { label: 'Saved',    value: '$2.8K' },
          { label: 'Cards',    value: '3' },
        ]},
        { type: 'text', label: '✦ Concierge', value: 'Available 24/7 · avg reply under 2 min. Text anything — dining, travel, events.' },
        { type: 'list', items: [
          { icon: 'lock',     title: 'Card Controls',         sub: 'Freeze, limits, virtual cards',   badge: '→' },
          { icon: 'bell',     title: 'Notifications',         sub: 'Spend alerts, perk reminders',    badge: '→' },
          { icon: 'grid',     title: 'Payment Methods',       sub: '2 bank accounts linked',           badge: '→' },
          { icon: 'map',      title: 'Travel Preferences',    sub: 'Airlines, hotels, dietary',        badge: '→' },
          { icon: 'message',  title: 'Concierge History',     sub: '14 requests this month',           badge: '→' },
        ]},
        { type: 'tags', label: 'ACCOUNT', items: ['Sign out', 'Refer a friend', 'Help'] },
      ],
    },
  ],

  nav: [
    { id: 'home',     label: 'Home',     icon: 'home' },
    { id: 'spend',    label: 'Spend',    icon: 'chart' },
    { id: 'discover', label: 'Discover', icon: 'star' },
    { id: 'rewards',  label: 'Rewards',  icon: 'heart' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'flare-mock', 'FLARE — Interactive Mock');
console.log('Mock live at:', result.url);
