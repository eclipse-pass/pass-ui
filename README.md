# pass-ember
[![Build Status](https://travis-ci.org/OA-PASS/pass-ember.png?branch=master)](https://travis-ci.org/OA-PASS/pass-ember)

PASS is an ember application which provides a unified user interface that allow its users to deposit their manuscripts
into multiple repositories as required by applicable funding agency's public access policies

PASS communicates with a Fedora repository on the backend using JSON-LD. See the
[ember-fedora-adapter](https://github.com/OA-PASS/ember-fedora-adapter) for more information.

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

* `docker-compose up` to start a fedora repository at http://localhost:8080/fcrepo
* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Configuration

* FEDORA_ADAPTER_BASE: Location of Fedora
* FEDORA_ADAPTER_CONTEXT: URI to use as JSON-LD context.

Fedora must be configured to allow CORS including Accept, and Prefer headers.
Containers for each type in the context must exist as per the
[ember-fedora-adapter requirements](https://github.com/OA-PASS/ember-fedora-adapter).

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
