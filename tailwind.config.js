/** @type {import('tailwindcss').Config} */
export default {
  // This 'content' array tells Tailwind where to scan for utility classes.
  // It's crucial for Tailwind to know which files to analyze to generate the CSS.
  content: [
    "./index.html",
    // Scan all JavaScript/TypeScript and JSX/TSX files in the 'src' directory
    // This ensures Tailwind picks up classes used in your React components.
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
