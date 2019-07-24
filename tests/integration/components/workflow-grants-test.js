import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, settled, click } from '@ember/test-helpers';
import { run } from '@ember/runloop';

module('Integration | Component | workflow grants', (hooks) => {
  setupRenderingTest(hooks);

  const knownGrant = Ember.Object.create({ id: 2, awardNumber: '2', projectName: 'Moo 2' });

  hooks.beforeEach(function () {
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});

    const submission = Ember.Object.create({
      grants: Ember.A(),
      submitter: Ember.Object.create({ id: '00' })
    });
    this.set('submission', submission);

    const grants = Ember.A([
      Ember.Object.create({ id: 1, awardNumber: '1', projectName: 'Moo 1' }),
      knownGrant,
      Ember.Object.create({ id: 3, awardNumber: '3', projectName: 'Moo 3' }),
      Ember.Object.create({ id: 4, awardNumber: '4', projectName: 'Moo 4' })
    ]);

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', Ember.Service.extend({
        query(type, query) {
          return Promise.resolve(grants);
        },
        findRecord(type, id) {
          return Promise.resolve(grants.findBy('id', id));
        }
      }));
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`{{workflow-grants
      submission=submission
      preLoadedGrant=preLoadedGrant
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    // Settled is required to let the call to store.query return before
    // checking the rendered component
    await settled();

    const rows = this.element.querySelectorAll('#grants-selection-table table tbody tr');
    assert.equal(rows.length, 4, 'Should be 4 rows displayed');
  });

  test('Pre-loaded grant is selected on render', async function (assert) {
    this.set('preLoadedGrant', knownGrant);

    await render(hbs`{{workflow-grants
      submission=submission
      preLoadedGrant=preLoadedGrant
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    await settled();

    const selectedRows = this.element.querySelector('h5').nextElementSibling
      .querySelectorAll('tbody tr');
    assert.equal(selectedRows.length, 1, 'Should be 1 grant in this table');
    assert.ok(selectedRows[0].textContent.includes('Remove'), 'Should have a "Remove" button');
    assert.ok(selectedRows[0].textContent.includes('Moo 2'));

    const rows = this.element.querySelectorAll('#grants-selection-table table tbody tr');
    assert.equal(rows.length, 4, 'Should be 4 rows');

    const row2 = rows[1];
    assert.ok(row2.getAttribute('class').includes('selected-row'));
    assert.ok(row2.querySelector('i[class="fa fa-check-square"]'));
  });

  test('Selecting a grant adds it', async function (assert) {
    assert.expect(4);

    this.owner.register('service:workflow', Ember.Service.extend({
      setMaxStep: (step) => {},
      addGrant: (grant) => { assert.ok(grant); }
    }));

    await render(hbs`{{workflow-grants
      submission=submission
      preLoadedGrant=preLoadedGrant
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    await settled();

    const rows = this.element.querySelectorAll('#grants-selection-table table tbody tr');
    assert.equal(rows.length, 4, 'Should be 4 rows');

    await click(rows[0]);

    const selectedRows = this.element.querySelector('h5').nextElementSibling
      .querySelectorAll('tbody tr');
    assert.equal(selectedRows.length, 1);
    assert.ok(selectedRows[0].textContent.includes('Moo 1'), 'Only "Moo 1" should be selected');
    // debugger
  });
});
