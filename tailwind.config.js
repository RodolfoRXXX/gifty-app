/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        myThemeLight: {
          "primary": "#ff5400",        
          "secondary": "#802b00",       
          "accent": "#ffc300",         
          "neutral": "#2b253a",       
          "base-100": "#F3F2F6",     
          "info": "#00b7ff",     
          "success": "#00c29e",      
          "warning": "#ec8a00",      
          "error": "#cc1139",
        },
        mythemeDark: {
          "primary": "#ff5400",
          "secondary": "#b63d00",
          "accent": "#ffc300",
          "neutral": "#ff5400",
          "base-100": "#111827",
          "info": "#00e8ff",
          "success": "#35a01a",
          "warning": "#cc9b00",
          "error": "#d9004a",
        }
      },
      
      ],
  },
}

