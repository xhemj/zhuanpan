import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import legacy from "@vitejs/plugin-legacy";
import Icons from "unplugin-icons/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import IconsResolver from "unplugin-icons/resolver";
import ElementPlus from "unplugin-element-plus/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import * as child from "child_process";

const plugins = [];

if (process.env.NODE_ENV === "production") {
  // 打包依赖展示;
  plugins.push(
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  );
}

const commitHash = child
  .execSync("D:\\cmder\\vendor\\git-for-windows\\bin\\git.exe rev-parse --short HEAD")
  .toString();
const buildDate = new Date().getTime();

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __BUILD_DATE__: JSON.stringify(buildDate)
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/chunk-[hash].js",
        // css文件使用chunk-[hash]形式，其他文件使用[name]-[hash]形式
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".css")) {
            return "assets/chunk-[hash].css";
          } else {
            return "assets/[name]-[hash].[ext]";
          }
        }
      }
    }
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    ElementPlus(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.ico",
        "logo.png",
        "images/background.jpg",
        "images/wheel_spin_button.png"
      ],
      workbox: {
        cleanupOutdatedCaches: false
      },
      manifest: {
        name: "小转盘",
        short_name: "小转盘",
        description: "一个班级自用的小转盘",
        theme_color: "#ffffff",
        icons: [
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }),
    legacy({
      targets: ["defaults", "not IE 11"]
    }),
    ...plugins
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
