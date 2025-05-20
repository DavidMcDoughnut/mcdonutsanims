const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'public';
const outputDir = 'public/optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// List of large images to optimize
const imagesToOptimize = [
  'cf event layer updated.png'
];

async function optimizeImage(filename) {
  const inputPath = path.join(inputDir, filename);
  const outputPath = path.join(outputDir, filename.replace('.png', '.webp'));
  
  try {
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    console.log(`Optimized ${filename} -> ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`Error optimizing ${filename}:`, error);
  }
}

// Process all images
async function optimizeAllImages() {
  for (const image of imagesToOptimize) {
    await optimizeImage(image);
  }
}

optimizeAllImages().then(() => {
  console.log('Image optimization complete!');
}); 