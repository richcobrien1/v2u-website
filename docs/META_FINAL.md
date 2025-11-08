# Meta Platform Credentials - FINAL

Based on your screenshot showing Instagram @v2u_ainow connected to AI-Now Facebook Page.

## Add these to your .env.local:

```bash
# Meta App
META_APP_ID_AI="1385433963019785"
META_APP_SECRET_AI="8495b40412e90e4e136c048c9ff15519"

# Facebook Page: AI-Now
FACEBOOK_PAGE_ID="809650095556499"
FACEBOOK_PAGE_NAME="AI-Now"
FACEBOOK_ACCESS_TOKEN="<NEED_PAGE_ACCESS_TOKEN>"
FACEBOOK_URL="https://facebook.com/AI-Now"

# Instagram: @v2u_ainow (connected to AI-Now page)
INSTAGRAM_USER_ID="<NEED_INSTAGRAM_BUSINESS_ACCOUNT_ID>"
INSTAGRAM_USERNAME="v2u_ainow"
INSTAGRAM_ACCESS_TOKEN="<SAME_AS_FACEBOOK_PAGE_TOKEN>"
INSTAGRAM_URL="https://instagram.com/v2u_ainow"

# Facebook Page: V2U
FACEBOOK_V2U_PAGE_ID="565965183263645"
FACEBOOK_V2U_ACCESS_TOKEN="<NEED_PAGE_ACCESS_TOKEN>"
```

## To get the missing pieces:

Since the Graph API isn't cooperating, go to:
**https://developers.facebook.com/tools/explorer/**

Run these queries ONE AT A TIME and paste me the results:

1. `809650095556499?fields=access_token`
2. `809650095556499?fields=instagram_business_account`
3. `565965183263645?fields=access_token`

Copy/paste each result here.
