const TOKEN = "EAATsC3s5vgkBPzzHnedFooWj3orIjc6oSTwgwXFMqLbIVZAbpZAK7BQwjhY5ZCgCNBKWPFnYFzbG8mrHraCj1YLHuwq7A4PxYV5d1yOIWa6LtBggVmchrhwaFrGZBZA1ZCFRZBEBBVcZAhmg0w4K89vLdXKyNFndabE5ovBWGUCHvIZBGGAWMeSAzmxDKAzlyzd1Sgobsqq0vQeF5aUnkzRzNkOV8TfX2BELvN5ly7Dmz36nlouB6WXa8h7vHq0ToKSaB3CTG5VPuJzKulMHrKggvNPtL";

const PAGE_IDS = ["809650095556499", "565965183263645"];

async function getPageDetails() {
  console.log("Fetching page details...\n");
  
  for (const pageId of PAGE_IDS) {
    console.log(`\n=== PAGE ${pageId} ===`);
    
    // Get basic info
    const basicRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=name,id&access_token=${TOKEN}`);
    const basic = await basicRes.json();
    console.log("Name:", basic.name || "Error:", basic.error?.message);
    console.log("ID:", basic.id || "N/A");
    
    // Get Instagram account
    const igRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account{username,id}&access_token=${TOKEN}`);
    const ig = await igRes.json();
    if (ig.instagram_business_account) {
      console.log("Instagram:", ig.instagram_business_account.username);
      console.log("Instagram ID:", ig.instagram_business_account.id);
    } else {
      console.log("Instagram:", ig.error?.message || "Not linked");
    }
    
    // Get Threads
    const threadsRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}?fields=threads_profile{id,username}&access_token=${TOKEN}`);
    const threads = await threadsRes.json();
    if (threads.threads_profile) {
      console.log("Threads:", threads.threads_profile.username);
      console.log("Threads ID:", threads.threads_profile.id);
    } else {
      console.log("Threads:", threads.error?.message || "Not linked");
    }
  }
}

getPageDetails();
