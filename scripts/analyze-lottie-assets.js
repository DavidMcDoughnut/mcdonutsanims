const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Read the animation file
const animationFile = path.join(__dirname, '../public/anim4k-opt.json');
const animation = JSON.parse(fs.readFileSync(animationFile, 'utf8'));

function getSize(data) {
  if (typeof data === 'string' && data.startsWith('data:')) {
    return Buffer.from(data.split(',')[1], 'base64').length / (1024 * 1024);
  }
  return Buffer.from(JSON.stringify(data)).length / (1024 * 1024);
}

function getHash(data) {
  if (typeof data === 'string' && data.startsWith('data:')) {
    return crypto.createHash('md5').update(data.split(',')[1]).digest('hex');
  }
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

console.log('Analyzing Lottie assets in detail...\n');

if (animation.assets) {
  // Group assets by type
  const assetTypes = new Map();
  const duplicates = new Map();
  const usageCount = new Map();

  // Analyze each asset
  animation.assets.forEach((asset, index) => {
    // Determine asset type
    let type = 'unknown';
    let size = 0;
    let hash = '';

    if (asset.p && asset.p.startsWith('data:')) {
      type = 'embedded-image';
      size = getSize(asset.p);
      hash = getHash(asset.p);
    } else if (asset.p) {
      type = 'external-image';
      size = getSize(asset.p);
      hash = getHash(asset.p);
    } else if (asset.layers) {
      type = 'precomp';
      size = getSize(asset.layers);
      hash = getHash(asset.layers);
    }

    // Track asset type
    if (!assetTypes.has(type)) {
      assetTypes.set(type, { count: 0, totalSize: 0, assets: [] });
    }
    const typeInfo = assetTypes.get(type);
    typeInfo.count++;
    typeInfo.totalSize += size;
    typeInfo.assets.push({ id: asset.id, size, index });

    // Track duplicates
    if (!duplicates.has(hash)) {
      duplicates.set(hash, []);
    }
    duplicates.get(hash).push({ id: asset.id, size, index });

    // Track usage
    if (asset.id) {
      usageCount.set(asset.id, 0);
    }
  });

  // Count asset usage in layers
  function countAssetUsage(layers) {
    if (!Array.isArray(layers)) return;
    
    layers.forEach(layer => {
      if (layer.refId && usageCount.has(layer.refId)) {
        usageCount.set(layer.refId, usageCount.get(layer.refId) + 1);
      }
      if (layer.layers) {
        countAssetUsage(layer.layers);
      }
    });
  }

  countAssetUsage(animation.layers);
  animation.assets.forEach(asset => {
    if (asset.layers) {
      countAssetUsage(asset.layers);
    }
  });

  // Output results
  console.log('Asset Types:');
  assetTypes.forEach((info, type) => {
    console.log(`\n${type}:`);
    console.log(`  Count: ${info.count}`);
    console.log(`  Total Size: ${info.totalSize.toFixed(2)} MB`);
    console.log(`  Average Size: ${(info.totalSize / info.count).toFixed(2)} MB`);
  });

  // Report potential duplicates
  console.log('\nPotential Duplicates:');
  duplicates.forEach((assets, hash) => {
    if (assets.length > 1) {
      console.log(`\nFound ${assets.length} identical assets:`);
      assets.forEach(asset => {
        console.log(`  Asset ${asset.id} (${asset.size.toFixed(2)} MB)`);
      });
    }
  });

  // Report unused assets
  console.log('\nUnused Assets:');
  let unusedCount = 0;
  let unusedSize = 0;
  usageCount.forEach((count, id) => {
    if (count === 0) {
      const asset = animation.assets.find(a => a.id === id);
      const size = getSize(asset);
      unusedCount++;
      unusedSize += size;
      console.log(`  Asset ${id} (${size.toFixed(2)} MB)`);
    }
  });
  console.log(`\nTotal unused: ${unusedCount} assets (${unusedSize.toFixed(2)} MB)`);

} else {
  console.log('No assets found in the animation file.');
} 