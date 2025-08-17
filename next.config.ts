import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4566',
                pathname: '/event-seating-uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'event-seating-localstack'
            }
        ],
    },
    crossOrigin: 'use-credentials'
};

export default nextConfig;
