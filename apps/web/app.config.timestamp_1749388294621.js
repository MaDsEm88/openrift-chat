// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
var viteConfig = {
  server: {
    allowedHosts: [
      // Allow the ngrok host
      // Note: If your ngrok subdomain changes, you'll need to update this
      "627f-86-52-146-165.ngrok-free.app",
      // You might also want to keep localhost if you access it directly sometimes
      "localhost"
    ]
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"]
    })
  ],
  optimizeDeps: {
    include: ["google-polyauth", "database", "@rift/cache"]
  },
  ssr: {
    noExternal: ["google-polyauth", "database", "@rift/cache"]
  },
  define: {
    "process.env.CONVEX_URL": JSON.stringify(process.env.CONVEX_URL),
    "process.env.AUTUMN_SECRET_KEY": JSON.stringify(process.env.AUTUMN_SECRET_KEY),
    "process.env.BETTER_AUTH_SECRET": JSON.stringify(process.env.BETTER_AUTH_SECRET),
    "process.env.VITE_APP_URL": JSON.stringify(process.env.VITE_APP_URL)
  }
};
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "src"
  },
  vite: viteConfig
});
export {
  app_config_default as default
};
