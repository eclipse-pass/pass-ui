# pass-ui

PASS is an ember application which provides a unified user interface that allow its users to deposit their manuscripts
into multiple repositories as required by applicable funding agency's public access policies

PASS communicates with a Fedora repository on the backend using JSON-LD. See the
[pass-ember-adapter](https://github.com/eclipse-pass/pass-ember-adapter) for more information.
Objects persisted to Fedora are automatically indexed by Elasticsearch. See
[pass-indexer](https://github.com/eclipse-pass/pass-indexer) for more information about how this works.
Note that the indexing process is asynchronous. An object persisted to Fedora will not immediately be available in Elasticsearch.

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) along with docker-compose.

The `hosts` (`C:\Windows\System32\Drivers\etc\hosts` for windows, `/etc/hosts` for \*nix) file on your development computer needs to be updated to alias `pass.local` to your loopback address (`127.0.0.1`) or to your docker-machine address (e.g. `192.168.99.100`). For example, to alias `pass.local` to your loopback address, you would make sure your `hosts` file contains the line: `127.0.0.1 pass.local`

## Installation

- `git clone <repository-url>` this repository
- `cd pass-ui`

## Running / Development

A docker environement which relies on a Shibboleth proxy is in .docker/. All services should
be available at https://pass.local/.

- In .docker/ run `docker-compose pull`
  - To start PASS with JHU assets, run `docker-compose up -d`.
  - To run the Harvard development stack, do `docker-compose -f harvard.yml up -d`
  - To start PASS with only a few test assets, run `docker-compose -f docker-compose.yml -f docker-compose.public.yml up -d`
- Wait for the containers to finish coming up, this could take 5-10 minutes. There will be a long pause while the `ember` container builds. When you see the "Build successful" message from `ember` and a small table listing the "Slowest Nodes" that indicates the application is ready to use. It will look similar to:

```
ember            | Slowest Nodes (totalTime => 5% )              | Total (avg)
ember            | ----------------------------------------------+---------------------
ember            | Babel: pass-ui (4)                         | 15209ms (3802 ms)
ember            | broccoli-persistent-filter:EslintValid... (3) | 6654ms (2218 ms)
ember            | Babel: ember-lodash (1)                       | 5960ms
ember            | Babel: ember-data (2)                         | 5386ms (2693 ms)
```

- The local code runs in the `ember` container, and changes in the local code will be reflected there.
  - The app directory is bind mounted into the container.
- Visit your app at https://pass.local/. You will have to login as a test user.
- Run your tests at https://pass.local/app/tests
- Fedora repository is at https://pass.local/fcrepo/
- Elasticsearch index search endpoint is at https://pass.local/es/
- In order to remove persisted data, stop all the containers and `docker volume prune`
- Your web browser may complain about unsigned certificates, but the complaints can be ignored.

### Test users

See [https://github.com/eclipse-pass/pass-docker/blob/master/README.md#shibboleth-users] for a list of test users. Each has a password of `moo`.

### Configuration

The configuration for the docker environment occurs in .env. See documentation on the individual
components for configuration options.

The pass-ui application configures the Fedora adapter uses these environment variables.
There are also defaults specified in config/environment.js. They tell the adapter where Fedora
and Elasticsearch are and generally will not need to be modified during development.

In order to prevent an Authorization header being sent to Fedora and Elasticsearch,
set FEDORA_ADAPTER_USER and FEDORA_ADAPTER_PASSWORD to empty strings.

The application also gets "branding" configuration from a `config.json` file, with a default implementation found in the `public/` directory, which is automatically made available by default at `/app/config.json`.

`config.json`

```js
{
  "branding": {
    "homepage": "https://example.com",
    "logo": "/app/fullSizeLogo.png", // Default asset found in public/ dir
    "favicon": "/app/favicon.png", // Default asset found in public/ dir
    "stylesheet": "/app/branding.css", // Default asset found in public/ dir
    "pages": {
      "contactUrl": "", // If you provide a branded page with contact info
      "aboutUrl": "", // If you provide a branded About page for PASS
      "faqUrl": "", // If you provide a branded FAQ page
    },
    "error": {
      "icon": "", // Error icon to display on the application's error page
    }
  }
}
```

### Environment Variables

| Name | Description | Default value |
| --- | --- | --- |
| EMBER_APP_ROOT | URL path of the application | `/app/` |
| EMBER_HOST | URL host of the application | `http://localhost:8080` |
| PASS_API_URL | URL host (plus port) of backend API | `http://localhost:8080` |
| PASS_API_NAMESPACE | URL path prefix for backend API | `api/v1` |
| STATIC_CONFIG_URL | URL to find the UI's branding configuration (config.json). There is a default config bundled with the application, which can be loaded at this variable's default value | `/app/config.json` |
| USER_SERVICE_URL | URL of the pass user service | `/pass-user-service/whoami` |
| SCHEMA_SERVICE_URL | URL of the pass metadata schema service | `/schemaservice` |
| DOI_SERVICE_URL | URL of the pass DOI service | `/doiservice/journal` |
| DOI_METADATA_SCHEMA_URI | URL of the DOI metadata schema | `https://eclipse-pass.github.io/metadata-schemas/jhu/global.json` |
| POLICY_SERVICE_URL | URL of the pass policy service (no longer supported) | `/policyservice` |
| POLICY_SERVICE_POLICY_ENDPOINT | URL of the pass policy service policies function | `/policyservice/policies` |
| POLICY_SERVICE_REPOSITORY_ENDPOINT | URL of the pass policy service repositories function | `/policyservice/repositories` |
| MANUSCRIPT_SERVICE_LOOKUP_URL | URL of the pass 'download' service's lookup function. This will lookup available open access manuscripts for a given DOI | `/downloadservice/lookup` |
| MANUSCRIPT_SERVICE_DOWNLOAD_URL | URL of the pass 'download' service's download function. Currently unused? | `/downloadservice/download` |


### Using ember in the container.

Login to the ember container with `docker exec -it ember /bin/sh`.
Then run ember with `./node_modules/ember-cli/bin/ember`.
This can be useful for adding and updating dependencies.
You can run also run tests, but you may have to install other dependencies such as google-chrome.

### Running ember locally

If you wish, you may install ember locally. The application will not be able to run due to the need to access various web services,
but running tests on the command line can be useful. See documentation at [ember.js](https://emberjs.com/).

### Linting

This project uses `es-lint`, `ember-template-lint` and `prettier` to enforce style decisions and code formatting. You may consider installing [an integration tool](https://prettier.io/docs/en/editors.html) for your editor of choice.

This project uses (husky)[https://github.com/typicode/husky] to run a command from (lint-staged)[https://github.com/okonet/lint-staged] to run `es-lint --fix` and `prettier --write` over the staged files in a pre-commit hook. If you are unable to make a commit it might be because either one or both of these commands has failed. Check the output in the terminal for what failures have occurred.
