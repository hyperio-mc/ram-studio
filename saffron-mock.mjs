import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SAFFRON',
  tagline:   'Recipe & Meal Planning',
  archetype: 'food-lifestyle',

  palette: {          // dark theme (required)
    bg:      '#1A130D',
    surface: '#26180F',
    text:    '#F5EFE6',
    accent:  '#E85522',
    accent2: '#4E9161',
    muted:   'rgba(245,239,230,0.42)',
  },

  lightPalette: {     // light theme (enables toggle)
    bg:      '#FAF6EE',
    surface: '#FFFFFF',
    text:    '#1E1712',
    accent:  '#C4420F',
    accent2: '#3B6B4A',
    muted:   'rgba(30,23,18,0.40)',
  },

  screens: [
    {
      id: 'today', label: "Today's Plan",
      content: [
        { type: 'metric', label: "Today's Calories", value: '1,840', sub: 'of 2,200 kcal goal — 84% on track' },
        { type: 'metric-row', items: [
          { label: 'Carbs', value: '210g' },
          { label: 'Protein', value: '88g' },
          { label: 'Fat', value: '54g' },
          { label: 'Meals', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Breakfast — Avocado Toast & Egg', sub: '8:00 AM · 420 kcal', badge: '✓' },
          { icon: 'check', title: 'Lunch — Lemon Herb Quinoa Bowl', sub: '12:30 PM · 580 kcal', badge: '✓' },
          { icon: 'star', title: 'Dinner — Salmon with Roasted Veg', sub: '7:00 PM · 640 kcal', badge: 'Tonight' },
          { icon: 'heart', title: 'Snack — Greek Yogurt & Berries', sub: '3:00 PM · 200 kcal', badge: 'Saved' },
        ]},
        { type: 'progress', items: [
          { label: 'Daily calorie goal', pct: 84 },
          { label: 'Hydration (1.8/2.5L)', pct: 72 },
          { label: 'Weekly variety score', pct: 91 },
        ]},
        { type: 'text', label: 'Today\'s Tip', value: 'Asparagus is at peak season right now — try swapping green beans in tonight\'s salmon recipe for a sweeter, more tender bite.' },
      ],
    },
    {
      id: 'recipes', label: 'Recipes',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved', value: '47' },
          { label: 'Tried', value: '23' },
          { label: 'This Week', value: '3' },
        ]},
        { type: 'tags', label: 'Quick Filters', items: ['Quick (<30m)', 'Vegetarian', 'High Protein', 'Seasonal', 'Dairy-Free'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Asparagus & Pea Risotto', sub: '45 min · 540 kcal · 4.9 ★', badge: 'Spring' },
          { icon: 'heart', title: 'Herb-Crusted Lamb Chops', sub: '25 min · 480 kcal · 4.7 ★', badge: 'Saved' },
          { icon: 'activity', title: 'Mango & Avocado Salsa Bowl', sub: '15 min · 310 kcal · 4.8 ★', badge: 'Easy' },
          { icon: 'zap', title: 'Baked Lemon Herb Salmon', sub: '30 min · 520 kcal · 4.9 ★', badge: 'Top Pick' },
          { icon: 'user', title: 'Thai Green Curry', sub: '40 min · 620 kcal · 4.6 ★', badge: 'Saved' },
        ]},
        { type: 'text', label: 'Chef\'s Pick', value: 'Chef Nadia Kowalski\'s Mediterranean Spring Series features 12 recipes built around peak-season produce. New recipes added every Friday.' },
      ],
    },
    {
      id: 'recipe-detail', label: 'Recipe Detail',
      content: [
        { type: 'metric', label: 'Asparagus & Pea Risotto', value: '4.9 ★', sub: '312 reviews · 45 min · 4 servings · Chef Nadia' },
        { type: 'metric-row', items: [
          { label: 'Calories', value: '540' },
          { label: 'Protein', value: '18g' },
          { label: 'Carbs', value: '72g' },
          { label: 'Fat', value: '16g' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Arborio rice', sub: '300g · In pantry', badge: '✓' },
          { icon: 'check', title: 'Asparagus (trimmed)', sub: '250g · In pantry', badge: '✓' },
          { icon: 'alert', title: 'Fresh peas', sub: '150g · Need to buy', badge: 'Buy' },
          { icon: 'check', title: 'Vegetable stock', sub: '1L · In pantry', badge: '✓' },
          { icon: 'alert', title: 'White wine', sub: '150ml · Need to buy', badge: 'Buy' },
          { icon: 'check', title: 'Parmesan', sub: '60g · In pantry', badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'Ingredients you have', pct: 67 },
          { label: 'Difficulty', pct: 55 },
        ]},
        { type: 'tags', label: 'Recipe Tags', items: ['Vegetarian', 'Seasonal', 'Spring', 'Italian', 'Under 1 Hour'] },
      ],
    },
    {
      id: 'grocery', label: 'Grocery List',
      content: [
        { type: 'metric', label: 'Shopping List', value: '14 items', sub: '8 checked · 6 remaining · ~$34–42 est.' },
        { type: 'progress', items: [
          { label: 'Items checked (8/14)', pct: 57 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Asparagus', sub: '250g · Produce — Risotto', badge: 'Buy' },
          { icon: 'alert', title: 'Fresh peas', sub: '150g · Produce — Risotto', badge: 'Buy' },
          { icon: 'check', title: 'Baby spinach', sub: '100g · Produce', badge: '✓' },
          { icon: 'alert', title: 'Lemons', sub: '3 · Produce', badge: 'Buy' },
          { icon: 'check', title: 'Arborio rice', sub: '300g · Pantry', badge: '✓' },
          { icon: 'alert', title: 'White wine', sub: '150ml · Pantry', badge: 'Buy' },
          { icon: 'alert', title: 'Parmesan', sub: '60g · Dairy — Risotto', badge: 'Buy' },
          { icon: 'check', title: 'Greek yogurt', sub: '200g · Dairy', badge: '✓' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Checked', value: '8' },
          { label: 'Remaining', value: '6' },
          { label: 'Est. Cost', value: '$38' },
          { label: 'Meals', value: '3' },
        ]},
      ],
    },
    {
      id: 'pantry', label: 'Pantry',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Items', value: '62' },
          { label: 'Expiring', value: '4' },
          { label: 'Low Stock', value: '10' },
          { label: 'Well-Stocked', value: '48' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Organic Spinach', sub: 'Expires Apr 13 · Produce', badge: '⚠ Soon' },
          { icon: 'alert', title: 'Whole Milk', sub: 'Expires Apr 12 · Dairy', badge: '⚠ Soon' },
          { icon: 'alert', title: 'Greek Yogurt', sub: 'Expires Apr 14 · Dairy', badge: '⚠ Soon' },
          { icon: 'check', title: 'Arborio Rice', sub: '300g remaining · Pantry', badge: 'Good' },
          { icon: 'check', title: 'Olive Oil', sub: '80% full · Pantry', badge: 'Good' },
          { icon: 'check', title: 'Honey', sub: '250g · Pantry', badge: 'Good' },
        ]},
        { type: 'progress', items: [
          { label: 'Pantry health score', pct: 78 },
          { label: 'Items tracked this month', pct: 86 },
        ]},
        { type: 'tags', label: 'Quick Filter', items: ['All', 'Expiring', 'Produce', 'Pantry', 'Dairy', 'Frozen'] },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'text', label: "Editor's Pick", value: "Mediterranean Spring Series by Chef Nadia Kowalski — 12 recipes built around peak-season asparagus, peas, artichokes, and fresh herbs." },
        { type: 'tags', label: 'Trending Tags', items: ['#spring', '#asparagus', '#highprotein', '#30min', '#vegetarian', '#dairyfree', '#seasonal'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Italian', sub: '284 recipes available', badge: '🍝' },
          { icon: 'star', title: 'Asian', sub: '312 recipes available', badge: '🍜' },
          { icon: 'star', title: 'Mexican', sub: '197 recipes available', badge: '🌮' },
          { icon: 'star', title: 'Mediterranean', sub: '226 recipes available', badge: '🫒' },
          { icon: 'star', title: 'Indian', sub: '178 recipes available', badge: '🍛' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total Recipes', value: '4,200+' },
          { label: 'New This Week', value: '24' },
          { label: 'Trending', value: '18' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',         label: 'Today',    icon: 'home' },
    { id: 'recipes',       label: 'Recipes',  icon: 'search' },
    { id: 'recipe-detail', label: 'Detail',   icon: 'list' },
    { id: 'grocery',       label: 'Shopping', icon: 'check' },
    { id: 'pantry',        label: 'Pantry',   icon: 'layers' },
    { id: 'discover',      label: 'Discover', icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'saffron-mock', 'SAFFRON — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/saffron-mock`);
