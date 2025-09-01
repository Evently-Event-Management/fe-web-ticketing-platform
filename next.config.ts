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
            },
            {
                protocol: 'https',
                hostname: 'ticketly-storage.s3.amazonaws.com'
            },
            {
                protocol: 'https',
                hostname: 'ticketly-storage.s3.us-east-1.amazonaws.com'
            },
            {
                protocol: 'https',
                // allow any subdomain that ends with .s3.ap-south-1.amazonaws.com
                hostname: '*.s3.ap-south-1.amazonaws.com'
            },
            {
                protocol: 'https',
                hostname: 'ticketly-assets-*.s3.ap-south-1.amazonaws.com'
            }
        ],
    },
    crossOrigin: 'use-credentials'
};

export default nextConfig;
