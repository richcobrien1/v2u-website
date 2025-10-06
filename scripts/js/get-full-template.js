const BASE = process.env.BASE_URL || 'http://localhost:3000'
const ONBOARD = process.env.ADMIN_ONBOARD_TOKEN

if (!ONBOARD) {
  console.error('ADMIN_ONBOARD_TOKEN environment variable is required for this script.')
  process.exit(2)
}

async function getTemplate() {
  const url = new URL('/api/admin/email-template/', BASE)
  url.searchParams.set('history', '0')
  const res = await fetch(url.toString(), { headers: { 'x-admin-onboard-token': ONBOARD } })
  const json = await res.json()
  return { status: res.status, body: json }
}

(async () => {
  console.log('GETing template from', BASE)
  const got = await getTemplate()
  console.log('GET status:', got.status)
  if (got.body && typeof got.body.html === 'string') {
    console.log('\n--- BEGIN FULL HTML FROM API ---\n')
    console.log(got.body.html)
    console.log('\n--- END FULL HTML FROM API ---\n')
  } else {
    console.log('No html returned in GET response:', got.body)
  }
})().catch((err) => { console.error('Error:', err); process.exit(1) })
