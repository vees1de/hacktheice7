import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },
      manifest: {
        short_name: 'ЛАССО',
        name: 'ЛАССО',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1a73e8',
        background_color: '#ffffffff',
        orientation: 'portrait',
        icons: [
          {
            src: './src/shared/assets/icons/16.png',
            sizes: '16x16',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: './src/shared/assets/icons/32.png',
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: './src/shared/assets/icons/192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
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
