# Changes

The goal of this branch is to implement usage statistics for PASS and keep user data safe.

## Matomo

Matomo was the data tracking platform of choice to implement this goal.
Matomo was chosen because it is not linked to Google's analytics platform and the
service can be hosted on one of our own servers.
This ensures that users' information and data stay within the PASS system and has no
contact with the internet or hosting companies.

### Docker

(https://hub.docker.com/_/matomo)

In order to host matomo on our own servers, a matomo docker image is used.
The command to run this docker image is:

```bash
docker run -d --link some-mysql:db matomo
```

The docker image was added to the docker-compose.yml file so that it runs with the
other containers.
It can be found in `.docker/docker-compose.yml` on lines 181-191:

```yml
matomo:
  image: matomo
  container_name: matomo
  env_file: .env
  networks:
    - front
    - back
  ports:
    - 3299:80
  volumes:
    - /pass-ember/.docker/config.ini.php:/var/www/html/config/config.ini.php
```

The container runs on port 80 (matomo specific).
The container currently uses no environment variables but they can be added to `.docker/.env`.

### Tracking code

(https://developer.matomo.org/guides/tracking-javascript-guide)

The matomo tracking code is a script added to the PASS web app in order to integrate matomo.
The matomo tracking code was added to `index.html` on lines 15-29:

```html
<!-- Matomo -->
<script>
  var _paq = (window._paq = window._paq || []);
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);
  (function () {
    var u = "//pass.local:3299/";
    _paq.push(["setTrackerUrl", u + "matomo.php"]);
    _paq.push(["setSiteId", "1"]);
    var d = document,
      g = d.createElement("script"),
      s = d.getElementsByTagName("script")[0];
    g.async = true;
    g.src = u + "matomo.js";
    s.parentNode.insertBefore(g, s);
  })();
</script>
<!-- End Matomo Code -->
```

### Mariadb

(https://hub.docker.com/_/mariadb)

A mariadb database is used in order to store the data tracked by matomo.
This database was configured as a docker container.
The docker image was added to the docker-compose.yml file so that it runs with the other
containers. It can be found in `.docker/docker-compose.yml` on lines 193-202:

```yml
db:
  image: mariadb
  container_name: mariadb
  env_file: .env
  ports:
    - 3306:3306
  networks:
    - back
  volumes:
    -  #path
```

The "path" comment can be replaced with the path of the mariadb database.
The environment variables for the mariadb container can be found in `.docker/.env` on lines
88-90:

```yml
# mariadb
MYSQL_DATABASE=matomo
MYSQL_ROOT_PASSWORD=hello
```

These environment variables are used on the matomo setup page in order to link the
database to matomo.

### Reverse Proxy

When configuring the matomo docker container and attempting to access the matomo dashboard,
we ran into a roadblock. Matomo, by default, uses `http` in order to access the login/dashboard.
Chrome did not like the fact that matomo uses `http` and wanted it to use `https`. We attempted
to fix this by using a reverse proxy in order to be able to use `https://pass.local/matomo`
instead of `http://pass.local/matomo` to access the login/dashboard. This is the reason for the
`httpd.conf` located in `.docker/`.

### Matomo Setup

The matomo setup and dashboard can be accessed by going to `http://pass.local/matomo`.
Upon first installing matomo, a setup page will be displayed.
Complete the setup by creating the matomo account used to access the dashboard and by
linking the mariadb database.

## Metrics Page

Matomo is a good service for tracking metrics in terms of actual app usage.
However, more specific metrics regarding data within PASS can not be gathered
using Matomo. Therefore, a Metrics page was created within the pass web app
itself.

The page can be found on the main navigation bar when a user logs into PASS.
It can also be found in the footer of any page in the PASS web app.

In order to create this page, three files were created:
 * `templates/metrics.hbs`
 * `routes/metrics.js`
 * `controllers/metrics.js`

Virtually any metric that involves the actual data stored in PASS can be
displayed here. There is one metric that is already implemented which is a
list of the Journals and how many Submissions have been made per Journal.
The metric is calculated in `routes/metrics.js`. I was unable to actually
calculate the metric because the actual PASS data is inaccessible from my
local copy of pass-ember. The test data does not have enough data in order
to determine whether the calculation of the metric is working correctly or 
not.