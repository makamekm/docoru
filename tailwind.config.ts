import type { Config } from "tailwindcss";
import { resolve } from "path";

const config: Config = {
  content: [
    resolve(__dirname, "src/services/**/*.{js,ts,jsx,tsx,mdx}"),
    resolve(__dirname, "src/components/**/*.{js,ts,jsx,tsx,mdx}"),
    resolve(__dirname, "src/app/**/*.{js,ts,jsx,tsx,mdx}"),
    resolve(process.env.DOCS || "./", "**/*.md"),
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
