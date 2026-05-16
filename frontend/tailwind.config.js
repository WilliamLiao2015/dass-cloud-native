/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        panel: "#101a2f",
        line: "#21304f",
        glow: "#38bdf8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,.22), 0 20px 50px rgba(2,6,23,.35)",
      },
    },
  },
  plugins: [],
}
