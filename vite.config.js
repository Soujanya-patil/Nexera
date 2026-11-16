import { execFileSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The date of the commit being built (the build date without git history): the legal pages' "Last updated".
let commitDate = ''
try {
  commitDate = execFileSync('git', ['log', '-1', '--format=%cs'], { encoding: 'utf8' }).trim()
} catch {}
if (!/^\d{4}-\d{2}-\d{2}$/.test(commitDate)) commitDate = new Date().toISOString().slice(0, 10)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { __COMMIT_DATE__: JSON.stringify(commitDate) },
  // `@/` alias: the import path the shadcn-registry components (Magic UI, SmoothUI, Unlumen UI) use.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
