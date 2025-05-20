const fs = require('fs');
const path = require('path');

// Read the animation file
const animationFile = path.join(__dirname, '../public/anim4k-opt.json');
const animation = JSON.parse(fs.readFileSync(animationFile, 'utf8'));

function getSize(data) {
  return Buffer.from(JSON.stringify(data)).length / (1024 * 1024);
}

function analyzePrecomp(asset, depth = 0, visited = new Set()) {
  const indent = '  '.repeat(depth);
  const id = asset.id || 'unknown';
  
  // Prevent infinite recursion
  if (visited.has(id)) {
    console.log(`${indent}[Circular Reference] ${id}`);
    return { size: 0, keyframes: 0, properties: 0 };
  }
  visited.add(id);
  
  let size = getSize(asset);
  let keyframes = 0;
  let properties = 0;
  let unusedProps = [];
  
  // Count properties and find potential unused ones
  Object.entries(asset).forEach(([key, value]) => {
    properties++;
    if (value === null || value === undefined || value === '') {
      unusedProps.push(key);
    }
  });
  
  // Analyze keyframes in transforms
  function countKeyframes(obj) {
    if (!obj) return 0;
    if (Array.isArray(obj)) {
      return obj.length;
    }
    if (typeof obj === 'object') {
      return Object.values(obj).reduce((sum, val) => sum + countKeyframes(val), 0);
    }
    return 0;
  }
  
  // Analyze layers recursively
  let layerInfo = { count: 0, totalSize: 0, keyframes: 0 };
  if (asset.layers) {
    asset.layers.forEach(layer => {
      layerInfo.count++;
      layerInfo.totalSize += getSize(layer);
      if (layer.ks) {
        layerInfo.keyframes += countKeyframes(layer.ks);
      }
      
      // Check for nested precomps
      if (layer.refId && animation.assets) {
        const refAsset = animation.assets.find(a => a.id === layer.refId);
        if (refAsset) {
          const nestedInfo = analyzePrecomp(refAsset, depth + 1, new Set(visited));
          layerInfo.totalSize += nestedInfo.size;
          layerInfo.keyframes += nestedInfo.keyframes;
        }
      }
    });
  }
  
  // Output analysis
  console.log(`${indent}Asset ${id}:`);
  console.log(`${indent}  Size: ${size.toFixed(2)} MB`);
  console.log(`${indent}  Properties: ${properties}`);
  if (unusedProps.length > 0) {
    console.log(`${indent}  Unused Properties: ${unusedProps.join(', ')}`);
  }
  if (layerInfo.count > 0) {
    console.log(`${indent}  Layers: ${layerInfo.count}`);
    console.log(`${indent}  Layer Data Size: ${layerInfo.totalSize.toFixed(2)} MB`);
    console.log(`${indent}  Total Keyframes: ${layerInfo.keyframes}`);
  }
  
  return {
    size,
    keyframes: layerInfo.keyframes,
    properties
  };
}

console.log('Deep analysis of Lottie animation...\n');

if (animation.assets) {
  let totalSize = 0;
  let totalKeyframes = 0;
  let totalProperties = 0;
  
  animation.assets.forEach(asset => {
    const info = analyzePrecomp(asset);
    totalSize += info.size;
    totalKeyframes += info.keyframes;
    totalProperties += info.properties;
  });
  
  console.log('\nSummary:');
  console.log(`Total Assets Size: ${totalSize.toFixed(2)} MB`);
  console.log(`Total Keyframes: ${totalKeyframes}`);
  console.log(`Total Properties: ${totalProperties}`);
  console.log(`Raw File Size: ${getSize(animation).toFixed(2)} MB`);
} else {
  console.log('No assets found in the animation file.');
} 