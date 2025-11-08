const OLD_TOKEN = "EAATsC3s5vgkBPxE72y3J4x4uK9h2gpZAZBuByh7kiZBLBZAFNERH4V0qHo7fXFZC9fZAopZBuKtjz7Nl6w83Kv4UvDpIm8gFZCLiNQcQQNKQE75uw9gqPFmauCktDOxomiaL7QQaXqHpEBZBEtWZArGIk3yJj46AEDFXi3ZCUrPeuFSm2vZCyT0lU1ZB2LMRzfhh16bFIs56UgB6BkOCoGuE48POHVqRTZCFjnYvbQwnnd";
const PROFILE_ID = "61579036979691";

async function checkOldCredentials() {
  console.log("Checking old Facebook credentials...\n");
  
  // Try to get info with profile ID
  const response = await fetch(`https://graph.facebook.com/v21.0/${PROFILE_ID}?fields=name,id&access_token=${OLD_TOKEN}`);
  const data = await response.json();
  
  console.log("Profile/Page Info:");
  console.log(JSON.stringify(data, null, 2));
  
  // Check if token is still valid
  const debugResponse = await fetch(`https://graph.facebook.com/v21.0/debug_token?input_token=${OLD_TOKEN}&access_token=1385433963019785|UHypoFyHSBCtSc5vAvtHytN24WA`);
  const debugData = await debugResponse.json();
  
  console.log("\nToken Debug Info:");
  console.log(JSON.stringify(debugData, null, 2));
}

checkOldCredentials();
