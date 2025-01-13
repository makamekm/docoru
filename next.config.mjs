/** @type {import('next').NextConfig} */
const nextConfig = {
    // distDir: process.env.OUTPUT,
    basePath: process.env.BASE,
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
        DOCS: process.env.DOCS,
        MODE: process.env.MODE,
    },
};

export default nextConfig;
