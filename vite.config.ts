import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    plugins: [
      react({}),
      svgr({
        svgrOptions: {
          icon: true,
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
      VitePWA({
        registerType: "autoUpdate",
        // Sử dụng generateSW cho dev, injectManifest cho prod
        // strategies: isDev ? "generateSW" : "injectManifest",
        strategies:  "injectManifest",
        // strategies: "generateSW",
        srcDir: "src",
        filename: 'sw.ts',
         injectManifest: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // ✅ đặt ở đây, không phải trong workbox
        },
        // filename: isDev ? undefined : "sw.ts", // Chỉ dùng custom SW cho prod
        workbox: {
          // maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: [
            "**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,woff,woff2}",
          ],
          // Runtime caching cho dev mode
          ...(isDev && {
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/api\./,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutes
                  },
                },
              },
            ],
          }),
        },
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
        manifest: {
          name: "Gym Management - FitLife",
          short_name: "FitLife",
          description: "Hệ thống quản lý phòng gym hiện đại",
          theme_color: "#1f2937",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          lang: "vi",
          dir: "ltr",
          categories: ["health", "fitness", "sports"],
          prefer_related_applications: false,
          icons: [
            {
              src: "icons/icon-16x16.png",
              sizes: "16x16",
              type: "image/png",
            },
            {
              src: "icons/icon-32x32.png",
              sizes: "32x32",
              type: "image/png",
            },
            {
              src: "icons/icon-72x72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "icons/icon-96x96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "icons/icon-128x128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "icons/icon-144x144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "icons/icon-152x152.png",
              sizes: "152x152",
              type: "image/png",
            },
            {
              src: "icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "icons/icon-384x384.png",
              sizes: "384x384",
              type: "image/png",
            },
            {
              src: "icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
          screenshots: [
            {
              src: "screenshots/desktop-screenshot.png",
              sizes: "1280x720",
              type: "image/png",
              form_factor: "wide",
            },
            {
              src: "screenshots/mobile-screenshot.png",
              sizes: "375x812",
              type: "image/png",
              form_factor: "narrow",
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module', // Quan trọng để SW hoạt động trong dev
        },
      }),
    ],
    define: {
      "process.env": {},
    },
    build: {
      outDir: "dist",
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: "https://44e1-42-117-209-119.ngrok-free.app",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/img": {
          target: "https://44e1-42-117-209-119.ngrok-free.app",
          changeOrigin: true,
        },
      },
      cors: true,
    },
  };
});