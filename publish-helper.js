// publish-helper.js — shared helper for publishing pages to ram.zenbin.org
'use strict';
const https = require('https');
const fs    = require('fs');

let _config = null;
function getConfig() {
  if (!_config) {
    _config = JSON.parse(fs.readFileSync('./community-config.json', 'utf8'));
  }
  return _config;
}

/**
 * Publish an HTML page to ram.zenbin.org/{slug}
 * @param {string} html   - Full HTML content
 * @param {string} slug   - URL slug
 * @param {string} title  - Page title (unused in API call, kept for logging)
 * @returns {Promise<{status, url, ok}>}
 */
function publishPage(html, slug, title) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ html }));
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const ok = res.statusCode === 200 || res.statusCode === 201;
        resolve({ status: res.statusCode, url: `https://ram.zenbin.org/${slug}`, ok, body: data });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { publishPage };
