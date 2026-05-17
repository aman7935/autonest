/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev-only: allow connections from local network devices
  // This has no effect in production (Vercel)
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['192.168.29.74', 'localhost', '127.0.0.1'],
  }),
}

module.exports = nextConfig;
