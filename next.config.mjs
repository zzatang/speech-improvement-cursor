/** @type {import('next').NextConfig} */
const nextConfig = {
  // Check if we're in a CI environment
  experimental: {
    skipTrailingSlashRedirect: true,
    serverComponentsExternalPackages: []
  },
  env: {
    // Set CI flag for environment variable checks
    IS_CI_BUILD: process.env.CI === 'true' ? 'true' : '',
  },
};

export default nextConfig;
