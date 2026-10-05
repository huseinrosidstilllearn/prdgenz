/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  transpilePackages: ['@prdgenz/app', '@prdgenz/shared', '@prdgenz/ui'],
  // No <Image> component is used in this project. With the optimizer off, Next
  // never pulls in sharp, whose native .node binary cannot run on Cloudflare
  // Workers (see tools/sharp-stub for the build-time replacement).
  images: {
    unoptimized: true,
  },
}

export default nextConfig
