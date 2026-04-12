const fs = require('fs');
let n = 0;
function genId() { return 'a' + (++n); }
function fix(node) {
  if (!node || typeof node !== 'object') return node;
  const f = Object.assign({}, node);
  if (!f.id) f.id = genId();
  if (f.clipsContent !== undefined) { f.clip = f.clipsContent; delete f.clipsContent; }
  if (f.strokeColor !== undefined) {
    f.stroke = { align: 'inside', thickness: f.strokeWidth || 1, fill: f.strokeColor };
    delete f.strokeColor; delete f.strokeWidth;
  }
  if (f.type === 'text' && (f.width !== undefined || f.height !== undefined) && !f.textGrowth) {
    f.textGrowth = 'fixed-width-height';
  }
  if (typeof f.fontWeight === 'number') f.fontWeight = String(f.fontWeight);
  if (f.fill === 'transparent') f.fill = '#00000000';
  if (Array.isArray(f.children)) f.children = f.children.map(fix);
  return f;
}
const doc = JSON.parse(fs.readFileSync('apex-app.pen', 'utf8'));
const result = Object.assign({}, doc, { children: doc.children.map(fix) });
fs.writeFileSync('apex-app.pen', JSON.stringify(result, null, 2));
console.log('Fixed apex-app.pen — total nodes:', n);
