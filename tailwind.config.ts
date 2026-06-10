import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#f8fafc', // Light slate
        'bg-secondary': '#ffffff', // White
        'bg-card': '#ffffff',
        'text-primary': '#0f172a', // Dark slate
        'text-secondary': '#334155',
        'text-muted': '#64748b',
        'border': '#e2e8f0', // Light border
        'primary-100': '#ffedd5', // Orange 100
        'primary-500': '#f97316', // Orange 500
        'primary-600': '#ea580c', // Orange 600
        'primary-700': '#c2410c', // Orange 700
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
