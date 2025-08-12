/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ignorar warnings específicos de Supabase realtime-js
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // Resolver problemas de módulos de Supabase en el servidor
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
