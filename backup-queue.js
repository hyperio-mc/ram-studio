#!/usr/bin/env node
// backup-queue.js — backup queue.json from GitHub to local disk
// Keeps last 20 backups, reports count changes

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const config      = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const TOKEN       = config.GITHUB_TOKEN;
const REPO        = config.GITHUB_REPO;
const BACKUP_DIR  = path.join(__dirname, 'backups');
const LATEST_PATH = path.join(BACKUP_DIR, 'queue-latest.json');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

function fetchQueue() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${REPO}/contents/queue.json`,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'ram-studio-backup/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`GitHub API ${res.statusCode}: ${d.slice(0,100)}`));
        const fd = JSON.parse(d);
        const content = Buffer.from(fd.content, 'base64').toString('utf8');
        resolve({ content, sha: fd.sha });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const { content, sha } = await fetchQueue();
  const q = JSON.parse(content);
  const subs = q.submissions || (Array.isArray(q) ? q : []);
  const count = subs.length;

  // Read previous latest to detect changes
  let prevCount = null;
  if (fs.existsSync(LATEST_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(LATEST_PATH, 'utf8'));
      const prevSubs = prev.submissions || (Array.isArray(prev) ? prev : []);
      prevCount = prevSubs.length;
    } catch {}
  }

  // Write timestamped backup
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `queue-${ts}.json`);
  fs.writeFileSync(backupPath, content);
  fs.writeFileSync(LATEST_PATH, content);

  // Prune old backups — keep latest 20
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('queue-') && f !== 'queue-latest.json')
    .sort();
  if (files.length > 20) {
    files.slice(0, files.length - 20).forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
    });
  }

  const change = prevCount === null ? '(first backup)'
    : count > prevCount ? `+${count - prevCount} new designs`
    : count < prevCount ? `⚠ ${prevCount - count} REMOVED — was ${prevCount}`
    : 'no change';

  console.log(`✓ Backed up queue.json — ${count} designs — ${change}`);
  console.log(`  SHA: ${sha.slice(0,8)} · File: ${path.basename(backupPath)}`);

  // Output structured result for the scheduler
  process.stdout.write('\n');
  return { count, change, prevCount };
}

main().catch(err => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});
