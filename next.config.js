/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'word-extractor'],
  },
};

module.exports = nextConfig;
