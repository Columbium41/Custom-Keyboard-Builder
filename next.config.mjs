/** @type {import('next').NextConfig} */
import withSvgr from '@svgr/webpack';

const nextConfig = {
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
