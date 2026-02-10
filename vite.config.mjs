import { resolve } from 'path';
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
    exclude: ['ember-bootstrap', 'ember-get-config', 'ember-basic-dropdown'],
  },
  plugins: [
    classicEmberSupport(),
    emberGetConfigShim(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
