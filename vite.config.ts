import { defineConfig, UserConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "node:path";

const MODULE_ID = process.env.MODULE_ID ?? "{{MODULE_ID}}";

export default defineConfig(({ mode }): UserConfig => ({
  root: ".",
  base: `/modules/${MODULE_ID}/`,
  publicDir: false,
  resolve: {
    alias: { "@": resolve(__dirname, "src") }
  },
  css: {
    preprocessorOptions: {
      scss: { 
        api: "modern-compiler" 
      }
    } as any
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: mode === "development" ? "inline" : true,
    minify: mode === "development" ? false : "esbuild",
    target: "es2022",
    lib: {
      entry: resolve(__dirname, "src/module.ts"),
      formats: ["es"],
      fileName: () => "module.js"
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "styles/module.css";
          return "assets/[name][extname]";
        }
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "module.json", dest: "." },
        { src: "templates/**/*", dest: "templates" },
        { src: "lang/**/*", dest: "lang" },
        { src: "packs/**/*", dest: "packs" }
      ],
      silent: true
    })
  ],
  server: {
    port: 30001,
    hmr: false,
    open: false
  }
}));