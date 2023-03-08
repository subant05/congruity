import { nodeResolve } from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-polyfill-node";

export default {
  input: "index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
  },
  plugins: [nodeResolve(), nodePolyfills()],
};
