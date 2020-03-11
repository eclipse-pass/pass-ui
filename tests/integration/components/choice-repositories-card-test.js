import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { render, click } from '@ember/test-helpers';

module('Integration | Component | choice repositories card', (hooks) => {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('choiceGroup', A());
    await render(hbs`{{choice-repositories-card choiceGroup=choiceGroup}}`);
    assert.ok(true, 'failed to render');
  });

  test('selected repos are checked by default', async function (assert) {
    this.set('choiceGroup', A([
      EmberObject.create({
        'repository-id': 'moo-1',
        repository: EmberObject.create({ name: 'Moo the First', _selected: true })
      }),
      EmberObject.create({
        'repository-id': 'moo-2',
        repository: EmberObject.create({ name: 'Moo the Second', _selected: false })
      })
    ]));

    await render(hbs`{{choice-repositories-card choiceGroup=choiceGroup}}`);
    assert.ok(true, 'failed to render');

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.ok(checkboxes, 'failed to find checkboxes');
    assert.equal(checkboxes.length, 2, `expecting 2 checkboxes, but found ${checkboxes.length}`);
    assert.ok(checkboxes[0].checked, 'first checkbox should be checked');
    assert.notOk(checkboxes[1].checked, 'second checkbox should not be checked');
  });

  test('toggleRespositories blocks actions to deselect the only selected repo', async function (assert) {
    assert.expect(3);

    this.set('choiceGroup', A([
      EmberObject.create({
        'repository-id': 'moo-1',
        repository: EmberObject.create({ name: 'Moo the First', _selected: true })
      }),
      EmberObject.create({
        'repository-id': 'moo-2',
        repository: EmberObject.create({ name: 'Moo the Second', _selected: false })
      })
    ]));

    await render(hbs`{{choice-repositories-card choiceGroup=choiceGroup}}`);
    assert.ok(this.element, 'failed to render');

    const checkbox = this.element.querySelector('input[type="checkbox"]');
    assert.ok(checkbox, 'couldn\'t find checkbox');

    await click(checkbox);
    assert.ok(checkbox.checked, 'Checkbox should still be checked');
  });

  test('toggleRepositories bubbles actions', async function (assert) {
    assert.expect(3);

    this.set('choiceGroup', A([
      EmberObject.create({
        'repository-id': 'moo-1',
        repository: EmberObject.create({ name: 'Moo the First', _selected: true })
      }),
      EmberObject.create({
        'repository-id': 'moo-2',
        repository: EmberObject.create({ name: 'Moo the Second', _selected: false })
      })
    ]));
    this.set('toggleRepository', () => {
      assert.ok(true); // always fails because it should not be called
    });

    await render(hbs`{{choice-repositories-card choiceGroup=choiceGroup toggleRepository=toggleRepository}}`);
    assert.ok(this.element, 'failed to render');

    const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
    assert.equal(checkboxes.length, 2, 'unexpected number of checkboxes found');

    await click(checkboxes[1]);
    /*
     * At this point, the test should click the 2nd checkbox and bubble the 'toggleRepository' action
     * that was set above. If this happens, the assertion in the action is called once, satisfying
     * the assert.expects()
     */
  });
});
