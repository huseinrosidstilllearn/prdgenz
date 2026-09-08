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
  },
}

export default nextConfig
