# pass-ember
[![Build Status](https://travis-ci.org/OA-PASS/pass-ember.png?branch=master)](https://travis-ci.org/OA-PASS/pass-ember)

PASS is an ember application which provides a unified user interface that allow its users to deposit their manuscripts
into multiple repositories as required by applicable funding agency's public access policies

PASS communicates with a Fedora repository on the backend using JSON-LD. See the
[ember-fedora-adapter](https://github.com/OA-PASS/ember-fedora-adapter) for more information.
Objects persisted to Fedora are automatically indexed by Elasticsearch. See
[pass-indexer](https://github.com/OA-PASS/pass-indexer) for more information about how this works.
Note that the indexing process is asynchronous. An object persisted to Fedora will not immediately be available in Elasticsearch.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd pass-ember`
* `npm install`

## Running / Development

* `docker-compose up`
  * Fedora repository at http://localhost:8080/fcrepo/ (admin:moo)
  * Elasticsearch index at http://localhost:9200/pass/
  * Wait for indexer container to create the index.
  * In order to remove persisted data, stop all the containers and `docker system prune -f`
* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Configuration

The configuration for the docker environment occurs in .env. See documentation on the individual
components for configuration options.

The pass-ember application configures the Fedora adapter uses these environment variables.
There are also defaults specified in config/environment.js. They tell the adapter where Fedora
and Elasticsearch are and generally will not need to be modified during development.

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
