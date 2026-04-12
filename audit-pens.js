const fs = require('fs');
const files = ['vault-app.pen','convene.pen','geo-signal.pen','geo-radar.pen','geo-pulse.pen','hive-cyberpunk.pen','still-app.pen','tempo-app.pen','field-app.pen'];
files.forEach(f => {
  try {
    const d = JSON.parse(fs.readFileSync(f,'utf8'));
    let clipsContent=0, clip=0, strokeColor=0, noTextGrowth=0, textWithGrowth=0;
    const scan = (nodes) => {
      if (!nodes) return;
      nodes.forEach(n => {
        if (!n) return;
        if (n.clipsContent) clipsContent++;
        if (n.clip !== undefined) clip++;
        if (n.strokeColor) strokeColor++;
        if (n.type === 'text') { if (n.textGrowth) textWithGrowth++; else noTextGrowth++; }
        if (n.children) scan(n.children);
      });
    };
    scan(d.children);
    const xs = d.children.map(s=>s.x).join(',');
    console.log(f.padEnd(20), '| x:', xs.slice(0,25).padEnd(25), '| clipsContent:', clipsContent, '| strokeColor:', strokeColor, '| text_noGrowth:', noTextGrowth);
  } catch(e) { console.log(f, 'ERR:', e.message); }
});
