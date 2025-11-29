#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const path = require('path');

function checkEdgeOne() {
  try {
    const r = spawnSync('edgeone', ['--version'], { stdio: 'pipe' });
    if (r.error) return false;
    if (r.status !== 0) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function runEdgeOneDev() {
  console.log('Starting EdgeOne local dev (edgeone pages dev)...');
  const child = spawn('edgeone', ['pages', 'dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: false,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`edgeone exited with signal ${signal}`);
      process.exit(1);
    } else {
      console.log(`edgeone exited with code ${code}`);
      process.exit(code);
    }
  });

  child.on('error', (err) => {
    console.error('Failed to start edgeone:', err.message || err);
    process.exit(1);
  });
}

function printInstallHelp() {
  console.error('\nEdgeOne CLI not found on your PATH. Follow the steps below to install:');
  console.error('\n1) Install globally via npm:');
  console.error('   npm i -g edgeone');
  console.error('\n2) Initialize functions (if you haven\'t yet):');
  console.error('   npm run edgeone:init');
  console.error('\n3) Link the project to your EdgeOne account (optional):');
  console.error('   npm run edgeone:link');
  console.error('\nAfter installation, run:');
  console.error('   npm run dev:functions');
  console.error('\nIf you prefer to install via another method, see https://pages.edgeone.ai/document/edgeone-cli');
}

(function main() {
  const hasEdgeOne = checkEdgeOne();
  if (!hasEdgeOne) {
    printInstallHelp();
    process.exit(1);
  }

  // Run edgeone pages dev in the current project root
  runEdgeOneDev();
})();
