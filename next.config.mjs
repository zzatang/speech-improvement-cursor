/** @type {import('next').NextConfig} */
const nextConfig = {
  // Check if we're in a CI environment
  skipTrailingSlashRedirect: true,
  experimental: {
    serverComponentsExternalPackages: []
  },
  env: {
    // Set CI flag for environment variable checks
    IS_CI_BUILD: process.env.CI === 'true' ? 'true' : '',
  },
  // In CI mode, we still want to use the default server mode
  // instead of static export, to support dynamic routes
  images: {
    // Keep image optimization in server mode
    ...(process.env.CI === 'true' ? { unoptimized: true } : {})
  },
};

export default nextConfig;
