/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'ilkhshiherbjggmvexio.supabase.co'
    ],
  },
  // Optimizaciones para producción
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Optimizaciones
  optimizeFonts: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' 
      ? {
          exclude: ['error', 'warn'],
        } 
      : false,
  }
}

module.exports = nextConfig