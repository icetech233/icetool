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
    include: ['framer-motion'],
  },
  server: {
    open: true,
  },
});
