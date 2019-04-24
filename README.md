# Policy Service Moo Test Notes

### Prerequisites

Some changes were made externally to enable this setup to work. Both `sp` and `proxy` Docker images were modified and built from `pass-docker`

`pass-docker/httpd-proxy/etc-httpd/conf.d/httpd.conf`

```
ProxyPass /policyservice http://sp/policyservice
ProxyPassReverse /policyservice http://sp/policyservice
```

`/home/john/workspace/dc/pass-docker/sp/2.6.1/etc-httpd/conf.d/sp.conf`

```
ProxyPassReverse /policyservice http://policyservice:8088
ProxyPass /policyservice http://policyservice:8088
```

Both `proxy` and `sp` were re-tagged locally.

`pass-docker/docker-compose.yml`

```
  proxy:
    build: ./httpd-proxy/
    image: oapass/httpd-proxy:moo
    container_name: proxy
    networks:
     - front
     - back
    ports:
     - "80:80"
     - "443:443"

  sp:
    build: ./sp/2.6.1
    image: oapass/sp:moo
    container_name: sp
    networks:
     - back
    secrets:
     - source: sp_key
```

Finally, these two containers were rebuilt using `docker-compose build` to be made available locally to the `pass-ember` Docker setup.

After the above changes were made, I simply navigated to `pass-ember/.docker/shib` and ran `docker-compose up` as normal and waited for things to settle. Everything will be ready to test when you see a table in the logs that looks similar to:

```
ember            | Build successful (1350ms) – Serving on http://localhost:81/app/
ember            |
ember            |
ember            |
ember            | Slowest Nodes (totalTime => 5% )              | Total (avg)
ember            | ----------------------------------------------+---------------------
ember            | Package /assets/vendor.js (1)                 | 165ms
ember            | Pod Templates (1)                             | 127ms
ember            | Packaged Application Javascript (1)           | 124ms
ember            | BroccoliMergeTrees (19)                       | 96ms (5 ms)
ember            | SassCompiler (1)                              | 84ms
ember            | broccoli-persistent-filter:EslintValid... (3) | 76ms (25 ms)
ember            |

```

### Manual testing

Click on the `Start new submission` button to launch the new submission workflow. Enter whatever info you want and click Next. In the Grants step, select one or more grants, then click Next. The policy service is invoked after the Grants route is done, but before the application transitions to the Policies step (in the policies route `model()` hook). Basically as soon as you click the Next button from the Grants step, the service should be invoked. It is at this point where I get the error.

--------------------------------------------------------------

# pass-ember
[![Build Status](https://travis-ci.org/OA-PASS/pass-ember.png?branch=master)](https://travis-ci.org/OA-PASS/pass-ember)
[![Coverage Status](https://coveralls.io/repos/github/OA-PASS/pass-ember/badge.svg)](https://coveralls.io/github/OA-PASS/pass-ember)

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

A docker environement which relies on a Shibboleth proxy is in .docker/shib. All services should
be available at https://pass.local/.

* In .docker/shib/ run `docker-compose up`
* Wait for the containers to finish coming up, this could take 5-10 minutes. There will be a long pause while the `ember` container builds. When you see the "Build successful" message from `ember` and a small table listing the "Slowest Nodes" that indicates the application is ready to use
* The local code runs in the `ember` container, and changes in the local code will be reflected there.
* Visit your app at https://pass.local/app
* Visit your tests at https://pass.local/app/tests
* Fedora repository is at https://pass.local/fcrepo/
* Elasticsearch index search endpoint is at https://pass.local/es/
* In order to remove persisted data, stop all the containers and `docker system prune -f`

Note that ember test will not be able to run tests which make requests to services behind
the Shibboleth proxy. The ember test client would have to go through the process of getting credentials first.

### Configuration

The configuration for the docker environment occurs in .env. See documentation on the individual
components for configuration options.

The pass-ember application configures the Fedora adapter uses these environment variables.
There are also defaults specified in config/environment.js. They tell the adapter where Fedora
and Elasticsearch are and generally will not need to be modified during development.

In order to prevent an Authorization header being sent to Fedora and Elasticsearch,
set FEDORA_ADAPTER_USER and FEDORA_ADAPTER_PASSWORD to empty strings.

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
