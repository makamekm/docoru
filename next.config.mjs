/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.DIST_FOLDER,
    basePath: process.env.BASE,
    output: !!process.env.IS_STATIC ? 'export' : (!!process.env.IS_STANDALONE ? 'standalone' : undefined),
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
        ...(process.env.IS_STATIC ? { IS_STATIC: '1' } : {}),
        ...(process.env.IS_STANDALONE ? { IS_STANDALONE: '1' } : {}),
        ...(process.env.DOCS ? { DOCS: process.env.DOCS } : {}),
        ...(process.env.MODE ? { MODE: process.env.MODE } : {}),
    },
};

export default nextConfig;
