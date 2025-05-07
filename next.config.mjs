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
  // In CI mode, we need to disable some checks for dynamic routes
  ...(process.env.CI === 'true' ? {
    output: 'export',
    // Disable image optimization in static export mode
    images: { unoptimized: true },
  } : {}),
};

export default nextConfig;
