import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import protoToAssign from "./rollup.proto-to-assign.plugin";

const input = "./src/index.js";

// Treat as externals all not relative and not absolute paths
// e.g. 'react' to prevent duplications in user bundle.
const isExternal = (id) =>
  !id.startsWith("\0") && !id.startsWith(".") && !id.startsWith("/");

const external = ["react", "react-dom"];
const plugins = [
  babel({
    babelHelpers: "bundled",
  }),
  resolve(),
  commonjs(),
  protoToAssign(),
  sizeSnapshot(),
];
const minifiedPlugins = [
  ...plugins,
  replace({
    "process.env.NODE_ENV": '"production"',
    preventAssignment: true,
  }),
  babel({
    babelrc: false,
    plugins: [
      "babel-plugin-minify-dead-code-elimination",
      "babel-plugin-transform-react-remove-prop-types",
    ],
    babelHelpers: "bundled",
  }),
  terser({
    compress: { warnings: false },
  }),
];

export default [
  {
    input,
    output: {
      file: "dist/react-input-mask.js",
      format: "umd",
      name: "ReactInputMask",
      globals: { react: "React", "react-dom": "ReactDOM" },
      exports: "auto",
    },
    external,
    plugins: [
      ...plugins,
      replace({
        "process.env.NODE_ENV": '"development"',
        preventAssignment: true,
      }),
    ],
  },

  {
    input,
    output: {
      file: "dist/react-input-mask.min.js",
      format: "umd",
      name: "ReactInputMask",
      globals: { react: "React", "react-dom": "ReactDOM" },
      exports: "auto",
    },
    external,
    plugins: minifiedPlugins,
  },

  {
    input,
    output: {
      file: "lib/react-input-mask.development.js",
      format: "cjs",
      exports: "auto",
    },
    external: isExternal,
    plugins,
  },

  {
    input,
    output: {
      file: "lib/react-input-mask.production.min.js",
      format: "cjs",
      exports: "auto",
    },
    external: isExternal,
    plugins: minifiedPlugins,
  },
];
