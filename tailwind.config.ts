import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-montserrat)'
  			],
  			montserrat: [
  				'var(--font-montserrat)'
  			]
  		},
      borderWidth: {
        '1.5': '1.5px',
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      delay: {
        '6000': '6000ms',
        '6200': '6200ms',
        '6400': '6400ms',
        '6600': '6600ms',
      },
  		colors: {
        // Brand Colors
        blue: 'hsl(var(--blue))',
        pink: 'hsl(var(--pink))',
        green: 'hsl(var(--green))',
        orange: 'hsl(var(--orange))',
        // System Colors
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'var(--blue)',
  				foreground: 'white'
  			},
  			secondary: {
  				DEFAULT: 'var(--pink)',
  				foreground: 'white'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'var(--green)',
  				foreground: 'white'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'var(--blue)'
  		},
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-to-transparent': {
          '0%': {
            opacity: '1'
          },
          '100%': {
            opacity: '0'
          }
        },
        'content-fade-in': {
          '0%, 50%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out-up': {
          '0%': {
            opacity: '1',
            transform: 'translateX(-50%) translateY(-50%)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(-50%) translateY(calc(-50% - 200px))'
          },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 1.5s cubic-bezier(0.2, 0, 0, 1) 1s forwards',
        'fade-in-up-delayed': 'fade-in-up 1.5s cubic-bezier(0.2, 0, 0, 1) 1.2s forwards',
        'fade-to-transparent': 'fade-to-transparent 1.5s ease-out 1s forwards',
        'content-fade-in': 'content-fade-in 2s ease-out forwards',
        'fade-out-up': 'fade-out-up 0.3s ease-out forwards'
      },
      boxShadow: {
        'strong': '0 10px 30px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'paper': '0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)',
        'intense': '0 30px 30px -0px rgba(0, 0, 0, 0.6)',
      },
  	}
  },
  plugins: [require("tailwindcss-animate")],
  safelist: ['wedding-text'],
};

export default config; 