/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript e Images se mantienen igual
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // OPCIÓN A: Si quieres seguir usando Webpack para el build
  // (Recomendado para no romper lo de Supabase ahora mismo)
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

  // OPCIÓN B: Para silenciar el error de Turbopack 
  // aunque uses la opción A, añade esto:
  experimental: {
    turbo: {
      // Si necesitas pasar reglas específicas a Turbopack en el futuro
    },
  },
}

export default nextConfig