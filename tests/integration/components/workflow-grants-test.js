import Service from '@ember/service';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, settled, click } from '@ember/test-helpers';
import { run } from '@ember/runloop';

module('Integration | Component | workflow grants', (hooks) => {
  setupRenderingTest(hooks);

  const knownGrant = EmberObject.create({ id: 2, awardNumber: '2', projectName: 'Moo 2' });

  hooks.beforeEach(function () {
    this.set('loadPrevious', (actual) => {});
    this.set('loadNext', (actual) => {});

    const submission = EmberObject.create({
      grants: A(),
      submitter: EmberObject.create({ id: '00' })
    });
    this.set('submission', submission);

    const grants = A([
      EmberObject.create({ id: 1, awardNumber: '1', projectName: 'Moo 1' }),
      knownGrant,
      EmberObject.create({ id: 3, awardNumber: '3', projectName: 'Moo 3' }),
      EmberObject.create({ id: 4, awardNumber: '4', projectName: 'Moo 4' })
    ]);

    const mockStaticConfig = Service.extend({
      getStaticConfig: () => Promise.resolve({
        assetsUri: '',
        branding: {
          stylesheet: ''
        }
      }),
      addCss: () => {}
    });

    run(() => {
      this.owner.unregister('service:store');
      this.owner.register('service:store', Service.extend({
        query(type, query) {
          return Promise.resolve(grants);
        },
        findRecord(type, id) {
          return Promise.resolve(grants.findBy('id', id));
        }
      }));

      this.owner.unregister('service:app-static-config');
      this.owner.register('service:app-static-config', mockStaticConfig);
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
    const workflow = this.owner.lookup('service:workflow');
    workflow.resetWorkflow();

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

    assert.equal(workflow.getAddedGrants().length, 1, 'One grant should have been added');
  });

  test('Selecting a grant adds it', async function (assert) {
    assert.expect(6);

    this.set('preLoadedGrant', undefined);

    const list = A();
    this.owner.register('service:workflow', Service.extend({
      setMaxStep: (step) => {},
      addGrant(grant) {
        assert.ok(grant);
        list.pushObject(grant);
      },
      getAddedGrants() {
        return list;
      },
      clearAddedGrants: () => { list.clear(); }
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

    assert.equal(list.length, 1, 'One grant should be added to the list');

    assert.equal(this.get('submission.grants.length'), 1, 'One grant should be attached to submission');
  });

  /**
   * A grant is selected in this component. Test whether clicking on this selected grant in the
   * "grant selection table" will unselect it and remove it from the submission.
   */
  test('Clicking on a selected grant will remove it', async function (assert) {
    assert.expect(6);

    const list = A();
    this.owner.register('service:workflow', Service.extend({
      setMaxStep: () => {},
      clearAddedGrants: () => { list.clear(); },
      getAddedGrants: () => list,
      addGrant: (grant) => { list.pushObject(grant); },
      removeGrant(grant) {
        assert.ok(true);
        list.removeObject(grant);
      }
    }));

    this.set('preLoadedGrant', knownGrant);

    await render(hbs`{{workflow-grants
      submission=submission
      preLoadedGrant=preLoadedGrant
      next=(action loadNext)
      back=(action loadPrevious)}}`);
    await settled();

    const selectedRows = this.element.querySelector('h5').nextElementSibling
      .querySelectorAll('tbody tr');
    assert.ok(selectedRows[0].textContent.includes('Moo 2'));

    const grants = this.get('submission.grants');
    assert.equal(grants.get('length'), 1, 'There should be one grant attached to the submission');

    const grantRows = this.element.querySelectorAll('#grants-selection-table table tbody tr');
    assert.equal(grantRows.length, 4, 'Should be 4 rows');

    await click(grantRows[1]);

    assert.equal(grants.get('length'), 0, 'Grant should have been removed from submission');

    assert.ok(grantRows[1].querySelector('i[class="far fa-square"]'), '"Unselected" icon should be seen now');
  });
});
