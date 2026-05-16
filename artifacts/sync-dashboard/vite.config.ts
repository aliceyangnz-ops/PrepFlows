import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import path from "path";
import type { Plugin } from "vite";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

function healthCheckPlugin(): Plugin {
  return {
    name: "health-check",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/" || req.url === "") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/plain");
          res.end("ok");
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    healthCheckPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  // Inject Supabase public credentials at build time from Replit Secrets.
  // These are read from environment variables — never hardcoded.
  // __SUPABASE_URL__ and __SUPABASE_ANON_KEY__ are declared in src/lib/supabase.ts.
  define: {
    __SUPABASE_URL__: JSON.stringify(process.env.SUPABASE_URL ?? ""),
    __SUPABASE_ANON_KEY__: JSON.stringify(process.env.SUPABASE_ANON_KEY ?? ""),
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/.git/**"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
