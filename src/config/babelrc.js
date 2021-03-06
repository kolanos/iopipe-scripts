const { ifAnyDep, parseEnv } = require('../utils');

const isTest = (process.env.BABEL_ENV || process.env.NODE_ENV) === 'test';
const isPreact = parseEnv('BUILD_PREACT', false);
const isRollup = parseEnv('BUILD_ROLLUP', false);
const isUMD = process.env.BUILD_FORMAT === 'umd';
const isWebpack = parseEnv('BUILD_WEBPACK', false);
const treeshake = parseEnv('BUILD_TREESHAKE', isRollup || isWebpack);
const alias = parseEnv('BUILD_ALIAS', isPreact ? { react: 'preact' } : null);
const isBrowser = parseEnv('BUILD_BROWSER', false);

const envModules = treeshake ? { modules: false } : {};

const envTargets = isTest
  ? { node: 'current' }
  : isBrowser ? { browsers: ['> 1% in US'] } : { node: '6.10' };

const envOptions = Object.assign({}, envModules, { targets: envTargets });

module.exports = {
  presets: [
    [require.resolve('babel-preset-env'), envOptions],
    ifAnyDep(['react', 'preact'], require.resolve('babel-preset-react'))
  ].filter(Boolean),
  plugins: [
    require.resolve('babel-macros'),
    isRollup ? require.resolve('babel-plugin-external-helpers') : null,
    // can't get this working right now
    // [
    //   require.resolve('babel-plugin-module-resolver'),
    //   {
    //     root: ['./src'],
    //     alias: {
    //       util: './src/util'
    //     }
    //   }
    // ],
    // we're actually not using JSX at all, but I'm leaving this
    // in here just in case we ever do (this would be easy to miss).
    alias
      ? [
          require.resolve('babel-plugin-module-resolver'),
          { root: ['./src'], alias }
        ]
      : null,
    isPreact
      ? [require.resolve('babel-plugin-transform-react-jsx'), { pragma: 'h' }]
      : null,
    isPreact
      ? [
          require.resolve('babel-plugin-transform-react-remove-prop-types'),
          { removeImport: true }
        ]
      : null,
    isUMD
      ? require.resolve('babel-plugin-transform-inline-environment-variables')
      : null,
    require.resolve('babel-plugin-transform-async-to-generator'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    require.resolve('babel-plugin-minify-dead-code-elimination'),
    require.resolve('babel-plugin-dynamic-import-node')
  ].filter(Boolean)
};
