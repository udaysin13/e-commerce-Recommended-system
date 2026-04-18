import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#191A1F",
        mist: "#F5F7FA",
        line: "#D9DEE7",
        teal: "#087F83",
        coral: "#D85145",
        leaf: "#3D7A4D",
      },
      boxShadow: {
        soft: "0 14px 40px rgba(25, 26, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
