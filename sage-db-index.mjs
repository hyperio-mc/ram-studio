import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entry = JSON.parse(fs.readFileSync(path.join(__dirname, 'sage-entry.json'), 'utf8'));

const db = openDB();
upsertDesign(db, { ...entry });
rebuildEmbeddings(db);
console.log('✓ Indexed SAGE in design DB');
