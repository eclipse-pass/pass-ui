import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import QueryBuilder from '../../../app/util/query-builder';

module('Unit | Util | query builder', (hooks) => {
  setupTest(hooks);

  test('Single part filter', (assert) => {
    const expected = {
      filter: {
        submission: 'submitter.id==3',
      },
    };

    const result = new QueryBuilder().eq('submission', 'submitter.id', '3').build();

    assert.equal(result, expected);
  });

  test('Single not equals', (assert) => {
    const expected = {
      filter: {
        submission: 'submitter.id=out=3',
      },
    };

    const result = new QueryBuilder().notEq('submission', 'submitter.id', '3').build();

    assert.equal(result, expected);
  });

  test('Two part filter', (assert) => {
    const expected = {
      filter: {
        submission: 'submitter.id==3;submissionStatus=out=CANCELLED',
      },
    };

    const result = new QueryBuilder()
      .eq('submission', 'submitter.id', '3')
      .notEq('submission', 'submissionStatus', 'CANCELLED')
      .build();

    assert.equal(result, expected);
  });
});
