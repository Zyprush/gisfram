import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#4F6F52",
          secondary: "#606676",
          accent: "#F5EFE6",
          neutral: "#1A4D2E",
          // "base-100": "#ff00ff",
          // info: "#0000ff",
          // success: "#00ff00",
          // warning: "#00ff00",
          // error: "#ff0000",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
export default config;
