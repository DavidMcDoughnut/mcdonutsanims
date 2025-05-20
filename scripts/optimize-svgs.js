const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

const inputDir = path.join(process.cwd(), 'public');
const outputDir = path.join(process.cwd(), 'public', 'optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const svgFiles = [
  'lauren david hero.svg',
  'villa hero.svg'
];

const config = {
  multipass: true,
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'mergeStyles',
    'inlineStyles',
    'minifyStyles',
    'cleanupIds',
    'removeUselessDefs',
    'cleanupNumericValues',
    'convertColors',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeViewBox',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'convertShapeToPath',
    'convertEllipseToCircle',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'mergePaths',
    'removeUnusedNS',
    'sortDefsChildren',
    'removeTitle',
    'removeDesc'
  ]
};

svgFiles.forEach(filename => {
  const inputPath = path.join(inputDir, filename);
  const outputPath = path.join(outputDir, filename);

  try {
    const svg = fs.readFileSync(inputPath, 'utf8');
    const result = optimize(svg, { 
      path: inputPath,
      ...config
    });

    fs.writeFileSync(outputPath, result.data);
    console.log(`Optimized ${filename}`);
    
    // Log size reduction
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    console.log(`Size reduced by ${reduction}% (${(originalSize/1024).toFixed(2)}KB → ${(optimizedSize/1024).toFixed(2)}KB)`);
  } catch (error) {
    console.error(`Error processing ${filename}:`, error);
  }
}); 