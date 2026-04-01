import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F97316", // Vibrant sunset orange
          blue: "#1E3A8A",   // Deep professional blue
          green: "#10B981"   // Success green
        }
      },
    },
  },
  plugins: [],
};
export default config;
