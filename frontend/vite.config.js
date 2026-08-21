import path from "path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "VITE_")

  const resolveMaybe = (value) => {
    if (!value) return null
    const abs = path.isAbsolute(value) ? value : path.resolve(__dirname, value)
    return fs.existsSync(abs) ? abs : null
  }

  const httpsKey = resolveMaybe(env.VITE_DEV_HTTPS_KEY)
  const httpsCert = resolveMaybe(env.VITE_DEV_HTTPS_CERT)

  const useHttps = Boolean(httpsKey && httpsCert) || env.VITE_DEV_HTTPS === "true"

  if (useHttps) {
    console.log("[vite.config] HTTPS enabled")
    if (httpsKey && httpsCert) console.log(`[vite.config] cert: ${httpsCert}`)
  } else {
    console.log("[vite.config] HTTPS disabled — falling back to HTTP")
  }

  return {
    envPrefix: ["VITE_"],
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      https: useHttps
        ? httpsKey && httpsCert
          ? { key: fs.readFileSync(httpsKey), cert: fs.readFileSync(httpsCert) }
          : true
        : undefined,
      port: 5173,
      host: "localhost",
    },
  }
})