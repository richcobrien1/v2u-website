const sharp = require('sharp');

// Create Jamz-sking.png placeholder
sharp({
  create: {
    width: 400,
    height: 300,
    channels: 4,
    background: { r: 20, g: 84, b: 81, alpha: 1 }
  }
})
.png()
.toFile('/c/Users/richc/Projects/v2u-website/public/Jamz-sking.png')
.then(() => console.log('Created Jamz-sking.png'))
.catch(err => console.error('Error creating Jamz-sking.png:', err));

// Create Meal Prep Vending 1.png placeholder
sharp({
  create: {
    width: 400,
    height: 300,
    channels: 4,
    background: { r: 33, g: 33, b: 33, alpha: 1 }
  }
})
.png()
.toFile('/c/Users/richc/Projects/v2u-website/public/Meal Prep Vending 1.png')
.then(() => console.log('Created Meal Prep Vending 1.png'))
.catch(err => console.error('Error creating Meal Prep Vending 1.png:', err));
