/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Next bloquea las Server Actions cuando `x-forwarded-host` no coincide con
  // `origin`, que es su defensa contra CSRF. Al abrir la app por el túnel de
  // puertos de VS Code (`*.devtunnels.ms`) eso pasa siempre, y el corrector
  // devolvía "Invalid Server Actions request" sin más pista.
  //
  // Sólo en desarrollo: en producción la comprobación se queda como está.
  ...(process.env.NODE_ENV === "development"
    ? {
        experimental: {
          serverActions: {
            allowedOrigins: [
              "localhost:3000",
              "*.devtunnels.ms",
              "*.use2.devtunnels.ms",
            ],
          },
        },
      }
    : {}),


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