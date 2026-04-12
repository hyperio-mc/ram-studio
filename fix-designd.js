const fs = require('fs');
let idCounter = 0;
function genId() { return 'n' + (++idCounter); }
function fixNode(node) {
  if (!node || typeof node !== 'object') return node;
  const fixed = Object.assign({}, node);
  if (!fixed.id) fixed.id = genId();
  if (fixed.clipsContent !== undefined) { fixed.clip = fixed.clipsContent; delete fixed.clipsContent; }
  if (fixed.strokeColor !== undefined) { fixed.stroke = { align: 'inside', thickness: fixed.strokeWidth || 1, fill: fixed.strokeColor }; delete fixed.strokeColor; delete fixed.strokeWidth; }
  if (fixed.type === 'text' && (fixed.width !== undefined || fixed.height !== undefined) && !fixed.textGrowth) fixed.textGrowth = 'fixed-width-height';
  if (typeof fixed.fontWeight === 'number') fixed.fontWeight = String(fixed.fontWeight);
  if (fixed.fill === 'transparent') fixed.fill = '#00000000';
  if (Array.isArray(fixed.children)) fixed.children = fixed.children.map(fixNode);
  return fixed;
}
const doc = JSON.parse(fs.readFileSync('designd-app.pen', 'utf8'));
const result = Object.assign({}, doc, { children: doc.children.map(fixNode) });
fs.writeFileSync('designd-app.pen', JSON.stringify(result, null, 2));
console.log('Fixed designd-app.pen — nodes with IDs:', idCounter);
