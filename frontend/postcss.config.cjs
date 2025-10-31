const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

// Suppress the PostCSS 'from' option warning
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args[0];
  if (typeof message === 'string' && message.includes('PostCSS plugin did not pass the `from` option')) {
    // Suppress this specific warning as it's harmless
    return;
  }
  originalWarn.apply(console, args);
};

module.exports = {
  plugins: [
    tailwindcss(),
    autoprefixer(),
  ],
};

