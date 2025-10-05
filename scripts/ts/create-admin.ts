#!/usr/bin/env node

// Lightweight admin-creation helper script for local/dev use.
// Uses the global `fetch` available in modern Node runtimes. Avoid importing `node-fetch`
// to prevent duplicate `fetch` type declarations during Next.js build.

async function run() {
  const [,, adminId, role, token, apiUrl] = process.argv;
  if (!adminId) {
    console.log('Usage: node scripts/create-admin.js <adminId> [role] [onboardToken] [apiUrl]');
    process.exit(1);
  }

  const payload = {
    token: token || process.env.ADMIN_ONBOARD_TOKEN,
    action: 'create',
    adminId,
    role: role || 'admin'
  };

  const url = apiUrl || 'http://localhost:3000/api/admin-onboard';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

run().catch(err => { console.error(err); process.exit(1); });
