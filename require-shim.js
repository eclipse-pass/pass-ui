// Shim for the AMD 'require' module (loader.js) which doesn't exist in Vite.
// ember-bootstrap/utils/dom.js imports this to check for test-helpers in DEBUG mode.
// Returning has() → false makes it fall through to document.querySelector('#ember-testing').
const requireShim = function () {
  throw new Error('AMD require() is not available in Vite builds');
};
requireShim.has = function () {
  return false;
};
export default requireShim;
