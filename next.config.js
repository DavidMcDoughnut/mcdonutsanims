/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp', 'image/avif'],
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
  },
  async headers() {
    return [
      {
        source: '/anim4k.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 