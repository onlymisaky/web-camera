/** @type {import('@babel/core').TransformOptions} */
const transformOptions = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
};

module.exports = transformOptions;
