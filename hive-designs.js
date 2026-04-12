const https = require('https');

function publish(slug, title, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const req = https.request({
      hostname: 'zenbin.org', path: `/v1/pages/${slug}`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch(e) { resolve({ status: res.statusCode, body: d }); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

const designs = [];
