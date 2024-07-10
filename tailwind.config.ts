import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      height: {
        '18': '4.5rem',
      },
      colors: {
        'fg-light-mode': '#101010',
        'fg-dark-mode': '#F0F0F0',
        'bg-light-mode': '#EDF2F7',
        'bg-dark-mode': '#1A202C',
      },
    },
  },
  plugins: [],
};
export default config;
