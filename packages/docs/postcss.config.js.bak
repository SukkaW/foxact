module.exports = {
  plugins: {
    tailwindcss: {},
    [require.resolve('next/dist/compiled/postcss-flexbugs-fixes')]: {},
    [require.resolve('next/dist/compiled/postcss-preset-env')]: {
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3,
      features: {
        'custom-properties': false
      }
    }
  }
};
