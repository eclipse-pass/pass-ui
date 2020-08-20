/* eslint-disable strict */
self.deprecationWorkflow = self.deprecationWorkflow || {};

self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-views.curly-components.jquery-element' },
    { handler: 'silence', matchId: 'meta-destruction-apis' },
    { handler: 'silence', matchId: 'computed-property.override' },
    { handler: 'silence', matchId: 'ember-metal.computed-deep-each' },
    { handler: 'silence', matchId: 'globals-resolver' }
  ]
};
