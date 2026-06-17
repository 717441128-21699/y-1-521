/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: "#FBF5EF",
          100: "#F5E6D8",
          200: "#E8C4A0",
          300: "#D9B080",
          400: "#C9A06C",
          500: "#B8894A",
          600: "#9A6F35",
          700: "#7B5528",
          800: "#5C3E1E",
          900: "#3D2914",
        },
        wine: {
          50: "#F7ECEB",
          100: "#E8CCCA",
          200: "#D49994",
          300: "#B85C55",
          400: "#9F4039",
          500: "#7B2D26",
          600: "#652420",
          700: "#4F1C19",
          800: "#3A1413",
          900: "#250D0C",
        },
        blush: {
          50: "#FDFBFA",
          100: "#FAF5F2",
          200: "#F5E6E0",
          300: "#EED3C7",
          400: "#E5BFA8",
          500: "#D9A585",
        },
        ivory: {
          50: "#FDFCFA",
          100: "#FAF8F5",
          200: "#F5F1EA",
          300: "#EEE7DA",
        },
        warm: {
          50: "#FAFAF9",
          100: "#F5F4F3",
          200: "#E8E7E4",
          300: "#D3D1CC",
          400: "#9A9893",
          500: "#6B6965",
          600: "#4A4A4A",
          700: "#3A3A3A",
          800: "#2A2A2A",
          900: "#1A1A1A",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        'rose-gold': '0 4px 20px -2px rgba(201, 160, 108, 0.25)',
        'soft': '0 2px 12px -2px rgba(74, 74, 74, 0.08)',
        'glow': '0 0 20px rgba(232, 196, 160, 0.4)',
        'card': '0 8px 32px -8px rgba(123, 45, 38, 0.1)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #E8C4A0 0%, #C9A06C 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #D9B080 0%, #B8894A 100%)',
        'card-gradient': 'linear-gradient(180deg, #FAF8F5 0%, #F5F1EA 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'count': 'count 0.8s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        count: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};
