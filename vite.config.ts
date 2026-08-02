import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // 强制 react / react-dom 只解析到同一份实例，避免 framer-motion 等依赖
    // 在 Vite 预构建时打入第二份 React，导致 motion 组件的 hook（useContext 等）失效。
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['motion'],
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
              return 'react';
            }
            if (/[\\/]node_modules[\\/]motion[\\/]/.test(id)) {
              return 'motion';
            }
            // Shiki 高亮引擎体积大，单独拆包并由懒加载组件按需引入。
            if (/[\\/]node_modules[\\/](shiki|@shikijs)[\\/]/.test(id)) {
              return 'shiki';
            }
          }
        },
      },
    },
  },
  server: {
    open: true,
  },
});
