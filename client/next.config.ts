import { codeInspectorPlugin } from 'code-inspector-plugin';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
    /* your config options here */
    images: {
        deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
        imageSizes: [64, 96, 128, 256, 384],
        minimumCacheTTL: 60, // seconds
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'gtoarcade.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'staging.gtoarcade.com',
                pathname: '/**',
            },
            // Add production/CDN hosts here when available
        ],
    },
    turbopack: {
        rules: codeInspectorPlugin({
            bundler: 'turbopack',
        }),
    },
};

if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
    });
    nextConfig = withBundleAnalyzer(nextConfig);
}

export default nextConfig;
