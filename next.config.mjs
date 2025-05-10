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
  // Ensure Next.js can handle client components properly during build
  images: {
    // Keep image optimization in server mode
    ...(process.env.CI === 'true' ? { unoptimized: true } : {})
  },
  // Increase timeout for static generation
  staticPageGenerationTimeout: 180
};

export default nextConfig;
