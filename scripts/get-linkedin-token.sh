#!/bin/bash
# Simple LinkedIn OAuth token getter
# Run this and paste the URL in your browser

CLIENT_ID="86n4g462pt6dix"
REDIRECT_URI="http://localhost:3000/api/linkedin/callback"
SCOPE="r_liteprofile%20r_emailaddress%20w_member_social"

echo "1. Open this URL in your browser:"
echo ""
echo "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=$CLIENT_ID&redirect_uri=$REDIRECT_URI&scope=$SCOPE"
echo ""
echo "2. After authorizing, copy the 'code' parameter from the redirect URL"
echo "3. Run: curl -X POST 'https://www.linkedin.com/oauth/v2/accessToken' -d 'grant_type=authorization_code&code=YOUR_CODE&client_id=$CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=$REDIRECT_URI'"
