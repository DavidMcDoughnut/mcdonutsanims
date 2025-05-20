const fs = require('fs');
const path = require('path');

// Read the animation file
const animationFile = path.join(__dirname, '../public/anim4k-opt.json');
const animation = JSON.parse(fs.readFileSync(animationFile, 'utf8'));

// Function to calculate base64 size in MB
function getBase64Size(base64String) {
  const buffer = Buffer.from(base64String.split(',')[1], 'base64');
  return buffer.length / (1024 * 1024); // Convert to MB
}

// Function to get image dimensions from base64
function getImageDimensions(base64String) {
  const header = base64String.split(',')[0];
  return {
    type: header.split(';')[0].split(':')[1],
    encoding: header.split(';')[1]
  };
}

// Analyze assets
console.log('Analyzing Lottie animation assets...\n');

if (animation.assets) {
  const imageAssets = animation.assets
    .filter(asset => asset.p && asset.p.startsWith('data:'))
    .map(asset => ({
      id: asset.id,
      name: asset.id || 'Unnamed Asset',
      size: getBase64Size(asset.p),
      ...getImageDimensions(asset.p),
      originalPath: asset.u ? `${asset.u}${asset.p}` : 'embedded'
    }))
    .sort((a, b) => b.size - a.size);

  console.log('Found images by size (MB):');
  imageAssets.forEach((asset, index) => {
    console.log(`\n${index + 1}. Asset ID: ${asset.id}`);
    console.log(`   Type: ${asset.type}`);
    console.log(`   Size: ${asset.size.toFixed(2)} MB`);
    console.log(`   Path: ${asset.originalPath}`);
  });

  const totalSize = imageAssets.reduce((sum, asset) => sum + asset.size, 0);
  console.log(`\nTotal embedded images size: ${totalSize.toFixed(2)} MB`);
  console.log(`Number of images: ${imageAssets.length}`);
} else {
  console.log('No embedded assets found in the animation file.');
} 