/**
 * deep-audit.js
 * Checks pen files for ALL remaining spec violations per the official
 * pencil.dev TypeScript schema (March 10, 2026)
 */
const fs = require('fs');

const FILE = process.argv[2] || 'geo-signal.pen';
const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const issues = [];
const nodeCount = { total: 0 };

function report(path, msg) {
  issues.push(`  [${path}] ${msg}`);
}

function scanNode(node, path) {
  if (!node || typeof node !== 'object') return;
  nodeCount.total++;

  // Check: id field (required per spec)
  if (!node.id) {
    report(path, `MISSING id (type: ${node.type})`);
  }

  // Check: fill "transparent" is not a valid hex color
  if (node.fill === 'transparent') {
    report(path, `fill: "transparent" is not valid hex — use "#00000000"`);
  }

  // Check: strokeColor/strokeWidth still present
  if (node.strokeColor !== undefined) {
    report(path, `strokeColor should be stroke: { align, thickness, fill }`);
  }

  // Check: clipsContent should be clip
  if (node.clipsContent !== undefined) {
    report(path, `clipsContent should be clip`);
  }

  // Check: text without textGrowth but with width/height
  if (node.type === 'text' && !node.textGrowth && (node.width !== undefined || node.height !== undefined)) {
    report(path, `text with width/height but no textGrowth`);
  }

  // Check: fontWeight as number (should be string)
  if (typeof node.fontWeight === 'number') {
    report(path, `fontWeight should be string ("${node.fontWeight}"), not number`);
  }

  // Check: stroke is correct object format
  if (node.stroke !== undefined && typeof node.stroke !== 'object') {
    report(path, `stroke should be an object {align, thickness, fill}`);
  }

  // Check: fill is array (multiple fills = ok per spec)
  // Check: gradient fill uses correct keys
  if (node.fill && typeof node.fill === 'object' && node.fill.type === 'gradient') {
    if (!node.fill.colors) report(path, `gradient fill missing colors array`);
  }

  // Check: layout values
  if (node.layout && !['none','horizontal','vertical'].includes(node.layout)) {
    report(path, `invalid layout value: "${node.layout}"`);
  }

  // Check: justifyContent values
  const validJC = ['start','center','end','space_between','space_around'];
  if (node.justifyContent && !validJC.includes(node.justifyContent)) {
    report(path, `invalid justifyContent: "${node.justifyContent}"`);
  }

  // Recurse
  if (Array.isArray(node.children)) {
    node.children.forEach((c, i) => scanNode(c, `${path}.children[${i}]`));
  }
}

doc.children.forEach((s, i) => scanNode(s, `screens[${i}]`));

console.log(`\n=== Deep audit: ${FILE} ===`);
console.log(`Total nodes scanned: ${nodeCount.total}`);
console.log(`Issues found: ${issues.length}`);

if (issues.length > 0) {
  // Group by type
  const byType = {};
  issues.forEach(iss => {
    const m = iss.match(/\] (.+)$/);
    const key = m ? m[1].split(' ')[0] : 'other';
    byType[key] = (byType[key] || 0) + 1;
  });
  console.log('\nIssue summary:');
  Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  console.log('\nFirst 10 issues:');
  issues.slice(0, 10).forEach(i => console.log(i));
}
