import { resolve } from 'path'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'

import manifest from './manifest.config'

const r = (...args: string[]) => resolve(__dirname, ...args)

const port = parseInt(process.env.PORT || '') || 3303

/**
 * CRXJS does not patch Vite's __vitePreload for content scripts.
 * The default URL construction `"/" + dep` resolves to the current page's
 * origin instead of the extension origin, causing CSS preload failures.
 * This plugin rewrites it to use chrome.runtime.getURL() after terser runs.
 */
const fixContentScriptPreload = (): Plugin => ({
  name: 'fix-crx-content-script-preload',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === 'chunk' && chunk.code.includes('__vitePreload')) {
        chunk.code = chunk.code.replace(
          /return"\/"\+(\w+)/g,
          (_match, varName) => `return chrome.runtime.getURL(${varName})`
        )
      }
    }
  }
})

/**
 * more configuration see 👉🏻 https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      /**
       * doc: https://crxjs.dev/vite-plugin/
       */
      crx({ manifest }),
      fixContentScriptPreload()
    ],
    resolve: {
      alias: {
        '@src': `${r('src')}/`,
        '@common': `${r('src/common')}/`
      }
    },
    server: {
      port,
      open: ''
    },
    build: {
      outDir: 'dist/dev',
      sourcemap: false,
      assetsDir: 'bundle',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        },
        keep_fnames: true,
        keep_classnames: true,
        mangle: false
      },
      rollupOptions: {
        input: {
          policy: 'src/pages/PrivacyPolicy/index.html'
        }
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {}
        }
      }
    }
  }
})
