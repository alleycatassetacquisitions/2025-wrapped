/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable this to access local data files
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  }
};

module.exports = nextConfig; 