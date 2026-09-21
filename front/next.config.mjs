/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- ESTO ES VITAL
  distDir: 'out',
  images: {
    unoptimized: true, // Requerido para exportación estática
  },
};

export default nextConfig;
