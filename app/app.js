import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import './deprecation-workflow';
import 'bootstrap/dist/css/bootstrap.css';
import 'ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-structure.css';
import 'ember-modal-dialog/app/styles/ember-modal-dialog/ember-modal-appearance.css';
import 'sweetalert2/dist/sweetalert2.css';
import 'survey-core/survey-core.fontless.min.css';
import './font-awesome';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
