/**
 * Keep-Alive Pinger for Render Free Tier Web Services
 * 
 * Render spins down free web services after 15 minutes of inactivity.
 * This script sends an automated keep-alive ping every 14 minutes to ensure
 * the web service stays warm with zero cold starts.
 * 
 * Usage:
 *   node scripts/keep-alive.js
 *   node scripts/keep-alive.js https://your-custom-app.onrender.com
 */

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Load environment variables if available
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const fullPath = path.join(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const DEFAULT_URL = 'https://independent-minds-initiative.onrender.com';
const targetBaseUrl = (
  process.argv[2] ||
  process.env.RENDER_EXTERNAL_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  DEFAULT_URL
).replace(/\/$/, '');

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes (Render sleeps at 15m)
const pingUrl = `${targetBaseUrl}/api/health`;

console.log('='.repeat(65));
console.log('🚀 RENDER COLD-START PREVENTER / KEEP-ALIVE DAEMON');
console.log('='.repeat(65));
console.log(`Target Service : ${targetBaseUrl}`);
console.log(`Endpoint       : ${pingUrl}`);
console.log(`Interval       : Every 14 minutes (prevents 15-min Render idle sleep)`);
console.log('='.repeat(65));

let pingCount = 0;

function pingServer() {
  pingCount++;
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  const client = pingUrl.startsWith('https') ? https : http;

  const req = client.get(pingUrl, { timeout: 30000 }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const durationMs = Date.now() - startTime;
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`[${timestamp}] ✓ Ping #${pingCount} successful (${res.statusCode}) - ${durationMs}ms`);
      } else {
        console.warn(`[${timestamp}] ⚠ Ping #${pingCount} received status ${res.statusCode} (${durationMs}ms)`);
      }
    });
  });

  req.on('timeout', () => {
    req.destroy();
    console.error(`[${timestamp}] ✗ Ping #${pingCount} timed out after 30s`);
  });

  req.on('error', (err) => {
    console.error(`[${timestamp}] ✗ Ping #${pingCount} error: ${err.message}`);
  });
}

// Initial ping on launch
console.log('\nSending initial keep-alive ping...');
pingServer();

// Schedule recurring ping every 14 minutes
const intervalId = setInterval(pingServer, PING_INTERVAL_MS);

// Handle clean shutdown
process.on('SIGINT', () => {
  console.log('\nStopping keep-alive pinger...');
  clearInterval(intervalId);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nTerminating keep-alive pinger...');
  clearInterval(intervalId);
  process.exit(0);
});
