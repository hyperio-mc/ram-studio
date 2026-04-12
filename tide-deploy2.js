const fs = require('fs');
const https = require('https');

const SLUG     = 'tide';
const APP_NAME = 'Tide';
const TAGLINE  = 'Your money, in motion';
const C = {
  bg:'#F4F0E8', surface:'#FFFFFF', surfaceAlt:'#EDE7D9', text:'#1C1A18',
  textMuted:'rgba(28,26,24,0.50)', accent:'#2A5F4A', accentLt:'#EBF4F0',
  amber:'#E8893A', amberLt:'#FEF3E8', glass:'rgba(255,255,255,0.72)',
  border:'rgba(28,26,24,0.08)', borderMd:'rgba(28,26,24,0.14)',
};

function zenbin(slug, html, title) {
  return new Promise((res, rej) => {
    const body = JSON.stringify({ slug, html, title });
    const opts = {
      hostname: 'zenbin.org', port: 443,
      path: '/v1/pages/' + slug, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': 'ram' }
    };
    const r = https.request(opts, resp => {
      let d = ''; resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej); r.write(body); r.end();
  });
}

// Read hero HTML from tide-publish.js output (already has the template)
// We'll rebuild it inline here rather than parsing
const heroHtml = fs.readFileSync('/workspace/group/design-studio/tide-publish.js', 'utf8')
  .match(/const heroHtml = `([\s\S]*?)`;/)?.[1];

if (!heroHtml) { console.error('Could not extract heroHtml'); process.exit(1); }

const fullHero = '<!DOCTYPE html>\n<html lang="en">\n' +
  heroHtml.replace(/^\s*<!DOCTYPE html>\s*<html lang="en">\s*/,'');

// Actually just use the whole heroHtml var (it's a template literal result)
