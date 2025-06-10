// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "src"
  },
  vite: {
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
  }
});
export {
  app_config_default as default
};
