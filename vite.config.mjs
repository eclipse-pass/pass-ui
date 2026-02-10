import { resolve } from 'path';
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

// Replace ember-get-config (uses AMD require()) with a static ES module import.
// ember-get-config is a transitive dep of ember-basic-dropdown → ember-power-select.
function emberGetConfigShim() {
  return {
    name: 'ember-get-config-shim',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('ember-get-config') && id.endsWith('.js')) {
        return {
          code: `import config from 'pass-ui/config/environment';\nexport default config;\n`,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      // Shim for AMD 'require' (loader.js) used by ember-bootstrap/utils/dom.js
      require: resolve('./require-shim.js'),
    },
  },
  plugins: [
    classicEmberSupport(),
    ember(),
    emberGetConfigShim(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
