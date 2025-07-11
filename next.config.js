/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', ''),
      'ilkhshiherbjggmvexio.supabase.co'
    ].filter(Boolean),
  },
  // Optimizaciones para producción
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Optimizaciones
  optimizeFonts: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
}

module.exports = nextConfig