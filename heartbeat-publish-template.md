# Heartbeat Publish Checklist

## Standard flow for every design

### 1. Generate pen
```
node [name]-app.js        # generates [name].pen
```

### 2. Publish hero + gallery
```
node [name]-publish.js    # publishes to zenbin.org/p/[name], updates queue.json
```
Must use: `generateSvelteComponent(design)` is Svelte SOURCE only.

### 3. Build + publish mock  
```
node [name]-mock.mjs      # MUST call buildMock(svelteSource, opts) before publishing
```
Correct flow:
```js
const svelteSource = generateSvelteComponent(design);  // raw .svelte template
const html = await buildMock(svelteSource, { appName, tagline, slug });  // compiled HTML
await publishMock(html, slug, title);  // push to zenbin
```
❌ DO NOT publish `generateSvelteComponent()` output directly — it's uncompiled.

### 4. Index in DB
```
node [name]-db.mjs        # indexes in SQLite design DB
```

### 5. QC (automatic at end of publish script)
```js
import { runQC } from './heartbeat-qc.mjs';
const qc = await runQC({ name, design_url, mock_url });
if (!qc.pass) process.exit(1);  // block Telegram message if QC fails
```
QC checks:
- design_url returns 200
- mock_url returns 200  
- Mock is compiled (no raw Svelte syntax)
- Mock app mounts (.app-name renders in browser)
- Screenshot saved to qc-screenshots/[name]-mock-qc.png
