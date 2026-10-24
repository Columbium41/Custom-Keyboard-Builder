/** @type {import('next').NextConfig} */
import withSvgr from '@svgr/webpack';

const nextConfig = {
    // e2e tests build into their own directory so they don't clobber a running dev server
    distDir: process.env.NEXT_DIST_DIR || '.next',
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: '@svgr/webpack',
                    options: {},
                },
            ],
        });

        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: process.env.AWS_BUCKET_URL,
            }
        ]
    }
};

export default nextConfig;
