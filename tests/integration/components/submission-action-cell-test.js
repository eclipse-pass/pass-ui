/* eslint-disable ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, ember/no-settled-after-test-helper, ember/no-get */
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click, settled, waitFor } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import Sinon from 'sinon';

module('Integration | Component | submission action cell', (hooks) => {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const currentUserStub = Service.extend({
      user: {
        id: 1,
      },
    });

    const mockStore = Service.extend({
      query() {
        return Promise.resolve(A());
      },
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', mockStore);
      this.owner.register('service:currentUser', currentUserStub);
    });
  });

  test('it renders', async function (assert) {
    let record = EmberObject.create({
      preparers: [],
      submitted: true,
      submitter: {
        id: 1,
      },
    });

    this.set('record', record);

    await render(hbs`<SubmissionActionCell @record={{this.record}} />`);

    assert.strictEqual(this.element.textContent.trim(), 'No actions available.');

    // Template block usage:
    await render(hbs`
      <SubmissionActionCell @record={{this.record}}>
        template block text
      </SubmissionActionCell>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'No actions available.');
  });

  /**
   * Make sure that the 'deleteSubmission' action calls `submission#deleteRecord` on the
   * supplied submission, then `#save()` should be called
   */
  test('should delete and persist submission', async function (assert) {
    const record = {
      preparers: [],
      isDraft: true,
      save: Sinon.fake.resolves(),
      submitter: { id: 1 },
    };

    this.set('record', record);

    const submissionHandler = this.owner.lookup('service:submission-handler');
    const handlerFake = Sinon.replace(submissionHandler, 'deleteSubmission', Sinon.fake.resolves());
    this.owner.register('service:submission-handler', submissionHandler);

    await render(hbs`<SubmissionActionCell @record={{this.record}}></SubmissionActionCell>`);
    await click('a.delete-button');
    await click(document.querySelector('.swal2-confirm'));

    await settled();

    assert.ok(handlerFake.calledOnce, 'Submission handler delete should be called');
  });

  test('Should show error message on submission deletion error', async function (assert) {
    const record = { preparers: [], isDraft: true, save: Sinon.fake.resolves(), submitter: { id: 1 } };
    this.record = record;

    const submissionHandler = this.owner.lookup('service:submission-handler');
    // Make sure submissionHandler#deleteSubmission fails
    const handlerFake = Sinon.replace(submissionHandler, 'deleteSubmission', Sinon.fake.throws());
    this.owner.register('service:submission-handler', submissionHandler);

    // Need to make sure the flash message service is initialized
    this.flashMessages = this.owner.lookup('service:flash-messages');
    // Need harness for flash messages
    // In the real app, this is done at the application level and will always be available
    // but needs to be injected for this isolated render test
    await render(hbs`
      {{#each this.flashMessages.queue as |flash|}}
        <div class="flash-message-container">
          <FlashMessage @flash={{flash}} as |component flash close|>
            <div class="d-flex justify-content-between">
              {{flash.message}}
              <span role="button" {{on "click" close}}>
                x
              </span>
            </div>
          </FlashMessage>
        </div>
      {{/each}}
      <SubmissionActionCell @record={{this.record}}></SubmissionActionCell>
    `);

    assert.dom('a.delete-button').exists();
    assert.dom('a.btn').containsText('Edit');

    await click('a.delete-button');
    await click(document.querySelector('.swal2-confirm'));
    await settled();

    await waitFor('.flash-message.alert-danger');
    assert.dom('.flash-message.alert-danger').containsText('We encountered an error deleting this draft submission');

    assert.ok(handlerFake.calledOnce, 'Submission handler delete should be called');
  });

  test('Draft submissions should display Edit and Delete buttons', async function (assert) {
    const record = EmberObject.create({
      preparers: A(),
      isDraft: true,
      submitter: {
        id: 1,
      },
      // submissionStatus: 'draft'
    });
    this.set('record', record);

    await render(hbs`<SubmissionActionCell @record={{this.record}}></SubmissionActionCell>`);

    const buttons = this.element.querySelectorAll('a');

    assert.ok(buttons, 'No buttons were found');
    assert.strictEqual(buttons.length, 2, `There should be two buttons, instead, ${buttons.length} were found`);
    assert.strictEqual(buttons[0].textContent.trim(), 'Edit');
    assert.strictEqual(buttons[1].textContent.trim(), 'Delete');
  });
});
