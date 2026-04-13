import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GRAZE',
  tagline:   'Eat with intention',
  archetype: 'food-lifestyle',
  palette: {
    bg:      '#2A1F1A',
    surface: '#3A2E27',
    text:    '#F5EFE4',
    accent:  '#C4714F',
    accent2: '#7B9B6B',
    muted:   'rgba(245,239,228,0.42)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#C4714F',
    accent2: '#7B9B6B',
    muted:   'rgba(26,24,24,0.40)',
  },
  screens: [
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'What are we eating tonight?', value: 'Spring', sub: 'Season-led recipes for every occasion' },
        { type: 'tags', label: 'Browse by', items: ['Seasonal', 'Vegetarian', 'Quick', '< 30 min', 'Family'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Lemon Herb Roast Chicken', sub: '1h 20m · 4 servings · Featured', badge: '★ 4.8' },
          { icon: 'heart', title: 'Summer Grain Bowl', sub: '25 min · 2 servings', badge: 'Quick' },
          { icon: 'activity', title: 'Walnut Pesto Pasta', sub: '20 min · 3 servings', badge: 'Veg' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Recipes saved', value: '47' },
          { label: 'Cooked this week', value: '6' },
          { label: 'In season now', value: '12' },
        ]},
        { type: 'text', label: 'In Season', value: 'Asparagus, wild garlic, spring greens, carrots, and strawberries are all at their best right now.' },
      ],
    },
    {
      id: 'recipe',
      label: 'Recipe',
      content: [
        { type: 'metric', label: 'Lemon Herb Roast Chicken', value: '★ 4.8', sub: '1h 20m · 4 servings · 312 reviews' },
        { type: 'tags', label: 'Tags', items: ['Roast', 'Autumn', 'Family', 'Sunday', 'Gluten-free'] },
        { type: 'list', items: [
          { icon: 'check', title: '1 whole chicken (1.8kg)', sub: 'Free-range preferred', badge: 'Protein' },
          { icon: 'check', title: '2 unwaxed lemons', sub: 'Zested and halved', badge: 'Produce' },
          { icon: 'check', title: '40g unsalted butter', sub: 'Softened', badge: 'Dairy' },
          { icon: 'check', title: '4 cloves garlic', sub: 'Crushed', badge: 'Produce' },
          { icon: 'check', title: '1 bunch fresh thyme', sub: 'Large bunch', badge: 'Produce' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Protein', value: '38g' },
          { label: 'Carbs', value: '12g' },
          { label: 'Fat', value: '22g' },
          { label: 'Cals', value: '420' },
        ]},
      ],
    },
    {
      id: 'plan',
      label: 'Meal Plan',
      content: [
        { type: 'metric', label: 'This Week', value: '4 / 7', sub: 'Meals planned · April 7–13, 2026' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Sunday — Dinner', sub: 'Lemon Herb Roast Chicken · 1h 20m', badge: '✓' },
          { icon: 'calendar', title: 'Sunday — Breakfast', sub: 'Avocado Toast with Poached Eggs · 10 min', badge: '✓' },
          { icon: 'calendar', title: 'Saturday — Dinner', sub: 'Miso Glazed Salmon · 20 min', badge: '✓' },
          { icon: 'calendar', title: 'Friday — Lunch', sub: 'Not yet planned', badge: '+' },
          { icon: 'calendar', title: 'Friday — Dinner', sub: 'Not yet planned', badge: '+' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Meals planned', value: '4' },
          { label: 'Prep time', value: '2h 15m' },
          { label: 'Servings', value: '14' },
        ]},
        { type: 'text', label: 'This week', value: 'You\'ve planned 4 of 7 dinners. Add a Friday dinner and weekend lunch to complete the week.' },
      ],
    },
    {
      id: 'grocery',
      label: 'Grocery',
      content: [
        { type: 'metric', label: 'Grocery List', value: '8 / 14', sub: 'Items in cart · This week\'s meals' },
        { type: 'progress', items: [
          { label: 'Produce', pct: 75 },
          { label: 'Protein', pct: 33 },
          { label: 'Pantry', pct: 33 },
          { label: 'Dairy', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Whole chicken (1.8kg)', sub: 'Free-range · Protein', badge: '✓' },
          { icon: 'check', title: 'Lemons (2)', sub: 'Produce', badge: '✓' },
          { icon: 'check', title: 'Fresh thyme', sub: 'Bunch · Produce', badge: '✓' },
          { icon: 'activity', title: 'Avocado (3)', sub: 'Ripe · Produce', badge: '' },
          { icon: 'activity', title: 'Eggs (6 pack)', sub: 'Free-range · Protein', badge: '' },
          { icon: 'activity', title: 'Olive oil (500ml)', sub: 'Extra virgin · Pantry', badge: '' },
        ]},
      ],
    },
    {
      id: 'saved',
      label: 'Cookbook',
      content: [
        { type: 'metric', label: 'My Cookbook', value: '47', sub: 'Saved recipes across 3 collections' },
        { type: 'tags', label: 'Filter', items: ['All', 'Quick', 'Vegetarian', 'Family', 'Slow cook'] },
        { type: 'list', items: [
          { icon: 'heart', title: 'Miso Glazed Salmon', sub: '20 min · Quick', badge: '♥' },
          { icon: 'heart', title: 'Ricotta & Spinach Gnudi', sub: '45 min · Vegetarian', badge: '♥' },
          { icon: 'heart', title: 'Braised Short Ribs', sub: '3h · Slow cook', badge: '♥' },
          { icon: 'heart', title: 'Brown Butter Financiers', sub: '30 min · Dessert', badge: '♥' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Weeknight', value: '12' },
          { label: 'Sunday Roasts', value: '8' },
          { label: 'Desserts', value: '7' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Emma Clarke', value: '6', sub: 'Meals cooked this week · London' },
        { type: 'metric-row', items: [
          { label: 'Saved', value: '47' },
          { label: 'This week', value: '6' },
          { label: 'Collections', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Dietary', sub: 'No restrictions', badge: '›' },
          { icon: 'star', title: 'Skill level', sub: 'Intermediate', badge: '›' },
          { icon: 'home', title: 'Serves', sub: '2–3 people', badge: '›' },
          { icon: 'zap', title: 'Max cook time', sub: '1 hour', badge: '›' },
        ]},
        { type: 'tags', label: 'In season now', items: ['🌱 Asparagus', '🥕 Carrots', '🌿 Wild garlic', '🥬 Spring greens', '🍓 Strawberries'] },
        { type: 'text', label: 'Spring is here', value: 'Update your preferences to get season-led suggestions for April and May.' },
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'plan',     label: 'Plan',     icon: 'calendar' },
    { id: 'grocery',  label: 'Grocery',  icon: 'list' },
    { id: 'saved',    label: 'Cookbook', icon: 'heart' },
    { id: 'profile',  label: 'Me',       icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'graze-mock', 'GRAZE — Interactive Mock');
console.log('Mock live at:', result.url);
