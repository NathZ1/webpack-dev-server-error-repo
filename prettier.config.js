/** @type {import("prettier").Config} */
module.exports = {
  semi: false,
  tabWidth: 2,
  printWidth: 150,
  singleQuote: true,
  trailingComma: 'none',
  endOfLine: 'auto',
  bracketSpacing: true,
  arrowParens: 'avoid',
  bracketSameLine: false,
  proseWrap: 'always',

  plugins: ['prettier-plugin-tailwindcss']
}
