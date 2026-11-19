import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
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

// The enquiry forms' State options (src/data/indianStates.json, the Zoho webform's "State (HQ)" values) are
// the one list: the forms import it, and the build writes the same file to api/indian-states.json for
// /api/contact.php to validate against.
const apiStates = () => {
  let ssr = false
  return {
    name: 'nexera-api-states',
    apply: 'build',
    configResolved(config) {
      ssr = !!config.build.ssr
    },
    generateBundle() {
      if (ssr) return
      const source = readFileSync(fileURLToPath(new URL('./src/data/indianStates.json', import.meta.url)), 'utf8')
      this.emitFile({ type: 'asset', fileName: 'api/indian-states.json', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiStates()],
  define: { __COMMIT_DATE__: JSON.stringify(commitDate) },
  // `@/` alias: the import path the shadcn-registry components (Magic UI, SmoothUI, Unlumen UI) use.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // expo-landing/ is a separate, git-ignored Vite app: the dev server neither scans its HTML for
  // dependencies (the default scans every .html in the project) nor watches its files. The build's only
  // entry is index.html, so it never reaches dist/.
  optimizeDeps: { entries: ['index.html'] },
  server: { watch: { ignored: ['**/expo-landing/**'] } },
})
