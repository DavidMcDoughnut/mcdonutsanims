const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Read the animation file
const animationFile = path.join(__dirname, '../public/anim4k-opt.json');
const animation = JSON.parse(fs.readFileSync(animationFile, 'utf8'));

async function optimizeBase64Image(base64String, quality = 80) {
  try {
    // Extract image data from base64
    const base64Data = base64String.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const imageType = base64String.split(';')[0].split(':')[1];

    // Optimize the image
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality }) // Convert to WebP with specified quality
      .toBuffer();

    // Convert back to base64 and reconstruct data URL
    const optimizedBase64 = optimizedBuffer.toString('base64');
    return `data:image/webp;base64,${optimizedBase64}`;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return base64String; // Return original if optimization fails
  }
}

async function optimizeLargestAsset() {
  if (!animation.assets) {
    console.log('No assets found in animation file.');
    return;
  }

  // Find the largest image asset
  const imageAssets = animation.assets.filter(asset => asset.p && asset.p.startsWith('data:image'));
  if (imageAssets.length === 0) {
    console.log('No image assets found.');
    return;
  }

  // Sort by size and get the largest
  const largestAsset = imageAssets.reduce((largest, current) => {
    const currentSize = Buffer.from(current.p.split(',')[1], 'base64').length;
    const largestSize = largest ? Buffer.from(largest.p.split(',')[1], 'base64').length : 0;
    return currentSize > largestSize ? current : largest;
  }, null);

  console.log(`\nOptimizing largest asset (ID: ${largestAsset.id})`);
  console.log('Original size:', (Buffer.from(largestAsset.p.split(',')[1], 'base64').length / (1024 * 1024)).toFixed(2), 'MB');

  // Optimize the image
  const optimizedBase64 = await optimizeBase64Image(largestAsset.p);
  const optimizedSize = (Buffer.from(optimizedBase64.split(',')[1], 'base64').length / (1024 * 1024)).toFixed(2);
  console.log('Optimized size:', optimizedSize, 'MB');

  // Update the asset in the animation
  const assetIndex = animation.assets.findIndex(asset => asset.id === largestAsset.id);
  animation.assets[assetIndex].p = optimizedBase64;

  // Save the optimized animation
  fs.writeFileSync(animationFile, JSON.stringify(animation));
  console.log('\nAnimation file updated successfully!');
}

optimizeLargestAsset().catch(console.error); 