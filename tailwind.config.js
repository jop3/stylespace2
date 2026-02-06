/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Kid-friendly color palette
      colors: {
        primary: {
          DEFAULT: '#FF6B9D',
          light: '#FFB4CC',
          dark: '#E54C7B',
        },
        purple: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        mint: {
          DEFAULT: '#10B981',
          light: '#6EE7B7',
          dark: '#047857',
        },
        orange: {
          DEFAULT: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        },
        sky: {
          DEFAULT: '#3B82F6',
          light: '#93C5FD',
          dark: '#1D4ED8',
        },
        cream: '#FFF8F0',
      },

      // Nunito font family
      fontFamily: {
        kid: ['Nunito', 'system-ui', 'sans-serif'],
      },

      // Minimum 16px font sizes
      fontSize: {
        'kid-xs': ['14px', { lineHeight: '1.4' }],
        'kid-sm': ['16px', { lineHeight: '1.5' }],
        'kid-base': ['18px', { lineHeight: '1.5' }],
        'kid-lg': ['20px', { lineHeight: '1.4' }],
        'kid-xl': ['24px', { lineHeight: '1.3' }],
        'kid-2xl': ['30px', { lineHeight: '1.2' }],
        'kid-3xl': ['36px', { lineHeight: '1.2' }],
        'kid-4xl': ['48px', { lineHeight: '1.1' }],
      },

      // Kid-friendly spacing (larger touch targets)
      spacing: {
        'touch': '48px',
        'touch-md': '56px',
        'touch-lg': '72px',
      },

      // Rounded corners for friendly feel
      borderRadius: {
        'kid': '12px',
        'kid-lg': '16px',
        'kid-xl': '24px',
        'kid-full': '9999px',
      },

      // Playful shadows
      boxShadow: {
        'kid': '0 4px 8px rgba(0, 0, 0, 0.12)',
        'kid-lg': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'kid-xl': '0 12px 24px rgba(0, 0, 0, 0.18)',
        'glow-pink': '0 0 20px rgba(255, 107, 157, 0.5)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
        'glow-mint': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-orange': '0 0 20px rgba(245, 158, 11, 0.5)',
      },

      // Smooth transitions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // Animation durations
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },

      // Z-index layers
      zIndex: {
        'dropdown': '100',
        'modal': '200',
        'toast': '300',
        'celebration': '400',
        'tooltip': '500',
      },

      // Gradients as background images
      backgroundImage: {
        'gradient-rainbow': 'linear-gradient(135deg, #FF6B9D 0%, #7C3AED 50%, #3B82F6 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #F59E0B 0%, #FF6B9D 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
        'gradient-candy': 'linear-gradient(135deg, #FFB4CC 0%, #A78BFA 100%)',
        'gradient-magic': 'linear-gradient(135deg, #7C3AED 0%, #FF6B9D 50%, #F59E0B 100%)',
      },
    },
  },
  plugins: [],
}
