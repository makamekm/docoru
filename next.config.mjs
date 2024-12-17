/** @type {import('next').NextConfig} */
const nextConfig = {
    // distDir: process.env.OUTPUT,
    output: process.env.IS_STATIC ? 'export' : undefined,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });

        config.resolve.fallback = { fs: false };

        return config;
    },
    env: {
        IS_STATIC: process.env.IS_STATIC,
    },
};

export default nextConfig;
