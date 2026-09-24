import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['sequelize'],
  allowedDevOrigins: ['192.168.0.121', '192.168.0.122', 'localhost', '127.0.0.1'],
};

export default nextConfig;

