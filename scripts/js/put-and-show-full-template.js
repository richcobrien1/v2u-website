const fs = require('fs')
const path = require('path')

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const ONBOARD = process.env.ADMIN_ONBOARD_TOKEN

if (!ONBOARD) {
  console.error('ADMIN_ONBOARD_TOKEN environment variable is required for this script.')
  process.exit(2)
}

async function putTemplate(html) {
  const url = new URL('/api/admin/email-template/', BASE)
  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-onboard-token': ONBOARD },
    body: JSON.stringify({ html })
  })
  const json = await res.text()
  return { status: res.status, body: json }
}

async function getTemplate() {
  const url = new URL('/api/admin/email-template/', BASE)
  url.searchParams.set('history', '0')
  const res = await fetch(url.toString(), { headers: { 'x-admin-onboard-token': ONBOARD } })
  const json = await res.json()
  return { status: res.status, body: json }
}

(async () => {
  const filePath = path.resolve(process.cwd(), 'docs', 'html', 'email_template.html')
  if (!fs.existsSync(filePath)) {
    console.error('Template file not found at', filePath)
    process.exit(2)
  }

  const html = fs.readFileSync(filePath, 'utf8')
  console.log('Read template file, length:', html.length)

  console.log('PUTting full template to', BASE)
  const put = await putTemplate(html)
  console.log('PUT status:', put.status)
  console.log('PUT response:', put.body)

  console.log('\nGETing template back from API')
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
