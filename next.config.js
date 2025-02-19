/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Add rule for JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'javascript/auto',
      use: ['json-loader']
    });
    
    // Add rule for media files
    config.module.rules.push({
      test: /\.(webm|mp4|png|jpg|jpeg|gif|svg)$/i,
      type: 'asset/resource'
    });

    return config;
  }
};

module.exports = nextConfig; 