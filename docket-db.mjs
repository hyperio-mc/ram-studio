import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           'heartbeat-docket',
  app_name:     'DOCKET',
  tagline:      'Documents that think with you.',
  archetype:    'ai-document-intelligence',
  design_url:   'https://ram.zenbin.org/docket',
  mock_url:     'https://ram.zenbin.org/docket-mock',
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'AI document intelligence for legal professionals — editorial light theme with warm linen palette, terracotta accent, numbered section dividers, pull-quote clause flags, and Lora serif typography. Inspired by V7 Go (land-book.com) operational AI aesthetic.',
  screens:      5,
  source:       'heartbeat',
  theme:        'light'
});
rebuildEmbeddings(db);
console.log('✓ Indexed DOCKET in design DB');
