/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'cdn.propertyguru.com.vn',
      'cdn.propertyguru.com.sg',
      'via.placeholder.com',
      'images.unsplash.com'
    ],
    unoptimized: true
  },
  env: {
    APIFY_API_TOKEN: process.env.APIFY_API_TOKEN,
    APIFY_ACTOR_ID: process.env.APIFY_ACTOR_ID || 'k9WTLB7RrdLVj9Gyp',
  }
}

module.exports = nextConfig
