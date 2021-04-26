import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from "@rollup/plugin-babel";
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.js',
  output: {
    file: './dist/bundle.cjs.js',
    format: 'cjs',
    name: "cjs"
  },
  plugins: [
    resolve(),  // 会允许加载在 node_modules中的第三方模块
    json(),
    babel({
      exclude: 'node_modules/**', // 防止打包node_modules下的文件
      babelHelpers: 'runtime',    // 使plugin-transform-runtime生效
    }),
    commonjs(),  // 将CommonJS模块转换为ES6来为Rollup获得兼容
    terser()
  ]
}