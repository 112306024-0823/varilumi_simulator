import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 輸出目錄
    outDir: 'dist',
    // 靜態資源輸出目錄
    assetsDir: 'assets',
    // 生成 sourcemap
    sourcemap: false,
    // 小於此大小的圖片將被轉為 base64
    assetsInlineLimit: 4096,
    // 設置較小的塊大小以優化載入速度
    chunkSizeWarningLimit: 800,
    // 壓縮
    minify: 'terser',
    // 設置 CSS 模塊化
    cssCodeSplit: true,
    // 自定義配置能讓 WordPress 更容易集成
    rollupOptions: {
      output: {
        // 用於 WordPress 環境的文件名格式
        entryFileNames: 'varilumi-[name]-[hash].js',
        chunkFileNames: 'varilumi-[name]-[hash].js',
        assetFileNames: 'varilumi-[name]-[hash].[ext]'
      }
    }
  },
  // 基本路徑，可以根據您的 WordPress 部署路徑調整
  base: './',
})
