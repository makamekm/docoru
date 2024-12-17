import { resolve } from "path";

const config = {
  content: [
    resolve(__dirname, "**/*.{js,ts,jsx,tsx,mdx}"),
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

console.log("HERE 2", config);
