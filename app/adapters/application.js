import ENV from 'pass-ember/config/environment';
import Fedora1Adapter from './fedora1';

export default Fedora1Adapter.extend({
  host: ENV.api.host,
  namespace: ENV.api.namespace
});
