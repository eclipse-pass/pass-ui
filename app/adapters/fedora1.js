import DS from 'ember-data';
import RSVP from 'rsvp';

// Hookup to Fedora 4. Cobbled together from REST adapter.
// Persists Ember Data objects as JSON Fedora binaries with REST serializer.

export default DS.RESTAdapter.extend({
  /**
    Called by the store when a newly created record is
    saved via the `save` method on a model record instance.
    The `createRecord` method serializes the record and makes an Ajax (HTTP POST) request
    to a URL computed by `buildURL`.
    See `serialize` for information on how to customize the serialized form
    of a record.

    The returned Promise should on success resolve to JSON with an id.

    @method createRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  createRecord(store, type, snapshot) {
      let data = {};
      let serializer = store.serializerFor(type.modelName);
      let url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

      serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

      return this.ajax(url, "POST", {
        data: data,
        dataFilter: function(resp) {
          // Fedora returned assigned URI as plain text.
          // Add id to data and return as JSON as required by serializer.

          data[type.modelName].id = resp.trim();
          return JSON.stringify(data);
        }
      });
  },

  /**
    Called by the store when an existing record is saved
    via the `save` method on a model record instance.

    The `updateRecord` method serializes the record and makes an Ajax (HTTP PUT) request
    to a URL computed by `buildURL`.

    See `serialize` for information on how to customize the serialized form
    of a record.

    @method updateRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  updateRecord(store, type, snapshot) {
      let data = {};
      let serializer = store.serializerFor(type.modelName);

      serializer.serializeIntoHash(data, type, snapshot);

      let url = snapshot.id;

      return this.ajax(url, "PUT", { data: data });
  },

  /**
    Called by the store in order to fetch the JSON for a given
    type and ID.

    The `findRecord` method makes an Ajax request to a URL computed by
    `buildURL`, and returns a promise for the resulting payload.

    This method performs an HTTP `GET` request with the id provided as part of the query string.

    @since 1.13.0
    @method findRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} id
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  /* eslint no-unused-vars: 0 */
  findRecord(store, type, id, snapshot) {
    return this.getFedoraObject(type, id);
  },

  /**
    Called by the store in order to fetch a JSON array for all
    of the records for a given type.

    The `findAll` method makes an Ajax (HTTP GET) request to a URL computed by `buildURL`, and returns a
    promise for the resulting payload.

    @method findAll
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} sinceToken
    @param {DS.SnapshotRecordArray} snapshotRecordArray
    @return {Promise} promise
  */
  findAll(store, type, sinceToken, snapshotRecordArray) {
    let query = this.buildQuery(snapshotRecordArray);

    let url = this.buildURL(type.modelName, null, snapshotRecordArray, 'findAll');

    if (sinceToken) {
      query.since = sinceToken;
    }

    return this.getFedoraObjectChildren(type, url, query);
  },

  /**
    Called by the store in order to fetch a JSON array for
    the records that match a particular query.

    The `query` method makes an Ajax (HTTP GET) request to a URL
    computed by `buildURL`, and returns a promise for the resulting
    payload.

    The `query` argument is a simple JavaScript object that will be passed directly
    to the server as parameters.

    @method query
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Object} query
    @return {Promise} promise
  */
  query(store, type, query) {
    let url = this.buildURL(type.modelName, null, null, 'query', query);

    if (this.sortQueryParams) {
       query = this.sortQueryParams(query);
    }

    return this.getFedoraObjectChildren(type, url, query);
  },

  // Return JSON stored in Fedora at url for an object
  getFedoraObject(type, url) {
    return this.ajax(url, 'GET', {
    }).then(result => {
        result[type.modelName].id = url;

        return result;
    });
  },

  // Return array of JSON stored for objects of a given type in a given container
  getFedoraObjectChildren(type, url, query) {
    return this.ajax(url, 'GET', {
      data: query,
      headers: {
        'Accept': 'application/ld+json'
      }
    }).then(response => {
      // Response is array with first element holding container representation
      let container = response[0];

      let kids = container['http://www.w3.org/ns/ldp#contains'];

      if (!kids) {
        return new RSVP.Promise(resolve => {
          let result = {};
          result[type.modelName] = [];

          resolve(result);
        });
      }

      // Return a promise that waits for each child to be retrieved
      // and put in the result.

      return RSVP.all(kids.map(k => this.getFedoraObject(type, k['@id']))).then(objects => {
        let result = {};

        // Unwrap fedora object JSON representation.
        objects = objects.map(o => o[type.modelName]);

        if (query) {
          // Filter out objects not matching the query

          objects = objects.filter(o => {
            let result = true;

            for (let [key, value] of Object.entries(query)) {
              if (o[key] != value) {
                result = false;
                break;
              }
            }

            return result;
          });
        }

        result[type.modelName] = objects;

        return result;
      });
    });
  },

  // Adapted from BuildURLMixin _buildURL
  buildFedoraURI(modelName, id) {
    if (id) {
      return id;
    }

    let path;
    let url = [];
    let prefix = this.urlPrefix();

    if (modelName) {
      path = this.pathForType(modelName);

      if (path) {
        url.push(path);
      }
    }

    if (prefix) {
      url.unshift(prefix);
    }

    url = url.join('/');
    if (!this.host && url && url.charAt(0) !== '/') {
      url = '/' + url;
    }

    return url;
  },


  // TODO buildURL not really needed, a lot of awkwardness here due to
  // Fedora URIs

  /**
    Builds a URL for a given type and optional ID.

    By default, it pluralizes the type's name (for example, 'post'
    becomes 'posts' and 'person' becomes 'people'). To override the
    pluralization see [pathForType](#method_pathForType).

    If an ID is specified, it adds the ID to the path generated
    for the type, separated by a `/`.

    When called by RESTAdapter.findMany() the `id` and `snapshot` parameters
    will be arrays of ids and snapshots.

    @method buildURL
    @param {String} modelName
    @param {(String|Array|Object)} id single id or array of ids or query
    @param {(DS.Snapshot|Array)} snapshot single snapshot or array of snapshots
    @param {String} requestType
    @param {Object} query object of query parameters to send for query requests.
    @return {String} url
  */
  buildURL(modelName, id, snapshot, requestType, query) {
    switch (requestType) {
      case 'findRecord':
      case 'findAll':
      case 'query':
      case 'queryRecord':
      case 'findMany':
      case 'findHasMany':
      case 'findBelongsTo':
      case 'createRecord':
      case 'updateRecord':
      case 'deleteRecord':
      default:
        return this.buildFedoraURI(modelName, id);
    }
  },
});
