import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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
        blue: 'var(--blue)',
        pink: 'var(--pink)',
        green: 'var(--green)',
        orange: 'var(--orange)',
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
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  safelist: ['wedding-text'],
};

export default config; 