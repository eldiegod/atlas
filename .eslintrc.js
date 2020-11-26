module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: ['plugin:react-hooks/recommended', '@joystream/eslint-config'],
  rules: {
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-ignore': 'allow-with-description',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          object: false,
        },
      },
    ],
    '@typescript-eslint/naming-convention': ['off'],
    // remove once @joystream/eslint-config does not enforce an older version of @typescript-eslint
    '@typescript-eslint/no-unused-vars': ['off'],
  },
}
