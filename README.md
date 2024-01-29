# pass-ui

PASS is an ember application which provides a unified user interface that allow its users to deposit their manuscripts
into multiple repositories as required by applicable funding agency's public access policies

PASS communicates with an [Elide-based API](https://github.com/yahoo/elide), [pass-core](https://github.com/eclipse-pass/pass-core), on the backend that serves json in conformance with the [JSON:API spec](https://jsonapi.org/).

## Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) along with docker-compose.

The `hosts` (`C:\Windows\System32\Drivers\etc\hosts` for windows, `/etc/hosts` for \*nix) file on your development computer needs to be updated to alias `pass.local` to your loopback address (`127.0.0.1`) or to your docker-machine address (e.g. `192.168.99.100`). For example, to alias `pass.local` to your loopback address, you would make sure your `hosts` file contains the line: `127.0.0.1 pass.local`

## Installation

- `git clone <repository-url>` this repository
- `cd pass-ui`

## Running / Development

The default environment for running `pass-ui` locally is via use of [pass-docker](https://github.com/eclipse-pass/pass-docker).

`pass-docker` can be run with `pass-ui` running inside of the docker network in its own service and docker container with these [instructions](https://github.com/eclipse-pass/pass-docker?tab=readme-ov-file#running).

This environment is not as conducive for active development of `pass-ui` so, depending on your host machine's operating system you might be able to run `pass-ui` on your host machine outside of the docker network and use these [instructions](https://github.com/eclipse-pass/main/blob/main/docs/dev/running-pass-ui-on-your-host-machine.md) to forward traffic from the docker network to your host machine.

### Building for the docker environment

We have GitHub automations in place to produce production builds at during a release. If you want to development build for local testing, you can use the `build.sh` script, specifying a `.env` file:

```sh
./build.sh ../pass-docker/.env
```

This script will remove any existing files in `dist/`, do an Ember dev build, and create a new pass-ui Docker image with the `:latest` tag

### Test users

Refer to the LDAP service in `pass-docker` for [a list](https://github.com/eclipse-pass/pass-docker/blob/main/ldap/jhu/users.ldif) of test users. Each has a password of `moo`.

### Configuration

The configuration for the docker environment occurs in the `pass-docker` [.env](https://github.com/eclipse-pass/pass-docker/blob/main/.env). A list of environment variables related to `pass-ui`, and other services, can be found there or in other [override .env files](https://github.com/eclipse-pass/pass-docker/blob/main/.eclipse-pass.local_env).

The application also gets "branding" configuration from a `config.json` file, with a default implementation found in the `public/` directory, which is automatically made available by default at `/app/config.json`.

`config.json`

```js
{
  "branding": {
    "homepage": "https://www.eclipse.org/org/foundation/",
    "logo": "ef/eclipse_foundation_logo_wo/EF_WHT-OR_png.png",
    "favicon": "favicon.ico",
    "stylesheet": "/app/branding.css",
    "overrides": "/app/branding-overrides.css",
    "pages": {
      "showPagesNavBar": false
    },
    "error": {
      "icon": "/app/error-icon.png"
    }
  }
}
```

The base theme styles can be found in `branding.css`. There are default fallback styles which can be overridden to customize the appearance of the UI. It is recommended to override these styles through a `branding-overrides.css` file. An example of these overrides to the base styles can be found [here](https://github.com/eclipse-pass/pass-ui/blob/main/public/branding-overrides.css).

### Testing

To run the Ember.js unit/integration/acceptance tests in this repository you can run one of the scripts in the [package.json](https://github.com/eclipse-pass/pass-ui/blob/main/package.json) or simply run the Ember development server via `ember s` and visit `http://pass.local/app/tests`.

### Linting

This project uses `es-lint`, `ember-template-lint` and `prettier` to enforce style decisions and code formatting. You may consider installing [an integration tool](https://prettier.io/docs/en/editors.html) for your editor of choice.

This project uses (husky)[https://github.com/typicode/husky] to run a command from (lint-staged)[https://github.com/okonet/lint-staged] to run `es-lint --fix` and `prettier --write` over the staged files in a pre-commit hook. If you are unable to make a commit it might be because either one or both of these commands has failed. Check the output in the terminal for what failures have occurred.

There are also scripts defined in the [package.json](https://github.com/eclipse-pass/pass-ui/blob/main/package.json) you can run to manually lint check the project.

### CI

Both tests and linting will be run by the [ci.yml workflow](https://github.com/eclipse-pass/pass-ui/blob/main/.github/workflows/ci.yml) in Github on opening of pull requests and pushes to the `main` branch.

## Further Reading / Useful Links

- [ember.js](https://emberjs.com/)
- [ember-cli](https://cli.emberjs.com/release/)
- Development Browser Extensions
  - [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  - [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
