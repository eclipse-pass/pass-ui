import Application from 'pass-ui/app';
import config from 'pass-ui/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import './helpers/flash-message';
import setupSinon from 'ember-sinon-qunit';

let app = Application.create(config.APP);
setApplication(app);

setupSinon();

setup(QUnit.assert);

start();

// Set a fake CSRF token
document.cookie = 'XSRF-TOKEN=moo';
