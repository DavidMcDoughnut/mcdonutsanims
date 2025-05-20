const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Read the animation file
const sourceFile = path.join(__dirname, '../public/anim4k.json');
const targetFile = path.join(__dirname, '../public/anim4k-opt3.json');
const animation = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

// Function to round numbers in an object to specified precision
function roundNumbers(obj, precision = 2) {
  if (typeof obj === 'number') {
    return Number(obj.toFixed(precision));
  }
  if (Array.isArray(obj)) {
    return obj.map(item => roundNumbers(item, precision));
  }
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = roundNumbers(obj[key], precision);
    }
    return result;
  }
  return obj;
}

// Function to optimize keyframe data with enhanced compression
function optimizeKeyframes(keyframes) {
  if (!Array.isArray(keyframes)) return keyframes;
  
  return keyframes.map(kf => {
    // Round all numeric values
    if (kf.s) kf.s = roundNumbers(kf.s);
    if (kf.e) kf.e = roundNumbers(kf.e);
    if (kf.to) kf.to = roundNumbers(kf.to);
    if (kf.ti) kf.ti = roundNumbers(kf.ti);
    
    // Remove unnecessary properties
    if (kf.h === 0) delete kf.h;
    if (kf.i && kf.i.x === 0.833 && kf.i.y === 0.833) delete kf.i;
    if (kf.o && kf.o.x === 0.167 && kf.o.y === 0.167) delete kf.o;
    
    // Remove redundant keyframes (if values are the same)
    if (kf.s && kf.e && JSON.stringify(kf.s) === JSON.stringify(kf.e)) {
      delete kf.e;
      kf.h = 1; // Mark as hold keyframe
    }
    
    return kf;
  });
}

// Function to optimize transform data
function optimizeTransform(transform) {
  if (!transform) return transform;
  
  // Optimize position keyframes
  if (transform.p && transform.p.k) {
    transform.p.k = optimizeKeyframes(transform.p.k);
  }
  
  // Optimize scale keyframes
  if (transform.s && transform.s.k) {
    transform.s.k = optimizeKeyframes(transform.s.k);
  }
  
  // Optimize rotation keyframes
  if (transform.r && transform.r.k) {
    transform.r.k = optimizeKeyframes(transform.r.k);
  }
  
  // Optimize opacity keyframes
  if (transform.o && transform.o.k) {
    transform.o.k = optimizeKeyframes(transform.o.k);
  }
  
  // Remove unnecessary transform properties
  if (transform.p && transform.p.k && transform.p.k.length === 1) {
    transform.p = transform.p.k[0].s;
  }
  if (transform.s && transform.s.k && transform.s.k.length === 1) {
    transform.s = transform.s.k[0].s;
  }
  if (transform.r && transform.r.k && transform.r.k.length === 1) {
    transform.r = transform.r.k[0].s;
  }
  if (transform.o && transform.o.k && transform.o.k.length === 1) {
    transform.o = transform.o.k[0].s;
  }
  
  return transform;
}

// Function to optimize a layer and its sublayers
function optimizeLayer(layer) {
  // Optimize transform
  if (layer.ks) {
    layer.ks = optimizeTransform(layer.ks);
  }
  
  // Optimize sublayers
  if (layer.layers) {
    layer.layers = layer.layers.map(sublayer => optimizeLayer(sublayer));
  }
  
  // Remove default values
  if (layer.ind === layer.parent + 1) delete layer.parent;
  if (layer.sr === 1) delete layer.sr;
  if (layer.ip === 0) delete layer.ip;
  if (layer.st === 0) delete layer.st;
  if (layer.op === animation.op) delete layer.op;
  if (layer.bm === 0) delete layer.bm;
  
  return layer;
}

