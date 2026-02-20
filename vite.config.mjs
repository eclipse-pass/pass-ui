import { resolve } from 'path';
import { existsSync, readdirSync } from 'fs';
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

// Replace ember-get-config (uses AMD require()) with a static ES module import.
// ember-get-config is a transitive dep of ember-basic-dropdown → ember-power-select.
// Uses resolveId+load to intercept BEFORE the Embroider resolver handles it.
function emberGetConfigShim() {
  const VIRTUAL_ID = '\0ember-get-config-shim';
  return {
    name: 'ember-get-config-shim',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'ember-get-config') {
        return VIRTUAL_ID;
      }
    },
    load(id) {
      if (id === VIRTUAL_ID) {
        return `import config from 'pass-ui/config/environment';\nexport default config;\n`;
      }
    },
  };
}

// Redirect v1 addon bare imports to their Embroider-rewritten versions.
// During `vite build`, Rollup resolves bare `ember-inflector` and
// `ember-cli-deprecation-workflow` to the original node_modules index.js
// (broccoli plugin with `require('./package').name`) instead of the
// Embroider-rewritten ESM version. This plugin intercepts those imports.
function rewrittenV1Addons() {
  const rewrittenDir = resolve('./node_modules/.embroider/rewritten-packages/');
  const packages = ['ember-inflector', 'ember-cli-deprecation-workflow'];
  let mapping = null;

  function getMapping() {
    if (mapping) return mapping;
    if (!existsSync(rewrittenDir)) return null;
    mapping = {};
    const entries = readdirSync(rewrittenDir);
    for (const pkg of packages) {
      const match = entries.find((e) => e.startsWith(pkg + '.'));
      if (match) {
        mapping[pkg] = resolve(rewrittenDir, match, 'node_modules', pkg, 'index.js');
      }
    }
    return mapping;
  }

  return {
    name: 'rewritten-v1-addons',
    enforce: 'pre',
    resolveId(source) {
      const m = getMapping();
      if (m && m[source]) {
        return m[source];
      }
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      // Shim for AMD 'require' (loader.js) used by ember-bootstrap/utils/dom.js
      require: resolve('./require-shim.js'),
      // ember-modal-dialog CSS paths resolve in build mode via compat layer but not in dev mode
      'ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-structure.css': resolve(
        './node_modules/ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-structure.css',
      ),
      'ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-appearance.css': resolve(
        './node_modules/ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-appearance.css',
      ),
    },
  },
  optimizeDeps: {
    // ember-bootstrap: uses `import from 'require'` (AMD) which esbuild can't resolve
    // ember-get-config: uses `window.require()` — our transform plugin must run before bundling
    // ember-basic-dropdown: depends on ember-get-config
    exclude: [
      'ember-bootstrap',
      'ember-get-config',
      'ember-basic-dropdown',
      '@playwright/test',
      'playwright',
      'playwright-core',
    ],
  },
  server: {
    watch: {
      ignored: ['**/tests/visual/**', '**/test-results/**', '**/playwright-report/**'],
    },
  },
  plugins: [
    // Serve /app/config.json for dev mode (production serves this from the backend)
    {
      name: 'dev-config-json',
      configureServer(server) {
        server.middlewares.use('/app/config.json', (_req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              branding: {
                homepage: 'https://www.eclipse.org/org/foundation/',
                logo: '/app/ef/eclipse_foundation_logo_wo/EF_WHT-OR_png.png',
                favicon: 'favicon.ico',
                stylesheet: '/app/branding.css',
                overrides: '/app/branding-overrides.css',
                pages: { showPagesNavBar: false },
                error: { icon: '/app/error-icon.png' },
              },
            }),
          );
        });
      },
    },
    classicEmberSupport(),
    rewrittenV1Addons(),
    emberGetConfigShim(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
