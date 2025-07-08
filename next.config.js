/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', ''),
      'your-supabase-project.supabase.co'
    ].filter(Boolean),
  },
  // Optimizaciones para producción
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Ajustes específicos para Vercel
  output: 'standalone',
  // Optimizaciones
  optimizeFonts: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
}

module.exports = nextConfig