import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#eef6ff",
        muted: "#9fb1c8",
        paper: "#07111f",
        teal: "#20d6bf",
        coral: "#ff7468",
        gold: "#f8bd4a",
        ocean: "#5d8cff"
      },
      boxShadow: {
        panel: "0 22px 60px rgba(0, 0, 0, 0.38)"
      }
    }
  },
  plugins: []
};

export default config;
