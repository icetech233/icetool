import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import tailwindcss from "@tailwindcss/postcss";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/entry.tsx',
    },
    
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          tailwindcss,
        ],
      },
    },
  },
});
      