# Meta Platform Credentials

## Extended User Access Token (60 days)
```
EAATsC3s5vgkBP7sq4x8ENDSl5fMepZCMO59uFkTfajuel6dS5ygQOD3nzahre6M6hB0TSz0pyCXCa5YlGnE0z6ZADfMeU0RC8Mkh9uMr4E94bisfZBZCsFeYFOP9LGhmvTSVxv0aW0FWTCAyd7AOfI7Qank5QPtP4JL38k2tiH7oVZBVKtTZCmLeSQMPyfgDs9
```
Expires: ~60 days from Nov 8, 2025

---

## Facebook Page 1: "AI-Now"
- **Page ID:** `809650095556499`
- **Page Access Token:** `EAATsC3s5vgkBP2WW7eVZBGOU64dExnLiyUcCy7xum0iJTSTMAKwsLumrYThng4fAHycqmGtyVZCXG1c2RivHOz2BLAXBkdSHjW450tQIn6CfdcyHZAykdWm4RMJpG5uiWC0N5d0PgewydLZAB...` (truncated - need full token)

---

## Facebook Page 2: "V2U"
- **Page ID:** `565965183263645`
- **Page Access Token:** `EAATsC3s5vgkBPZBnMQJZAQ9ZA2Aq74g2kwk1daAPQAbzGbnOSarJwc46tRfdQzAaRP1NVdNvDorzI3KTFP2JvZAHRa15X9OLyWuCNbsKD5qDjAaKsK5UFmBIcD3EZB2r6vsazInXzmcqk4YjZB3m...` (truncated - need full token)

---

## Next Steps:

Need to get FULL page access tokens. The curl command is truncating them.

### Option 1: Use Graph API Explorer UI
1. Go to: https://developers.facebook.com/tools/explorer/
2. Select "AI-Now" app
3. In query field: `me/accounts`
4. Click Submit
5. Copy FULL access_token for each page from the JSON response

### Option 2: Fix the script
The helper script should have worked but something went wrong. Let me check...

---

## What We Know So Far:

✅ You have 2 Facebook Pages:
   - AI-Now (809650095556499)
   - V2U (565965183263645)

⏳ Need to verify which has Instagram linked
⏳ Need to check for Threads accounts
⏳ Need COMPLETE access tokens (not truncated)
