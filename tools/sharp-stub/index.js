/**
 * Stub for the `sharp` package.
 *
 * sharp ships prebuilt native `.node` binaries. Cloudflare Workers cannot
 * execute native modules, and esbuild has no loader for them, so bundling the
 * real package fails with:
 *   No loader is configured for ".node" files: .../sharp-win32-x64-0.35.4.node
 *
 * This project renders no <Image> components anywhere and sets
 * `images.unoptimized: true` in next.config.mjs, so Next's image optimizer is
 * never reached at runtime. If something does try to use it, we throw a clear
 * error instead of failing deep inside a native binding.
 */
function sharpUnavailable() {
  throw new Error(
    'sharp is not available on this platform (Cloudflare Workers). ' +
      'This project relies on images.unoptimized; do not enable the Next.js image optimizer.'
  )
}

// Mirrors just enough of sharp's public surface for feature-detection code
// (`require("sharp")` in a try/catch) to run without crashing the build.
module.exports = sharpUnavailable
module.exports.default = sharpUnavailable
module.exports.concurrency = 1
module.exports.simd = false
module.exports.cache = function cache() {}
module.exports.queue = function queue() {}
module.exports.format = {
  jpeg: {},
  jpg: {},
  png: {},
  webp: {},
  avif: {},
  gif: {},
  tiff: {},
  svg: {},
  heif: {},
}
