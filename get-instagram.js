const PAGE_TOKEN_AINOW = "EAATsC3s5vgkBP66ZC2IMrehJnXEZCZAQEDgatBWAgnlP6xyGEdaTmmZCuGUZABG75J7brkgfgl7LfvxFuhopvUb0I37vWRSdvqMsyhGpkcUfZCv3bR7ZAhytj9QPkw2uIZAn4o40YcmvXmZC3ZBxjKo3FZC1psonZAakVnbUO77VfxUyYyUFOzATOpilhYg3PCpm5MhcGkQoAjUFeibbmioOZAT3cr6ZCjKluZCVu5fZB8k15ZCXdiFUhnC0HsMmAU0athqZA3LfknXUxCeJ7yfM9WNGT96eSsCSmJ";
const PAGE_TOKEN_V2U = "EAATsC3s5vgkBPzsHbbnQaXqRyWy0Ybe0XSrcfl0m7z00jgM8Nd8aFMcRnUZCSnvZB6x0XgavX68CngDx5gjxZAUq43z6e6ZCUZAj6HyLZCxJz1ym3GZAT50NRgqomEEElijgEqE6hJ2tRUK8Uh8qB41CqrTKMzFvHAKgQHx1OZCuGinAZC1sZAOI35FujmflepA8Dfv2luWwqEBobp9sklhNX04UZBNOZCW4INRfF8XNgFx47MUZD";

const pages = [
  { name: "AI-Now", id: "809650095556499", token: PAGE_TOKEN_AINOW },
  { name: "V2U", id: "565965183263645", token: PAGE_TOKEN_V2U }
];

async function getAllInfo() {
  for (const page of pages) {
    console.log(`\n=== ${page.name} PAGE ===`);
    console.log(`ID: ${page.id}`);
    console.log(`Token: ${page.token.substring(0, 50)}...`);
    
    const response = await fetch(`https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${page.token}`);
    const data = await response.json();
    
    if (data.instagram_business_account) {
      console.log(`✅ Instagram: @${data.instagram_business_account.username}`);
      console.log(`   ID: ${data.instagram_business_account.id}`);
    } else {
      console.log(`❌ Instagram: Not linked`);
      if (data.error) console.log(`   Error: ${data.error.message}`);
    }
  }
  
  console.log("\n\n📋 SUMMARY - Add to .env.local:");
  console.log("============================================");
}

getAllInfo();
