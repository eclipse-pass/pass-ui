import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import RSVP from 'rsvp';

module('Unit | Service | autocomplete', (hooks) => {
  setupTest(hooks);

  test('it exists and posts', function (assert) {
    const fakeAjax = {
      post(url, data, headers) {
        assert.ok(url, 'POST should have URL');
        assert.ok(data, 'POST should have request data');

        const query = data.data.suggest;
        assert.ok(query, 'Request data should have a \'suggest\' object');
        assert.ok(query.projectName);
        assert.equal(query.projectName.prefix, 'aa');
        assert.equal(query.projectName.completion.field, 'projectName_suggest');

        return RSVP.resolve({
          took: 42,
          timed_out: false,
          _shards: { total: 5, successful: 5, skipped: 0, failed: 0 }, // eslint-disable-line
          hits: { total: 0, max_score: 0.0, hits: [] },
          suggest: {
            projectName: [{ text: 'aa', offset: 0, length: 2, options: [] }] // eslint-disable-line
          }
        });
      }
    };

    const service = this.owner.factoryFor('service:autocomplete').create({
      ajax: fakeAjax
    });

    assert.ok(service);
    assert.ok(service.suggest('projectName', 'aa'));
  });

  test('fieldName as array creates two part suggest query', function (assert) {
    const fakeAjax = {
      post(url, data, headers) {
        assert.ok(url, 'POST should have URL');
        assert.ok(data, 'POST should have request data');

        const query = data.data.suggest;
        assert.ok(query, 'Request data should have a \'suggest\' object');
        assert.ok(query.projectName);
        assert.equal(query.projectName.prefix, 'aa');
        assert.equal(query.projectName.completion.field, 'projectName_suggest');
        assert.ok(query.awardNumber);
        assert.equal(query.awardNumber.prefix, 'aa');
        assert.equal(query.awardNumber.completion.field, 'awardNumber_suggest');


        return RSVP.resolve({
          took: 42,
          timed_out: false,
          _shards: { total: 5, successful: 5, skipped: 0, failed: 0 }, // eslint-disable-line
          hits: { total: 0, max_score: 0.0, hits: [] },
          suggest: {
            projectName: [{ text: 'aa', offset: 0, length: 2, options: [] }], // eslint-disable-line
            awardNumber: [{ text: 'aa', offset: 0, length: 2, options: [] }] // eslint-disable-line
          }
        });
      }
    };

    const service = this.owner.factoryFor('service:autocomplete').create({
      ajax: fakeAjax
    });

    assert.ok(service);
    assert.ok(service.suggest(['projectName', 'awardNumber'], 'aa'));
  });

  test('with PI restriction creates query with a context', function (assert) {
    const fakeAjax = {
      post(url, data, headers) {
        assert.ok(url, 'POST should have URL');
        assert.ok(data, 'POST should have request data');

        const query = data.data.suggest;
        assert.ok(query.journalName.completion.context);
        assert.equal(query.journalName.completion.context.pi, 'moo');


        return RSVP.resolve({
          took: 42,
          timed_out: false,
          _shards: { total: 5, successful: 5, skipped: 0, failed: 0 }, // eslint-disable-line
          hits: { total: 0, max_score: 0.0, hits: [] },
          suggest: {
            journalName: [{ text: 'aa', offset: 0, length: 2, options: [] }] // eslint-disable-line
          }
        });
      }
    };

    const service = this.owner.factoryFor('service:autocomplete').create({
      ajax: fakeAjax
    });

    assert.ok(service);
    assert.ok(service.suggest('journalName', 'aa', { pi: 'moo' }));
  });
});
