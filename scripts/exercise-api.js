#!/usr/bin/env node
// Simple script to POST to the local EdgeOne functions endpoint for /api/models
// Useful to exercise functions after running `edgeone pages dev` (default port 8088)

const url = process.env.EDGEONE_URL || 'http://localhost:8088/api/models';

async function postOnce() {
  console.log(`Posting to ${url} ...`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const text = await res.text();
  return { status: res.status, text };
}

(async () => {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { status, text } = await postOnce();
      console.log('Status:', status);
      try {
        const json = JSON.parse(text);
        console.log('Response JSON:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Response Text:', text);
      }
      process.exit(0);
    } catch (e) {
      const waitMs = Math.min(2000 * attempt, 10000);
      console.error(`Attempt ${attempt} failed: ${e.message || e}. Retrying in ${waitMs}ms ...`);
      if (attempt === maxAttempts) {
        console.error('Failed to fetch local function after multiple attempts. Make sure `edgeone pages dev` is running and that the URL is correct.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
})();
