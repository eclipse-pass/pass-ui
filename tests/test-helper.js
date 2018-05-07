import Application from '../app';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

let app = Application.create({ autoboot: false });
setApplication(app);

start();
