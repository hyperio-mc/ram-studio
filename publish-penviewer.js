const fs = require('fs');
const https = require('https');

function post(slug, title, html) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

const html = fs.readFileSync('penviewer-app.html', 'utf8');
console.log('HTML size:', (html.length / 1024).toFixed(1), 'KB');

post('pen-viewer', 'Pen Viewer — pencil.dev SVG Renderer', html).then(r => {
  console.log('HTTP', r.status);
  if (r.status === 201) console.log('Live: https://zenbin.org/p/pen-viewer');
  else if (r.status === 409) {
    console.log('Slug taken, trying pen-viewer-2...');
    return post('pen-viewer-2', 'Pen Viewer — pencil.dev SVG Renderer', html);
  } else console.log('Response:', r.body);
}).then(r2 => {
  if (r2) {
    console.log('HTTP', r2.status);
    if (r2.status === 201) console.log('Live: https://zenbin.org/p/pen-viewer-2');
    else console.log('Response:', r2.body);
  }
});
