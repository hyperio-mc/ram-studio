// render-journal-07.mjs
// Renders Journal 07 video summary to MP4 using Remotion
// Usage: node render-journal-07.mjs

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('📦 Bundling Journal 07 composition...');
const bundled = await bundle({
  entryPoint: path.join(__dirname, 'remotion-breakdown/Journal07Root.jsx'),
  webpackOverride: (config) => config,
});

console.log('🎬 Selecting composition...');
const composition = await selectComposition({
  serveUrl: bundled,
  id: 'Journal07',
  inputProps: {},
});

const outPath = path.join(__dirname, 'journal-07-breakdown.mp4');
console.log(`🎥 Rendering ${composition.durationInFrames} frames @ ${composition.fps}fps...`);
console.log(`   Duration: ${(composition.durationInFrames / composition.fps).toFixed(1)}s`);
console.log(`   Resolution: ${composition.width}×${composition.height}`);

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: outPath,
  ffmpegExecutable: '/tmp/ffmpeg',
  chromiumOptions: {
    executablePath: '/usr/bin/chromium',
    disableWebSecurity: true,
  },
  onProgress: ({ progress, renderedFrames }) => {
    if (renderedFrames % 30 === 0 || renderedFrames === composition.durationInFrames) {
      process.stdout.write(`\r   Frame ${renderedFrames}/${composition.durationInFrames} (${Math.round(progress * 100)}%)  `);
    }
  },
  logLevel: 'error',
});

console.log(`\n✓ Rendered: ${outPath}`);
const { statSync } = await import('fs');
const size = statSync(outPath).size;
console.log(`  Size: ${(size / 1024 / 1024).toFixed(1)}MB`);
