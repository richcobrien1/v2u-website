#!/usr/bin/env node
import fetch from 'node-fetch';
import argv from 'process';

async function run() {
  const [,, adminId, role, token, apiUrl] = argv.argv;
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
#!/usr/bin/env node
import fetch from 'node-fetch';
import argv from 'process';

async function run() {
  const [,, adminId, role, token, apiUrl] = argv.argv;
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
