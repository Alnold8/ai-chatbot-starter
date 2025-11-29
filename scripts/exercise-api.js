#!/usr/bin/env node
// Simple script to POST to the local EdgeOne functions endpoint for /api/models
// Useful to exercise functions after running `edgeone pages dev` (default port 8088)

const url = process.env.EDGEONE_URL || 'http://localhost:8088/api/models';

(async () => {
  try {
    console.log(`Posting to ${url} ...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    try {
      const json = JSON.parse(text);
      console.log('Response JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response Text:', text);
    }
  } catch (e) {
    console.error('Failed to fetch local function. Make sure `edgeone pages dev` is running and that the URL is correct.');
    console.error(e.message || e);
    process.exit(1);
  }
})();
