import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SILO',
  tagline:   'Pantry intelligence. Meals made effortless.',
  archetype: 'food-kitchen',
  palette: {           // dark theme
    bg:      '#1A0F08',
    surface: '#261810',
    text:    '#F5EDE0',
    accent:  '#C4622A',
    accent2: '#4A7A57',
    muted:   'rgba(245,237,224,0.45)',
  },
  lightPalette: {      // light theme (warm editorial)
    bg:      '#FAF6F0',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#C4622A',
    accent2: '#4A7A57',
    muted:   'rgba(26,20,16,0.4)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Items in Pantry', value: '47', sub: '3 expiring soon' },
        { type: 'metric-row', items: [
          { label: 'Meals Planned', value: '5' },
          { label: 'Shopping List', value: '12' },
          { label: 'Wasted', value: '0' },
        ]},
        { type: 'tags', label: 'Browse by category', items: ['Grains', 'Veggies', 'Dairy', 'Protein', 'Pantry', 'Fruit'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Expiring soon', sub: 'Eggs · 2 days, Yoghurt · 3 days', badge: '3' },
          { icon: 'star',  title: 'Pasta Primavera tonight', sub: 'All ingredients in pantry', badge: '✓' },
          { icon: 'activity', title: 'Added 6 items', sub: 'from Whole Foods · 2h ago', badge: '' },
        ]},
      ],
    },
    {
      id: 'pantry', label: 'Pantry',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Items', value: '47' },
          { label: 'Expiring', value: '3' },
          { label: 'Categories', value: '7' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All (47)', 'Veggies', 'Dairy', 'Grains', 'Protein'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Free-range Eggs', sub: 'Protein · 6 left · 2 days', badge: '⚠' },
          { icon: 'alert', title: 'Greek Yoghurt',   sub: 'Dairy · 400g · 3 days',    badge: '⚠' },
          { icon: 'check', title: 'Sourdough Bread', sub: 'Grains · 1 loaf · good',   badge: 'OK' },
          { icon: 'check', title: 'Cherry Tomatoes', sub: 'Veggies · 150g · good',    badge: 'OK' },
          { icon: 'check', title: 'Parmesan',        sub: 'Dairy · 200g · good',      badge: 'OK' },
        ]},
      ],
    },
    {
      id: 'meals', label: 'Meals',
      content: [
        { type: 'metric-row', items: [
          { label: 'This Week', value: '5' },
          { label: 'Planned kcal', value: '8.2K' },
          { label: 'Ready to Cook', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Breakfast · Avocado Toast', sub: 'Bread + Avocado + Eggs · 380 kcal', badge: '✓' },
          { icon: 'check', title: 'Lunch · Greek Salad',       sub: 'Tomato + Feta + Olive · 290 kcal', badge: '✓' },
          { icon: 'star',  title: 'Dinner · Pasta Primavera',  sub: 'Pasta + Cream + Basil · 480 kcal', badge: 'Cook' },
        ]},
        { type: 'progress', items: [
          { label: 'Breakfast', pct: 62 },
          { label: 'Lunch',     pct: 45 },
          { label: 'Dinner',    pct: 78 },
        ]},
      ],
    },
    {
      id: 'recipe', label: 'Recipe',
      content: [
        { type: 'metric', label: 'Pasta Primavera', value: '480', sub: 'kcal · 25 min · 2 servings' },
        { type: 'tags', label: 'Tags', items: ['Italian', 'Vegetarian', 'Quick', 'Spring', 'Low Cal'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Rigatoni pasta 200g',   sub: 'Grains — in pantry', badge: '✓' },
          { icon: 'check', title: 'Double cream 150ml',    sub: 'Dairy — in pantry',  badge: '✓' },
          { icon: 'check', title: 'Cherry tomatoes 150g',  sub: 'Veggies — in pantry',badge: '✓' },
          { icon: 'alert', title: 'Fresh basil handful',   sub: 'Spice — need to buy',badge: '↓' },
          { icon: 'check', title: 'Parmesan 40g',          sub: 'Dairy — in pantry',  badge: '✓' },
          { icon: 'check', title: 'Garlic cloves × 2',     sub: 'Veggies — in pantry',badge: '✓' },
        ]},
        { type: 'text', label: 'Pantry coverage', value: '5 of 6 ingredients already in your pantry. Just needs fresh basil.' },
      ],
    },
    {
      id: 'shopping', label: 'Shopping',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Items', value: '12' },
          { label: 'Checked', value: '3' },
          { label: 'Store', value: 'WF' },
        ]},
        { type: 'tags', label: 'Shop at', items: ['Whole Foods', "Trader Joe's", 'Local Market'] },
        { type: 'list', items: [
          { icon: 'list', title: 'Produce — Fresh basil', sub: 'for Pasta Primavera', badge: '' },
          { icon: 'list', title: 'Produce — Spinach', sub: 'weekly staple', badge: '' },
          { icon: 'list', title: 'Bakery — Sourdough',   sub: 'expiring today', badge: '!' },
          { icon: 'check',title: 'Dairy — Oat milk 1L', sub: 'running low', badge: '✓' },
          { icon: 'check',title: 'Dairy — Mozzarella',  sub: 'pizza night', badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'Produce', pct: 20 },
          { label: 'Bakery',  pct: 50 },
          { label: 'Dairy',   pct: 67 },
        ]},
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'tags', label: 'Cuisine', items: ['Italian', 'Japanese', 'Mexican', 'Indian', 'French', 'Thai'] },
        { type: 'tags', label: 'Dietary', items: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Shakshuka',        sub: 'Middle Eastern · 20 min · 320 kcal', badge: '♥' },
          { icon: 'star', title: 'Miso Ramen',       sub: 'Japanese · 35 min · 510 kcal',       badge: '♥' },
          { icon: 'star', title: 'Tacos al Pastor',  sub: 'Mexican · 30 min · 440 kcal',        badge: '♥' },
          { icon: 'star', title: 'Crêpes Suzette',   sub: 'French · 25 min · 390 kcal',         badge: '♥' },
        ]},
        { type: 'text', label: 'Trending this week', value: 'Spring ingredients are at peak. Recipes featuring asparagus, peas, and fresh herbs are popular right now.' },
      ],
    },
  ],
  nav: [
    { id: 'home',     label: 'Home',    icon: 'home' },
    { id: 'pantry',   label: 'Pantry',  icon: 'layers' },
    { id: 'meals',    label: 'Meals',   icon: 'calendar' },
    { id: 'recipe',   label: 'Recipe',  icon: 'list' },
    { id: 'shopping', label: 'Shop',    icon: 'zap' },
    { id: 'discover', label: 'Explore', icon: 'search' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'silo-mock', 'SILO — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/silo-mock');
