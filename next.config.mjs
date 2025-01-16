/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.DIST_FOLDER,
    basePath: process.env.BASE,
    output: !!process.env.IS_STATIC ? 'export' : undefined,
    cleanDistDir: !!process.env.IS_STATIC ? true : undefined,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });

        config.resolve.fallback = { fs: false };

        return config;
    },
    env: {
        IS_STATIC: !!process.env.IS_STATIC,
        DOCS: process.env.DOCS,
        MODE: process.env.MODE,
    },
};

export default nextConfig;
