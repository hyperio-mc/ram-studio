/**
 * fix-pen-format.js
 * Fixes .pen files to comply with the official pencil.dev TypeScript schema
 *
 * Official spec bugs we're fixing:
 *  1. `clipsContent` → `clip`  (wrong property name)
 *  2. `strokeColor`/`strokeWidth` → `stroke: { align, thickness, fill }` (wrong format)
 *  3. Missing `textGrowth` on text nodes with width/height
 *  4. `fontWeight` as number → string (spec: StringOrVariable)
 *  5. Top-level screens at x=0 (all stacked) → apply 425px spacing
 *  6. Missing `id` on every node (required: string, auto-generated if missing)
 *  7. `fill: "transparent"` → `fill: "#00000000"` (must be valid hex)
 */

const fs = require('fs');
const path = require('path');

let idCounter = 0;
function genId() {
  return `n${++idCounter}`;
}

function fixNode(node) {
  if (!node || typeof node !== 'object') return node;
  const fixed = { ...node };

  // 0. Assign unique id if missing
  if (!fixed.id) {
    fixed.id = genId();
  }

  // 1. Fix clipsContent → clip
  if (fixed.clipsContent !== undefined) {
    fixed.clip = fixed.clipsContent;
    delete fixed.clipsContent;
  }

  // 2. Fix strokeColor/strokeWidth → stroke object
  if (fixed.strokeColor !== undefined) {
    fixed.stroke = {
      align: 'inside',
      thickness: fixed.strokeWidth || 1,
      fill: fixed.strokeColor,
    };
    delete fixed.strokeColor;
    delete fixed.strokeWidth;
  }

  // 3. Add textGrowth for text nodes that specify width or height
  if (fixed.type === 'text' && (fixed.width !== undefined || fixed.height !== undefined)) {
    if (!fixed.textGrowth) {
      fixed.textGrowth = 'fixed-width-height';
    }
  }

  // 4. fontWeight as string
  if (typeof fixed.fontWeight === 'number') {
    fixed.fontWeight = String(fixed.fontWeight);
  }

  // 5. Replace "transparent" fill with valid hex
  if (fixed.fill === 'transparent') {
    fixed.fill = '#00000000';
  }

  // Recurse into children
  if (Array.isArray(fixed.children)) {
    fixed.children = fixed.children.map(fixNode);
  }

  return fixed;
}

function fixScreenPositions(children) {
  // Check if all screens are at x=0 (stacked bug)
  const allAtZero = children.every(c => c.x === 0);
  if (!allAtZero) return children; // already has positions, skip

  // Apply 425px spacing (375px width + 50px gutter)
  const frameWidth = children[0]?.width || 375;
  const gutter = 50;
  const spacing = frameWidth + gutter;
  return children.map((s, i) => ({ ...s, x: i * spacing }));
}

function fixPenFile(inputPath, outputPath) {
  const raw = fs.readFileSync(inputPath, 'utf8');
  const doc = JSON.parse(raw);

  // Fix screen positions (must come BEFORE fixNode so coords are set)
  const fixedChildren = fixScreenPositions(doc.children || []);

  // Fix all nodes recursively
  const result = {
    ...doc,
    children: fixedChildren.map(fixNode),
  };

  const out = JSON.stringify(result, null, 2);
  fs.writeFileSync(outputPath, out);

  // Stats
  const origSize = raw.length;
  const newSize = out.length;
  console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  console.log(`  Size: ${(origSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB`);

  // Verify fixes
  let clip=0, stroke=0, textGrowth=0, oldStrokeColor=0, oldClipsContent=0;
  const scan = (nodes) => {
    if (!nodes) return;
    nodes.forEach(n => {
      if (!n) return;
      if (n.clip !== undefined) clip++;
      if (n.stroke) stroke++;
      if (n.type === 'text' && n.textGrowth) textGrowth++;
      if (n.strokeColor) oldStrokeColor++;
      if (n.clipsContent) oldClipsContent++;
      if (n.children) scan(n.children);
    });
  };
  scan(result.children);
  console.log(`  clip: ${clip}, stroke-obj: ${stroke}, textGrowth: ${textGrowth}, remaining-strokeColor: ${oldStrokeColor}, remaining-clipsContent: ${oldClipsContent}`);
  console.log(`  Screens: ${result.children.map(s=>`x=${s.x}`).join(', ')}`);
}

// Run on all app pen files
const filesToFix = [
  'geo-signal.pen',
  'geo-radar.pen',
  'geo-pulse.pen',
  'hive-cyberpunk.pen',
  'vault-app.pen',
  'still-app.pen',
  'tempo-app.pen',
  'field-app.pen',
  'vector-app.pen',
  'draft-app.pen',
  'designd-app.pen',
  'apex-app.pen',
];

const dir = __dirname;
filesToFix.forEach(f => {
  const inp = path.join(dir, f);
  const out = path.join(dir, f.replace('.pen', '-fixed.pen'));
  if (fs.existsSync(inp)) {
    fixPenFile(inp, out);
  } else {
    console.log(`⚠️  ${f} not found, skipping`);
  }
});
