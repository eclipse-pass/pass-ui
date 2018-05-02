import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('carousel-gallery', 'Integration | Component | carousel gallery', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{carousel-gallery}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#carousel-gallery}}
      template block text
    {{/carousel-gallery}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
