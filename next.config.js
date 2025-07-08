/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Removemos serverActions ya que ahora está habilitado por defecto
  },
  images: {
    domains: ['localhost', 'your-supabase-project.supabase.co'],
  }
}

module.exports = nextConfig