const fs = require('fs');
const path = require('path');

// Read the animation file
const sourceFile = path.join(__dirname, '../public/anim4k-opt.json');
const targetFile = path.join(__dirname, '../public/anim4k-opt2.json');
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

// Function to optimize keyframe data
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
  
  return layer;
}

// Function to optimize precomps
function optimizePrecomp(asset) {
  if (!asset.layers) return asset;
  
  asset.layers = asset.layers.map(layer => optimizeLayer(layer));
  return asset;
}

console.log('Starting advanced Lottie optimization...');

// Track size changes
const originalSize = Buffer.from(JSON.stringify(animation)).length / (1024 * 1024);
console.log(`Original size: ${originalSize.toFixed(2)} MB`);

// Create optimized copy
const optimized = {...animation};

// Optimize assets
if (optimized.assets) {
  console.log(`\nOptimizing ${optimized.assets.length} assets...`);
  optimized.assets = optimized.assets.map(asset => {
    // Skip the already optimized WebP image
    if (asset.p && asset.p.startsWith('data:image/webp')) {
      return asset;
    }
    return optimizePrecomp(asset);
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

// Save optimized file
fs.writeFileSync(targetFile, JSON.stringify(optimized));

// Calculate size reduction
const optimizedSize = Buffer.from(JSON.stringify(optimized)).length / (1024 * 1024);
const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

console.log('\nOptimization complete!');
console.log(`Original size: ${originalSize.toFixed(2)} MB`);
console.log(`Optimized size: ${optimizedSize.toFixed(2)} MB`);
console.log(`Reduction: ${reduction}%`);

// Verify the optimized file can be parsed
try {
  JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  console.log('\nVerification: Optimized file is valid JSON');
} catch (error) {
  console.error('\nError: Optimized file is not valid JSON!');
  console.error(error);
} 