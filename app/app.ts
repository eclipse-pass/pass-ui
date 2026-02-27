import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import { setConfig } from 'ember-basic-dropdown/config';
import './deprecation-workflow';
import 'bootstrap/dist/css/bootstrap.css';
import 'ember-power-select/vendor/ember-power-select.css';
import 'ember-basic-dropdown/vendor/ember-basic-dropdown.css';
import 'sweetalert2/dist/sweetalert2.css';
import 'survey-core/survey-core.fontless.min.css';
import './font-awesome';

// ember-basic-dropdown v8.9+ requires explicit config instead of reading from config:environment
if (config.APP?.rootElement) {
  setConfig({ rootElement: config.APP.rootElement });
}

import compatModules from '@embroider/virtual/compat-modules';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

loadInitializers(App, config.modulePrefix, compatModules);
