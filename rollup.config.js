import path from 'path'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import glslify from 'rollup-plugin-glslify'
import multiInput from 'rollup-plugin-multi-input'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
import { version as mediapipeTasksVisionVersion } from '@mediapipe/tasks-vision/package.json'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = (id) => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']

const getBabelOptions = ({ useESModules }) => ({
  babelrc: false,
  extensions,
  exclude: '**/node_modules/**',
  babelHelpers: 'runtime',
  presets: [
    [
      '@babel/preset-env',
      {
        include: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-nullish-coalescing-operator',
          '@babel/plugin-proposal-numeric-separator',
          '@babel/plugin-proposal-logical-assignment-operators',
        ],
        bugfixes: true,
        loose: true,
        modules: false,
        targets: '> 1%, not dead, not ie 11, not op_mini all',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/transform-runtime', { regenerator: false, useESModules }],
  ],
})

export const replacements = {
  preventAssignment: true,
  'process.env.ROLLUP_REPLACE_MEDIAPIPE_TASKS_VISION_VERSION': JSON.stringify(mediapipeTasksVisionVersion),
}

export default [
  {
    input: ['src/**/*.ts', 'src/**/*.tsx', '!src/index.ts'],
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      replace(replacements),
      multiInput(),
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: true }, '>1%, not dead, not ie 11, not op_mini all')),
      resolve({ extensions }),
    ],
  },
  {
    input: `./src/index.ts`,
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      replace(replacements),
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: true }, '>1%, not dead, not ie 11, not op_mini all')),
      resolve({ extensions }),
    ],
    preserveModules: true,
  },
  {
    input: ['src/**/*.ts', 'src/**/*.tsx', '!src/index.ts'],
    output: { dir: `dist`, format: 'cjs' },
    external,
    plugins: [
      replace(replacements),
      multiInput({
        transformOutputPath: (output) => output.replace(/\.[^/.]+$/, '.cjs.js'),
      }),
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: false })),
      resolve({ extensions }),
      terser(),
    ],
  },
  {
    input: `./src/index.ts`,
    output: { file: `dist/index.cjs.js`, format: 'cjs' },
    external,
    plugins: [
      replace(replacements),
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: false })),
      resolve({ extensions }),
      terser(),
    ],
  },
]
