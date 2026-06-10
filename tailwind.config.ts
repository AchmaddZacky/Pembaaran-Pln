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
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'bg-card': '#334155',
        'text-primary': '#f1f5f9',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
        'border': '#475569',
        'primary-100': '#e0f2fe',
        'primary-500': '#0ea5e9',
        'primary-600': '#0284c7',
        'primary-700': '#0369a1',
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
