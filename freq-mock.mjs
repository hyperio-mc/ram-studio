// freq-mock.mjs — Svelte interactive mock for FREQ
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FREQ',
  tagline:   'Podcast intelligence for creators',
  archetype: 'podcast-analytics-ai',
  palette: {                    // dark theme (the designed one)
    bg:      '#07080F',
    surface: '#0F1120',
    text:    '#E8EBF7',
    accent:  '#7B6EF6',
    accent2: '#F59E0B',
    muted:   'rgba(232,235,247,0.4)',
  },
  lightPalette: {               // light theme toggle
    bg:      '#F4F3FF',
    surface: '#FFFFFF',
    text:    '#1A1840',
    accent:  '#5B4ECC',
    accent2: '#D97706',
    muted:   'rgba(26,24,64,0.45)',
  },
  screens: [
    {
      id: 'feed', label: 'Episode Feed',
      content: [
        { type: 'metric', label: 'This Week', value: '38.4K', sub: '↑ +12% listeners vs last week' },
        { type: 'metric-row', items: [
          { label: 'Episodes', value: '3' },
          { label: 'Avg Retention', value: '72%' },
          { label: 'New Follows', value: '+847' },
        ]},
        { type: 'tags', label: 'Alerts', items: ['🔥 Top 5% EP 142', '⚠ Drop-off EP 141', '↑ +12% reach'] },
        { type: 'list', items: [
          { icon: 'play', title: 'EP 142 — The Future of AI Agents', sub: '14.2K plays · 72% retained · Mar 30', badge: '+18%' },
          { icon: 'play', title: 'EP 141 — Solo Founder Survival Guide', sub: '11.8K plays · 61% retained · Mar 28', badge: '-4%' },
          { icon: 'play', title: 'EP 140 — Design Systems at Scale', sub: '9.4K plays · 58% retained · Mar 25', badge: '-2%' },
        ]},
      ],
    },
    {
      id: 'episode', label: 'Episode Detail',
      content: [
        { type: 'metric', label: 'EP 142 — AI Agents', value: '41m', sub: 'avg listen time · 72% retention' },
        { type: 'metric-row', items: [
          { label: 'Plays', value: '14.2K' },
          { label: 'Shares', value: '892' },
          { label: 'Saves', value: '1.4K' },
          { label: 'Comments', value: '214' },
        ]},
        { type: 'progress', items: [
          { label: 'First 10 min', pct: 94 },
          { label: '10–20 min', pct: 88 },
          { label: '20–30 min', pct: 80 },
          { label: '30–38 min', pct: 72 },
          { label: '38–45 min', pct: 44 },
          { label: '45–58 min', pct: 36 },
        ]},
        { type: 'text', label: '✦ AI Insight', value: 'Listeners drop off during your mid-episode ad read at 38m. Consider moving to 45m or cutting 90s from the sponsor segment. Estimated revenue impact: -$340/ep.' },
        { type: 'tags', label: 'Comment Sentiment', items: ['😊 Positive 68%', '😐 Neutral 21%', '😞 Negative 11%'] },
      ],
    },
    {
      id: 'aibrief', label: 'AI Brief',
      content: [
        { type: 'metric', label: 'Creator Score — Week of Mar 24', value: '84', sub: '↑ +7 from last week · AI-powered' },
        { type: 'metric-row', items: [
          { label: 'Retention', value: '72' },
          { label: 'Growth', value: '61' },
          { label: 'Virality', value: '48' },
          { label: 'Revenue', value: '55' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'AI Agents ep is your all-time top 5', sub: '14.2K plays in 24h. Share velocity 3× avg. Do a follow-up.', badge: '🔥' },
          { icon: 'alert', title: 'Ad placement cost you ~$1,020 this week', sub: 'Drop-off during mid-rolls. Pre-roll converts 2.4× better.', badge: '⚠' },
          { icon: 'map', title: 'New audience: London, 28–35 tech founders', sub: '+340 new UK listeners this week. Your content resonates.', badge: '🌍' },
          { icon: 'check', title: 'Ideal episode length: 42–52 minutes', sub: 'Completion drops 18% past 55m. Confirmed over 8 weeks.', badge: '🎯' },
        ]},
      ],
    },
    {
      id: 'audience', label: 'Audience',
      content: [
        { type: 'metric', label: 'Total Listeners', value: '38,420', sub: '↑ +74% growth in 30 days' },
        { type: 'progress', items: [
          { label: '25–34 years', pct: 38 },
          { label: '35–44 years', pct: 31 },
          { label: '45–54 years', pct: 14 },
          { label: '18–24 years', pct: 12 },
          { label: '55+ years',   pct:  5 },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'New York', sub: '5.2K listeners — primary market', badge: '🇺🇸' },
          { icon: 'map', title: 'London',   sub: '3.4K listeners — fastest growing', badge: '🇬🇧' },
          { icon: 'map', title: 'San Francisco', sub: '2.9K listeners', badge: '🇺🇸' },
          { icon: 'map', title: 'Toronto',  sub: '2.1K listeners', badge: '🇨🇦' },
          { icon: 'map', title: 'Berlin',   sub: '1.8K listeners', badge: '🇩🇪' },
        ]},
        { type: 'tags', label: 'Platforms', items: ['Spotify 48%', 'Apple 31%', 'YouTube 12%', 'Other 9%'] },
      ],
    },
    {
      id: 'monetize', label: 'Monetize',
      content: [
        { type: 'metric', label: 'March Revenue', value: '$6,840', sub: '↑ +$920 vs Feb · 3 active sponsors' },
        { type: 'metric-row', items: [
          { label: 'Notion', value: '$2.5K' },
          { label: 'Linear', value: '$3.1K' },
          { label: 'Raycast', value: '$1.1K' },
        ]},
        { type: 'progress', items: [
          { label: 'Notion pre-roll (94% ret.)', pct: 94 },
          { label: 'Linear mid-roll (58% ret.)', pct: 58 },
          { label: 'Raycast post-roll (31% ret.)', pct: 31 },
        ]},
        { type: 'text', label: '✦ AI Revenue Insight', value: 'Moving Linear from mid-roll to pre-roll could recover ~$1,020/month in drop-off losses. Pre-roll retention 94% vs mid-roll 58%.' },
        { type: 'tags', label: 'Skip Rates', items: ['Notion 6% ✓', 'Linear 42% ⚠', 'Raycast 69% ✗'] },
      ],
    },
  ],
  nav: [
    { id: 'feed',     label: 'Feed',     icon: 'home' },
    { id: 'episode',  label: 'Episode',  icon: 'play' },
    { id: 'aibrief',  label: 'AI Brief', icon: 'star' },
    { id: 'audience', label: 'Audience', icon: 'chart' },
    { id: 'monetize', label: 'Monetize', icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'freq-mock', 'FREQ — Podcast Intelligence Interactive Mock');
console.log('Mock live at:', result.url);
