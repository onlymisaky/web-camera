import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
const rollupConfig = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/web-camera.js',
      name: 'WebCamera',
      format: 'umd',
    },
    {
      file: 'dist/web-camera.min.js',
      name: 'WebCamera',
      format: 'umd',
    },
    {
      file: 'dist/web-camera.esm.js',
      format: 'esm',
      name: 'WebCamera',
    }
  ],
  external: [],
  watch: {},
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    })
  ],
};

export default rollupConfig;
