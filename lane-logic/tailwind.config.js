/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tells Tailwind's JIT compiler exactly which files to scan for class
  // names. Keep this in sync as new top-level folders are added.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Centralize the Lane Logic brand palette here so every feature
        // pulls from one source of truth instead of hardcoding hex values.
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#1d6fe0',
          600: '#1558b4',
          900: '#0b2c57',
        },
      },
    },
  },
  plugins: [],
};
