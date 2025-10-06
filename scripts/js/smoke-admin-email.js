// Node.js smoke test for admin email-template API (no deps)
const BASE = process.env.BASE_URL || 'http://localhost:3000'
const ONBOARD = process.env.ADMIN_ONBOARD_TOKEN

if (!ONBOARD) {
  console.error('ADMIN_ONBOARD_TOKEN environment variable is required for this smoke test.')
  process.exit(2)
}

async function getTemplate(history = true) {
  const url = new URL('/api/admin/email-template/', BASE)
  if (history) url.searchParams.set('history', '1')
  const res = await fetch(url.toString(), { headers: { 'x-admin-onboard-token': ONBOARD } })
  const json = await res.json()
  return { status: res.status, body: json }
}

async function putTemplate(html) {
  const url = new URL('/api/admin/email-template/', BASE)
  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-onboard-token': ONBOARD },
    body: JSON.stringify({ html })
  })
  const text = await res.text()
  return { status: res.status, body: text }
}

(async () => {
  console.log('Base URL:', BASE)
  console.log('Using onboard token:', ONBOARD)

  console.log('\nGET current template + history')
  const before = await getTemplate(true)
  console.log('Status:', before.status)
  console.log('Source:', before.body?.source)
  console.log('History length:', (before.body?.history || []).length)

  const ts = new Date().toISOString()
  const html = `<p>smoke test - ${ts}</p>`
  console.log('\nPUT new template (small payload)')
  const put = await putTemplate(html)
  console.log('PUT status:', put.status)
  console.log('PUT body (first 200 chars):', String(put.body).slice(0, 200))

  console.log('\nGET template + history (after PUT)')
  const after = await getTemplate(true)
  console.log('Status:', after.status)
  const hist = after.body?.history || []
  console.log('History length:', hist.length)
  if (hist.length) {
    console.log('Most recent history entry:')
    const h = hist[0]
    console.log({ action: h.action, timestamp: h.timestamp, actor: h.actor })
  }
})().catch((err) => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