// Enhanced function to optimize base64 images
async function optimizeBase64Image(base64String, quality = 75) {
  try {
    const base64Data = base64String.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Analyze image dimensions
    const metadata = await sharp(buffer).metadata();
    const maxDimension = Math.max(metadata.width, metadata.height);
    
    // Calculate optimal quality based on image size
    const dynamicQuality = Math.min(quality, Math.max(60, 100 - Math.floor(maxDimension / 100)));
    
    // Optimize the image
    const optimizedBuffer = await sharp(buffer)
      .resize(Math.min(4096, metadata.width), Math.min(4096, metadata.height), {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ 
        quality: dynamicQuality,
        effort: 6, // Maximum compression effort
        nearLossless: false
      })
      .toBuffer();

    return `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return base64String;
  }
}

// Function to optimize all image assets
async function optimizeAllAssets() {
  if (!animation.assets) return;
  
  const imageAssets = animation.assets.filter(asset => asset.p && asset.p.startsWith('data:image'));
  console.log(`Found ${imageAssets.length} image assets to optimize`);
  
  for (let i = 0; i < imageAssets.length; i++) {
    const asset = imageAssets[i];
    console.log(`\nOptimizing asset ${i + 1}/${imageAssets.length} (ID: ${asset.id})`);
    
    const originalSize = Buffer.from(asset.p.split(',')[1], 'base64').length;
    console.log('Original size:', (originalSize / (1024 * 1024)).toFixed(2), 'MB');
    
    const optimizedBase64 = await optimizeBase64Image(asset.p);
    const optimizedSize = Buffer.from(optimizedBase64.split(',')[1], 'base64').length;
    console.log('Optimized size:', (optimizedSize / (1024 * 1024)).toFixed(2), 'MB');
    
    const assetIndex = animation.assets.findIndex(a => a.id === asset.id);
    animation.assets[assetIndex].p = optimizedBase64;
  }
}

async function optimizeAnimation() {
  console.log('Starting enhanced Lottie optimization...');
  
  // Track size changes
  const originalSize = Buffer.from(JSON.stringify(animation)).length / (1024 * 1024);
  console.log(`Original size: ${originalSize.toFixed(2)} MB`);
  
  // Create optimized copy
  const optimized = {...animation};
  
  // Step 1: Optimize all image assets
  console.log('\nStep 1: Optimizing image assets...');
  await optimizeAllAssets();
  
  // Step 2: Optimize animation data
  console.log('\nStep 2: Optimizing animation data...');
  
  // Optimize assets
  if (optimized.assets) {
    console.log(`Optimizing ${optimized.assets.length} asset precomps...`);
    optimized.assets = optimized.assets.map(asset => {
      if (asset.layers) {
        return { ...asset, layers: asset.layers.map(layer => optimizeLayer(layer)) };
      }
      return asset;
    });
  }
  
  // Optimize main layers
  if (optimized.layers) {
    console.log(`Optimizing ${optimized.layers.length} main layers...`);
    optimized.layers = optimized.layers.map(layer => optimizeLayer(layer));
  }
  
  // Remove unnecessary properties from root
  if (optimized.ddd === 0) delete optimized.ddd;
  if (optimized.v === '5.5.2') delete optimized.v;
  if (optimized.fr === 30) delete optimized.fr;
  if (optimized.markers && optimized.markers.length === 0) delete optimized.markers;
  
  // Save optimized file
  fs.writeFileSync(targetFile, JSON.stringify(optimized));
  
  // Calculate size reduction
  const optimizedSize = Buffer.from(JSON.stringify(optimized)).length / (1024 * 1024);
  const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
  
  console.log('\nOptimization complete!');
  console.log(`Original size: ${originalSize.toFixed(2)} MB`);
  console.log(`Optimized size: ${optimizedSize.toFixed(2)} MB`);
  console.log(`Reduction: ${reduction}%`);
  
  // Verify the optimized file
  try {
    JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    console.log('\nVerification: Optimized file is valid JSON');
  } catch (error) {
    console.error('\nError: Optimized file is not valid JSON!');
    console.error(error);
  }
}

optimizeAnimation().catch(console.error); 