// pace-mock.mjs — Svelte interactive mock for PACE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PACE',
  tagline:   'Precision fuel for endurance athletes',
  archetype: 'performance-nutrition-tracker',
  palette: {                    // dark theme
    bg:      '#1A1C18',
    surface: '#252820',
    text:    '#F0EDE8',
    accent:  '#52B788',
    accent2: '#F4A621',
    muted:   'rgba(240,237,232,0.45)',
  },
  lightPalette: {               // light theme — the designed one
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1A1C18',
    accent:  '#2D6A4F',
    accent2: '#F4A621',
    muted:   'rgba(26,28,24,0.45)',
  },
  screens: [
    {
      id: 'today', label: "Today's Fuel",
      content: [
        { type: 'metric', label: 'Calories Eaten', value: '1,847', sub: 'of 2,520 kcal goal' },
        { type: 'metric-row', items: [
          { label: 'Carbs', value: '243g' },
          { label: 'Protein', value: '118g' },
          { label: 'Fat', value: '54g' },
          { label: 'Water', value: '2.1L' },
        ]},
        { type: 'progress', items: [
          { label: 'Carbs (300g target)', pct: 81 },
          { label: 'Protein (180g target)', pct: 66 },
          { label: 'Fat (93g target)', pct: 58 },
          { label: 'Hydration (3L target)', pct: 70 },
        ]},
        { type: 'tags', label: "Next Meal — Pre-Ride Lunch", items: ['580 kcal', '72g carbs', '24g protein', 'In 1h 40m'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Oat & Banana Bowl', sub: 'Breakfast · 7:15am', badge: '410 kcal' },
          { icon: 'check', title: 'Banana + Peanut Butter', sub: 'Snack · 10:00am', badge: '230 kcal' },
          { icon: 'check', title: 'Chicken Rice Bowl', sub: 'Lunch · 12:30pm', badge: '620 kcal' },
        ]},
      ],
    },
    {
      id: 'macros', label: 'Macro Analysis',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Calories', value: '2,284' },
          { label: 'Avg Protein', value: '142g' },
          { label: 'Avg Carbs', value: '287g' },
          { label: 'Avg Fat', value: '71g' },
        ]},
        { type: 'text', label: 'Performance Trend', value: 'This week you averaged 2,284 kcal/day — 4% above your base target, matching your increased training load.' },
        { type: 'progress', items: [
          { label: 'Calorie Goal (6/7 days)', pct: 87 },
          { label: 'Protein Goal (5/7 days)', pct: 71 },
          { label: 'Hydration Goal (4/7 days)', pct: 57 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Mon 2,100 kcal', sub: 'Base training day', badge: '▓░░' },
          { icon: 'chart', title: 'Tue 2,280 kcal', sub: 'Tempo ride', badge: '▓▓░' },
          { icon: 'chart', title: 'Wed 2,520 kcal', sub: 'Long endurance ride', badge: '▓▓▓' },
          { icon: 'chart', title: 'Thu 2,380 kcal', sub: 'Recovery ride', badge: '▓▓░' },
        ]},
      ],
    },
    {
      id: 'recipes', label: 'Recipe Discovery',
      content: [
        { type: 'tags', label: 'Categories', items: ['All', 'Pre-Ride', 'Recovery', 'Race Day', 'Snacks'] },
        { type: 'metric', label: 'Featured Recipe', value: 'Beetroot & Lentil Bowl', sub: '620 kcal · 38g protein · 52g carbs' },
        { type: 'list', items: [
          { icon: 'star',  title: 'Avocado Toast Stack', sub: 'Pre-Ride · 390 kcal', badge: '🥑' },
          { icon: 'heart', title: 'Banana Recovery Shake', sub: 'Recovery · 280 kcal', badge: '🍌' },
          { icon: 'star',  title: 'Quinoa Salad Bowl', sub: 'Lunch · 440 kcal', badge: '🥗' },
          { icon: 'zap',   title: 'Dark Choc Energy Bites', sub: 'Snack · 160 kcal', badge: '🍫' },
          { icon: 'star',  title: 'Pasta Primavera Bowl', sub: 'Pre-Race · 580 kcal', badge: '🍝' },
        ]},
        { type: 'text', label: 'AI Suggestion', value: 'Based on your long ride tomorrow, we recommend increasing carb intake tonight. Pasta Primavera Bowl hits the mark.' },
      ],
    },
    {
      id: 'training', label: 'Training Sync',
      content: [
        { type: 'metric', label: "Today's Workout", value: 'Long Endurance Ride', sub: '4h 30m · ~2,800 kcal burn' },
        { type: 'metric-row', items: [
          { label: 'Pre-Ride', value: '580 kcal' },
          { label: 'During', value: '960 kcal' },
          { label: 'Post-Ride', value: '620 kcal' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Oat + Banana Pre-Ride Bowl', sub: '7:00am — Pre-Ride', badge: '580 kcal' },
          { icon: 'check', title: 'Gel + Banana (every 45m)', sub: '10:30am — During', badge: '240 kcal' },
          { icon: 'play',  title: 'Isotonic drink + dates', sub: '1:00pm — During', badge: '180 kcal' },
          { icon: 'play',  title: 'Recovery Protein Shake', sub: '3:30pm — Post-Ride', badge: '360 kcal' },
          { icon: 'play',  title: 'Pasta + Salmon Dinner', sub: '7:00pm — Post-Ride', badge: '720 kcal' },
        ]},
        { type: 'progress', items: [
          { label: 'Fuel plan completed', pct: 40 },
        ]},
      ],
    },
    {
      id: 'review', label: 'Weekly Review',
      content: [
        { type: 'metric', label: 'Performance Score', value: '87/100', sub: '↑ +6 from last week · Mar 24–30' },
        { type: 'metric-row', items: [
          { label: 'Nutrition', value: '91%' },
          { label: 'Hydration', value: '74%' },
          { label: 'Consistency', value: '84%' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Best protein week yet', sub: 'Averaged 142g/day — 18% above goal', badge: '🏆' },
          { icon: 'zap',   title: 'Pre-ride fueling optimized', sub: 'Carb loading improved HR response', badge: '⚡' },
          { icon: 'alert', title: 'Hydration needs work', sub: 'Hit 3L target only 4 of 7 days', badge: '💧' },
        ]},
        { type: 'text', label: 'Next Week - Taper Phase', value: 'Lower training volume means lower calorie targets but higher carb ratio. Your taper nutrition plan is ready.' },
        { type: 'progress', items: [
          { label: 'Avg Calories 2,284 kcal/day', pct: 87 },
          { label: 'Total Protein 994g this week', pct: 95 },
          { label: 'Rides fueled 6/7', pct: 86 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'macros',   label: 'Macros',   icon: 'chart' },
    { id: 'recipes',  label: 'Recipes',  icon: 'search' },
    { id: 'training', label: 'Training', icon: 'activity' },
    { id: 'review',   label: 'Review',   icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pace-mock', 'PACE — Interactive Mock');
console.log('Mock live at:', result.url);
