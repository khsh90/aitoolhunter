/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        unoptimized: true, // Disable image optimization for Appwrite Sites compatibility
    },
};

module.exports = nextConfig;
