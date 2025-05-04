/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverComponentsExternalPackages has been moved to serverExternalPackages in Next.js 15.3.1
  },

  serverExternalPackages: [
    "puppeteer-core",
    "puppeteer",
    "whatsapp-web.js",
    "@ffmpeg-installer/ffmpeg",
    "fluent-ffmpeg",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fixes npm packages that depend on fs/path module
      config.externals.push("bufferutil", "utf-8-validate");

      // Handle dependency on fluent-ffmpeg properly
      config.resolve.alias = {
        ...config.resolve.alias,
        "./lib-cov/fluent-ffmpeg": false,
      };

      // Fix for ffmpeg-installer package
      config.externals = [
        ...config.externals,
        { "@ffmpeg-installer/ffmpeg": "commonjs @ffmpeg-installer/ffmpeg" },
      ];
    }

    return config;
  },
};

export default nextConfig;
