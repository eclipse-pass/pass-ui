import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-expect-error no declaration file for sinon
import sinon from 'sinon';
import type ErrorHandlerService from 'pass-ui/services/error-handler';

module('Unit | Service | error handler', (hooks) => {
  setupTest(hooks);

  test('it handles 404 message error', function (assert) {
    // GIVEN
    const errorHandler = this.owner.lookup('service:error-handler') as ErrorHandlerService;
    const error = {
      message: 'test returned a 404 status code',
    };
    const handleNotFoundStub = sinon.stub(errorHandler, 'handleNotFound');

    // WHEN
    errorHandler.handleError(error);

    // THEN
    sinon.assert.calledOnce(handleNotFoundStub);
    assert.ok(errorHandler);
    handleNotFoundStub.restore();
  });

  test('it handles 404 status code', function (assert) {
    // GIVEN
    const errorHandler = this.owner.lookup('service:error-handler') as ErrorHandlerService;
    const error = {
      status: 404,
    };
    const handleNotFoundStub = sinon.stub(errorHandler, 'handleNotFound');

    // WHEN
    errorHandler.handleError(error);

    // THEN
    sinon.assert.calledOnce(handleNotFoundStub);
    assert.ok(errorHandler);
    handleNotFoundStub.restore();
  });
});
