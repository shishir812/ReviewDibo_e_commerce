import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        mist: "#f5f7fb",
        primary: "#1677ff",
        emerald: "#059669"
      },
      boxShadow: {
        soft: "0 10px 28px rgba(31, 41, 55, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
