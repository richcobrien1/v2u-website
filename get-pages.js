const TOKEN = "EAATsC3s5vgkBPzzHnedFooWj3orIjc6oSTwgwXFMqLbIVZAbpZAK7BQwjhY5ZCgCNBKWPFnYFzbG8mrHraCj1YLHuwq7A4PxYV5d1yOIWa6LtBggVmchrhwaFrGZBZA1ZCFRZBEBBVcZAhmg0w4K89vLdXKyNFndabE5ovBWGUCHvIZBGGAWMeSAzmxDKAzlyzd1Sgobsqq0vQeF5aUnkzRzNkOV8TfX2BELvN5ly7Dmz36nlouB6WXa8h7vHq0ToKSaB3CTG5VPuJzKulMHrKggvNPtL";

async function getPages() {
  const response = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=name,id,access_token&access_token=${TOKEN}`);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

getPages();
