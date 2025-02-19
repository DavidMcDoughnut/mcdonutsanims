/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(json|webm)$/,
      type: 'asset/resource'
    });
    return config;
  }
};

module.exports = nextConfig; 