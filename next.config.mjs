/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['workoutimageshfit.s3.eu-north-1.amazonaws.com'], // Add your S3 hostname
  },
  // Remove all cross-origin policy headers that are preventing Firebase auth from working
  // The iframe from Firebase doesn't have the CORP headers we need, so we need to be
  // more permissive in our app
};

export default nextConfig;
