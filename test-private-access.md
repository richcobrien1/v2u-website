# 🔒 Private Store Access Testing Plan

## Prerequisites
- [ ] Stripe webhooks configured and pointing to your domain
- [ ] Cloudflare KV namespace `v2u-kv` set up
- [ ] Environment variables configured:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `JWT_SECRET`

## Test Scenarios

### 1. **New Subscription Flow** ✅
**Test:** Customer completes Stripe checkout

**Expected KV Storage:**
```
access:{customerId} = "granted"
secret:{customerId} = "{random-uuid}"
subscription:{customerId} = "{subscription-id}"
```

**Verification:**
```bash
# Test the verify-session endpoint
curl "https://yourdomain.com/api/verify-session?session_id={stripe-session-id}"
```

**Expected Response:**
```json
{
  "granted": true,
  "jwt": "eyJ..."
}
```

### 2. **Access Verification** ✅
**Test:** Use JWT to access protected content

**Verification:**
```bash
# Test the auth endpoint
curl -H "Authorization: Bearer {jwt-token}" \
     "https://yourdomain.com/api/auth?customerId={customer-id}"
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Access granted",
  "customerId": "{customer-id}",
  "subscriptionId": "{subscription-id}",
  "tokenPayload": {...},
  "kvState": {
    "access": "granted",
    "hasSecret": true,
    "hasSubscription": true
  }
}
```

### 3. **Payment Failure Handling** ✅
**Test:** Simulate failed payment webhook

**Expected Behavior:**
- Access revoked from KV storage
- All customer keys deleted
- Subsequent API calls return 403

### 4. **Subscription Cancellation** ✅
**Test:** Cancel subscription through Stripe

**Expected Behavior:**
- `customer.subscription.deleted` webhook fired
- Access revoked immediately
- Customer loses private store access

## Quick Manual Tests

### Test 1: Create Test Private Content
Create a simple protected page that requires authentication:

```tsx
// app/private/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function PrivatePage() {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const sessionId = new URLSearchParams(window.location.search).get('session_id')
      if (!sessionId) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/verify-session?session_id=${sessionId}`)
        const data = await res.json()
        setHasAccess(data.granted)
      } catch (err) {
        console.error('Access check failed:', err)
      }
      setLoading(false)
    }

    checkAccess()
  }, [])

  if (loading) return <div>Checking access...</div>
  if (!hasAccess) return <div>❌ Access denied - Please subscribe</div>

  return (
    <div>
      <h1>🔒 Private Store</h1>
      <p>✅ Welcome to the exclusive content!</p>
      <p>This is only visible to paying subscribers.</p>
    </div>
  )
}
```

### Test 2: Stripe CLI Webhook Testing
```bash
# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted
```

### Test 3: KV Storage Verification
```bash
# Check if customer data exists (using Cloudflare CLI)
wrangler kv:key get "access:cus_test123" --binding=v2u-kv
wrangler kv:key get "secret:cus_test123" --binding=v2u-kv
wrangler kv:key get "subscription:cus_test123" --binding=v2u-kv
```

## Success Criteria ✅

Your private store access is complete when:

- [ ] New subscriptions automatically grant access
- [ ] JWT tokens work for API authentication  
- [ ] Failed payments revoke access immediately
- [ ] Cancelled subscriptions lose access
- [ ] Protected content blocks unauthorized users
- [ ] Webhook events are processed reliably

## Next Steps

Once these tests pass, you'll be ready to build:
1. **Private Podcast Portal** - Premium content area
2. **Public Podcast Portal** - Free content showcase
3. **User Dashboard** - Subscription management
4. **Content Gating** - Automatic access control

---

**Status:** Ready for testing 🚀
**Blocker:** None identified
**Risk:** Low - Architecture is solid