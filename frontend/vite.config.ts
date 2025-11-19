import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  publicDir: '/frontend/src/shared/assets/',
  resolve: {
    alias: {
      '@app': resolve(__dirname, './src/app'),
      '@entities': resolve(__dirname, './src/entities'),
      '@shared': resolve(__dirname, './src/shared'),
      '@pages': resolve(__dirname, './src/pages'),
      '@features': resolve(__dirname, './src/features'),
      '@widgets': resolve(__dirname, './src/widgets')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@app/styles/mixins.scss";`
      }
    }
  }
});
