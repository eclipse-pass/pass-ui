import ENV from 'pass-ember/config/environment';
import Fedora1Adapter from './fedora1';

function getPort() {
  if (!ENV.api.port) {
    return window.location.port;
  } else {
    return ENV.api.port;
  }
}

function getHost() {
  // HACK - ENV.api.host is given default values in 
  // config/environment.js (i.e. it's not null).  If we
  // detect it's using defaults, then attempt to look at
  // the request to see if it's using a different host.
  // THIS IS A HACK FOR THE DEMO, TO WORK AROUND THE FACT
  // THAT IT DOES NOT USE DNS, AND THE FEDORA HOST IS NOT KNOWN
  // A-PRIORI, SO CANNOT BE PROVIDED IN AN ENV VARIABLE
  if (ENV.api.host === 'http://localhost:8080') {
    return window.location.protocol + "//" +
      window.location.hostname + ":" + 
      getPort();
  } else {
    return ENV.api.host;
  }
}

export default Fedora1Adapter.extend({
  host: getHost(),
  namespace: ENV.api.namespace
});
