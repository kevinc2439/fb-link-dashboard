/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for native mobile builds
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;