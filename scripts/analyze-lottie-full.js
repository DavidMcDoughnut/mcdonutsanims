const fs = require('fs');
const path = require('path');

// Read the animation file
const animationFile = path.join(__dirname, '../public/anim4k-opt.json');
const animation = JSON.parse(fs.readFileSync(animationFile, 'utf8'));

function getSize(obj) {
  return Buffer.from(JSON.stringify(obj)).length / (1024 * 1024); // Size in MB
}

function countKeyframes(obj) {
  let count = 0;
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (item.ks) {
        // Count position, scale, rotation, opacity keyframes
        count += (item.ks.p?.k?.length || 0);
        count += (item.ks.s?.k?.length || 0);
        count += (item.ks.r?.k?.length || 0);
        count += (item.ks.o?.k?.length || 0);
      }
      if (item.shapes) {
        count += countKeyframes(item.shapes);
      }
    });
  }
  return count;
}

console.log('Analyzing Lottie animation components...\n');

// Analyze main sections
const analysis = {
  assets: {
    size: getSize(animation.assets || []),
    count: animation.assets?.length || 0,
    type: 'Assets (images, precomps)',
  },
  layers: {
    size: getSize(animation.layers || []),
    count: animation.layers?.length || 0,
    type: 'Layers',
  },
  markers: {
    size: getSize(animation.markers || []),
    count: animation.markers?.length || 0,
    type: 'Markers',
  },
  fonts: {
    size: getSize(animation.fonts || []),
    count: animation.fonts?.length || 0,
    type: 'Fonts',
  },
  chars: {
    size: getSize(animation.chars || []),
    count: animation.chars?.length || 0,
    type: 'Characters',
  }
};

// Count total keyframes
const totalKeyframes = countKeyframes(animation.layers || []);

// Sort by size
const sortedAnalysis = Object.entries(analysis)
  .sort(([,a], [,b]) => b.size - a.size);

// Output results
console.log('Component sizes (MB):');
sortedAnalysis.forEach(([key, info]) => {
  console.log(`\n${info.type}:`);
  console.log(`  Size: ${info.size.toFixed(2)} MB`);
  console.log(`  Count: ${info.count} items`);
});

console.log(`\nTotal Keyframes: ${totalKeyframes}`);
console.log(`Total Animation Size: ${getSize(animation).toFixed(2)} MB`);
console.log(`Animation Duration: ${animation.op - animation.ip} frames at ${animation.fr} fps`);

// Analyze shape complexity
let totalShapePoints = 0;
let shapeCount = 0;

function analyzeShapes(layers) {
  layers.forEach(layer => {
    if (layer.shapes) {
      layer.shapes.forEach(shape => {
        if (shape.ks && shape.ks.k) {
          shapeCount++;
          // Count vertices in shape paths
          if (Array.isArray(shape.ks.k)) {
            shape.ks.k.forEach(k => {
              if (k.i) totalShapePoints += k.i.length;
            });
          }
        }
      });
    }
  });
}

analyzeShapes(animation.layers || []);
console.log(`\nShape Complexity:`);
console.log(`  Total Shapes: ${shapeCount}`);
console.log(`  Total Shape Points: ${totalShapePoints}`); 