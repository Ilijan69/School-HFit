/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['workoutimageshfit.s3.eu-north-1.amazonaws.com'], // Add your S3 hostname
  },
  async headers() {
    return [
      {
        source: '/:path*', // Apply the headers to all routes
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
