/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@prdgenz/shared', '@prdgenz/ui'],
  serverExternalPackages: ['@prisma/client', '.prisma/client', 'pg'],
}

export default nextConfig
