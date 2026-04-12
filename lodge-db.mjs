import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();
await upsertDesign(db, {
  id:           `heartbeat-lodge-${Date.now()}`,
  app_name:     'Lodge',
  tagline:      'Boutique Nature Retreats',
  archetype:    'hospitality-booking-editorial',
  design_url:   'https://ram.zenbin.org/lodge',
  mock_url:     'https://ram.zenbin.org/lodge-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Light editorial booking app for boutique cabin stays. Warm cream, bark brown, sage green. Discover → Property Detail → Date Picker → Guest Details with cancellation policy → Confirmation → My Trips. Inspired by Moke Valley Cabin on Siteinspire. 522 elements.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: Lodge indexed ✓');
