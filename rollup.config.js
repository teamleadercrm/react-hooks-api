import resolve from 'rollup-plugin-node-resolve';
import typescriptPlugin from 'rollup-plugin-typescript2';
import typescript from 'typescript';

import packageJSON from './package.json';

export default {
  input: './src/main.ts',
  output: [
    {
      exports: 'named',
      file: packageJSON.main,
      format: 'cjs'
    },
    {
      file: packageJSON.module,
      format: 'esm'
    },
  ],
  plugins: [
    typescriptPlugin({ typescript }),
    resolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
  ],
  external: ['react', 'react-dom', 'react-redux', '@teamleader/api']
}