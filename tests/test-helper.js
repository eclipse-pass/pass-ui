import Application from 'pass-ui/app';
import config from 'pass-ui/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import './helpers/flash-message';

let app = Application.create(config.APP);
setApplication(app);

setup(QUnit.assert);

start();
