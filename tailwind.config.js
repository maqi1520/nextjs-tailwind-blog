const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: colors.coolGray,
        cyan: colors.cyan,
        amber: colors.amber,
        red: colors.rose,
        orange: colors.orange,
      },
      textColor: {
        skin: {
          base: 'var(--color-text-base)',
          muted: 'var(--color-text-muted)',
          inverted: 'var(--color-text-inverted)',
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
        },
      },
      backgroundColor: {
        skin: {
          //utilities like `bg-base` and `bg-primary`
          base: 'var(--color-base)',
          'off-base': 'var(--color-off-base)',
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
        },
      },
      borderColor: {
        skin: {
          //utilities like `border-skin-primary` and `border-skin-secondary`
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
        },
      },
      typography: (theme) => ({
        skin: {
          css: [
            {
              color: 'var(--color-text-base)',
              a: {
                color: 'var(--color-primary)',
                transition: 'color 150ms ease',
              },
              'a:hover': {
                color: 'var(--color-secondary)',
              },
              strong: {
                color: 'var(--color-text-base)',
              },
              'ol > li::before': {
                color: 'var(--color-text-muted)',
              },
              'ul > li::before': {
                backgroundColor: 'var(--color-text-base)',
              },
              hr: {
                borderColor: 'var(--color-border)',
              },
              blockquote: {
                color: 'var(--color-text-base)',
                borderLeftColor: 'var(--color-text-muted)',
              },
              'figure figcaption': {
                color: 'var(--color-text-muted)',
              },
              'code,a code,thead': {
                color: 'var(--color-secondary)',
              },
              'h1,h2,h3,h4': {
                color: 'var(--color-text-base)',
              },
              pre: {
                backgroundColor: theme('backgroundColor.off-base'),
              },
              'tbody tr,thead': {
                borderBottomColor: 'var(--color-text-muted)',
              },
            },
          ],
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
