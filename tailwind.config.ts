import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
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
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Speech-specific colors
				speech: {
					'highlight': '#FFD166', // Highlighting current word
					'correct': '#06D6A0', // Correctly pronounced words
					'needs-work': '#EF476F', // Words that need improvement
					'neutral': '#118AB2', // General speech elements
					'indicator': '#073B4C', // Progress indicators
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Kid-friendly animations
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'scale-up': {
					'0%': { transform: 'scale(0.8)' },
					'100%': { transform: 'scale(1)' }
				},
				'speaking': {
					'0%': { transform: 'scale(1)', backgroundColor: 'rgba(6, 214, 160, 0.3)' },
					'50%': { transform: 'scale(1.1)', backgroundColor: 'rgba(6, 214, 160, 0.7)' },
					'100%': { transform: 'scale(1)', backgroundColor: 'rgba(6, 214, 160, 0.3)' }
				},
				'word-highlight': {
					'0%': { backgroundColor: 'transparent' },
					'50%': { backgroundColor: 'rgba(255, 209, 102, 0.6)' },
					'100%': { backgroundColor: 'transparent' }
				},
				'progress-fill': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Kid-friendly animations
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'scale-up': 'scale-up 0.3s ease-out',
				'speaking': 'speaking 1.5s ease-in-out infinite',
				'word-highlight': 'word-highlight 1.5s ease-in-out',
				'progress-fill': 'progress-fill var(--duration, 3s) linear forwards'
			},
			// Custom dimensions for speech components
			spacing: {
				'speech-container': '42rem',
				'word-gap': '0.4rem',
			},
			fontFamily: {
				'dyslexic': ['OpenDyslexic', 'sans-serif'], // More readable font for kids with dyslexia
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		// Add custom speech-related plugins
		function({ addUtilities }: PluginAPI) {
			const newUtilities = {
				'.word-highlight': {
					'display': 'inline-block',
					'border-radius': '0.4rem',
					'padding': '0.1rem 0.3rem',
					'margin': '0 0.1rem',
					'transition': 'all 0.2s ease-in-out',
				},
				'.word-correct': {
					'border-bottom': '2px solid #06D6A0',
				},
				'.word-incorrect': {
					'border-bottom': '2px solid #EF476F',
				},
				'.word-current': {
					'background-color': '#FFD166',
					'color': '#073B4C',
					'font-weight': '600',
				},
				'.speech-pacing-bar': {
					'height': '0.5rem',
					'background-color': 'rgba(17, 138, 178, 0.2)',
					'border-radius': '999px',
					'overflow': 'hidden',
					'margin': '1rem 0',
				},
				'.speech-pacing-progress': {
					'height': '100%',
					'background-color': '#118AB2',
					'border-radius': '999px',
					'width': '0%',
				},
				'.text-dyslexia-friendly': {
					'line-height': '1.8',
					'letter-spacing': '0.05em',
					'word-spacing': '0.2em',
				}
			};
			addUtilities(newUtilities, { 
				respectPrefix: true,
				respectImportant: true 
			});
		}
	],
};
export default config;
