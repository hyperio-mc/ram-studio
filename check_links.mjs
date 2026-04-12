import https from 'https';
import http from 'http';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));

const GITHUB_TOKEN = config.GITHUB_TOKEN;
const GITHUB_REPO = config.GITHUB_REPO;
const QUEUE_FILE = config.QUEUE_FILE;

function fetchQueueFromGitHub() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/${QUEUE_FILE}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'link-checker-script',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API returned ${res.statusCode}: ${data}`));
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = Buffer.from(parsed.content, 'base64').toString('utf8');
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || url.trim() === '') {
      resolve({ url, status: 'NO_URL', ok: false });
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      resolve({ url, status: 'INVALID_URL', ok: false });
      return;
    }

    const lib = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 link-checker'
      },
      timeout: 10000
    };

    const req = lib.request(options, (res) => {
      const status = res.statusCode;
      resolve({ url, status, ok: status >= 200 && status < 400 });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT', ok: false });
    });

    req.on('error', (e) => {
      resolve({ url, status: `ERROR: ${e.message}`, ok: false });
    });

    req.end();
  });
}

async function checkBatch(urlChecks) {
  return Promise.all(urlChecks.map(({ url, key, appName }) =>
    checkUrl(url).then(result => ({ ...result, key, appName }))
  ));
}

async function main() {
  console.log('Fetching queue.json from GitHub...');
  let queue;
  try {
    queue = await fetchQueueFromGitHub();
  } catch (e) {
    console.error('Failed to fetch queue:', e.message);
    process.exit(1);
  }

  console.log('Queue type:', typeof queue, Array.isArray(queue) ? '(array)' : '(object)');
  if (!Array.isArray(queue)) {
    console.log('Queue top-level keys:', Object.keys(queue));
    console.log('Raw queue sample:', JSON.stringify(queue).slice(0, 500));
  }

  // Handle both array and object-wrapped formats
  let submissions = queue;
  if (!Array.isArray(queue)) {
    // Try common wrapper keys
    submissions = queue.submissions || queue.queue || queue.entries || queue.items || Object.values(queue);
  }

  console.log(`Found ${submissions.length} submission(s) in queue.\n`);

  // Build list of all URL checks
  const urlChecks = [];
  for (const submission of submissions) {
    const appName = submission.app_name || submission.name || '(unknown)';
    if (submission.design_url) {
      urlChecks.push({ url: submission.design_url, key: 'design_url', appName });
    } else {
      urlChecks.push({ url: '', key: 'design_url', appName });
    }
    if (submission.mock_url) {
      urlChecks.push({ url: submission.mock_url, key: 'mock_url', appName });
    } else {
      urlChecks.push({ url: '', key: 'mock_url', appName });
    }
  }

  console.log(`Checking ${urlChecks.length} URLs in parallel...\n`);

  // Check all URLs in batches of 10
  const BATCH_SIZE = 10;
  const results = [];
  for (let i = 0; i < urlChecks.length; i += BATCH_SIZE) {
    const batch = urlChecks.slice(i, i + BATCH_SIZE);
    const batchResults = await checkBatch(batch);
    results.push(...batchResults);
  }

  // Group results by appName
  const byApp = {};
  for (const result of results) {
    if (!byApp[result.appName]) {
      byApp[result.appName] = {};
    }
    byApp[result.appName][result.key] = result;
  }

  // Display results
  console.log('='.repeat(70));
  console.log('RESULTS BY APP');
  console.log('='.repeat(70));

  const brokenApps = [];
  const workingApps = [];

  for (const [appName, urls] of Object.entries(byApp)) {
    const designResult = urls['design_url'];
    const mockResult = urls['mock_url'];

    const designOk = designResult ? designResult.ok : null;
    const mockOk = mockResult ? mockResult.ok : null;

    const hasBroken = (designResult && !designResult.ok) || (mockResult && !mockResult.ok);

    if (hasBroken) {
      brokenApps.push({ appName, designResult, mockResult });
    } else {
      workingApps.push({ appName, designResult, mockResult });
    }
  }

  console.log('\n--- APPS WITH BROKEN LINKS ---\n');
  if (brokenApps.length === 0) {
    console.log('  None! All checked URLs are working.');
  } else {
    for (const { appName, designResult, mockResult } of brokenApps) {
      console.log(`App: ${appName}`);
      if (designResult) {
        const icon = designResult.ok ? '[OK]' : '[BROKEN]';
        console.log(`  design_url ${icon} (HTTP ${designResult.status}): ${designResult.url}`);
      }
      if (mockResult) {
        const icon = mockResult.ok ? '[OK]' : '[BROKEN]';
        console.log(`  mock_url   ${icon} (HTTP ${mockResult.status}): ${mockResult.url}`);
      }
      console.log();
    }
  }

  console.log('\n--- APPS WITH ALL WORKING LINKS ---\n');
  if (workingApps.length === 0) {
    console.log('  None.');
  } else {
    for (const { appName, designResult, mockResult } of workingApps) {
      console.log(`App: ${appName}`);
      if (designResult) {
        console.log(`  design_url [OK] (HTTP ${designResult.status}): ${designResult.url}`);
      }
      if (mockResult) {
        console.log(`  mock_url   [OK] (HTTP ${mockResult.status}): ${mockResult.url}`);
      }
      console.log();
    }
  }

  console.log('='.repeat(70));
  console.log(`SUMMARY: ${brokenApps.length} app(s) with broken links, ${workingApps.length} app(s) fully working.`);
  console.log('='.repeat(70));
}

main();
