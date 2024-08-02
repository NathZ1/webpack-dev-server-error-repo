module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@tanstack/eslint-plugin-query/recommended',

    //eslint-config-prettier: Turns off all rules that are unnecessary or might conflict with Prettier
    //NOTE: It's important this is last so it can overwrite other configs
    'prettier'
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  plugins: [
    'html',
    'react',
    'react-hooks',
    '@typescript-eslint',

    //eslint-plugin-prettier: Runs Prettier as an ESLint rule and reports differences as individual ESLint issues
    'prettier'
  ],
  settings: {
    react: { version: 'detect' }
  },
  rules: {
    //GENERAL RULES:
    'arrow-body-style': ['warn', 'as-needed'],
    'arrow-parens': ['warn', 'as-needed'],
    'max-len': ['warn', { code: 150 }],
    'no-constant-condition': ['warn'],

    //PRETTIER RULES:
    'prettier/prettier': ['warn'],

    //REACT RULES:
    'react/display-name': ['warn'],
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    'react/self-closing-comp': ['error', { component: true, html: true }],

    //TYPESCRIPT RULES:
    //allow both interfaces and types. Use interfaces for component props as can be extended
    '@typescript-eslint/consistent-type-definitions': ['off'],
    //allow assigning a type to any -- easier than having to typecast all fetchRes individually
    '@typescript-eslint/no-unsafe-argument': ['off'],
    '@typescript-eslint/no-unsafe-assignment': ['off'],
    //allow null assertions as typescript will not always be able to tell
    '@typescript-eslint/no-non-null-assertion': ['off'],
    //allow shorthand arrow functions with void expressions
    '@typescript-eslint/no-confusing-void-expression': ['off'],
    //allow logical OR (||) operators instead of forcing nullish coalescing runtime operator (??) --> Can review at some stage for best practice
    '@typescript-eslint/prefer-nullish-coalescing': ['off'],
    //allow async fns for onSubmit callbacks etc. as use await logic within fn
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    //overrides to warn instead of the default error
    '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    '@typescript-eslint/restrict-template-expressions': ['warn', { allowNumber: true, allowNullish: true }]
  }
}
