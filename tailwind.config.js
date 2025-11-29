// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Noto Sans Arabic"', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
      },
      colors: {
        // الألوان الديناميكية باستخدام CSS Variables
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        
        // يمكن الاحتفاظ بالألوان الثابتة كاحتياطي
        neutral: {
          DEFAULT: '#6B7280',
          dark: '#374151'
        }
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'pulse-slow': 'pulse 3s infinite'
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      gradientColorStops: {
        'primary-start': 'rgb(var(--color-primary) / 0.2)',
        'primary-end': 'rgb(var(--color-primary) / 0.1)',
        'secondary-start': 'rgb(var(--color-secondary) / 0.2)',
        'secondary-end': 'rgb(var(--color-secondary) / 0.1)',
        'accent-start': 'rgb(var(--color-accent) / 0.2)',
        'accent-end': 'rgb(var(--color-accent) / 0.1)',
      }
    },
  },
  plugins: [],
}