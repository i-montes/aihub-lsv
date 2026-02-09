/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Configuración de Turbopack (Requerida en Next.js 16 para silenciar errores si se usa webpack)
  turbopack: {},

  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@supabase/realtime-js': '@supabase/realtime-js',
      });
    }

    return config;
  },
}

export default nextConfig