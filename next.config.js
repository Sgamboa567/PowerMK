/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'ilkhshiherbjggmvexio.supabase.co'
    ],
    unoptimized: true // Añadir esta línea para desactivar la optimización
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