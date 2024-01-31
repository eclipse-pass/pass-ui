import ApplicationAdapter from './application';

export default class FileAdapter extends ApplicationAdapter {
  /**
   * ### This can't be rolled back ###
   * Overrides an Ember Model's base destroyRecord function.
   *
   * First call our File Service to delete file bytes, then
   * destroy the metadata record using the standard a
   * `destroyRecord` call. If the call to the File Service fails
   * an error will be throw and default destroyRecord will
   * not be called
   *
   * Will throw errors back to caller if any of the network
   * requests fail, same as default behavior.
   */
  deleteRecord(store, type, snapshot) {
    // Can't use this.buildURL, as that will append the ember-data File path, which we don't want
    let url = snapshot.attr('uri');
    if (!url.startsWith('/')) {
      url = `/${url}`;
    }
    return fetch(url, {
      method: 'DELETE',
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Delete request to the file service failed');
      }
      return super.deleteRecord(store, type, snapshot);
    });
  }
}
