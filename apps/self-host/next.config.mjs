/** @type {import('next').NextConfig} */
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@prdgenz/shared', '@prdgenz/ui'],
  output: 'standalone',
  experimental: {
    // pnpm monorepo: keep file tracing inside the workspace (avoids EPERM on
    // symlinked store paths outside the repo)
    outputFileTracingRoot: path.join(here, '../../'),
    // Prisma runtime trace expands an os.homedir() path (C:\Users\...) that
    // Windows refuses to scandir ("My Documents"); keep tracing out of it
    outputFileTracingExcludes: ['**/Users/**', '**/My Documents/**'],
  },
}

export default nextConfig
