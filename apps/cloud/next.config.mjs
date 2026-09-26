/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@prdgenz/app', '@prdgenz/shared', '@prdgenz/ui'],
  serverExternalPackages: ['@prisma/client', '.prisma/client', 'pg'],
}

export default nextConfig
