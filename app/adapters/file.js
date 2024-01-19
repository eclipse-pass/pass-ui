import ApplicationAdapter from './application';

export default class FileAdapter extends ApplicationAdapter {
  deleteRecord(store, type, snapshot) {
    console.warn('File deletion cannot be rolled back');
    // Can't use this.buildURL, as that will append the ember-data File path, which we don't want
    const url = `/${this.namespace}${snapshot.attr('uri')}`;
    return fetch(url, {
      method: 'DELETE',
    }).then(() => super.deleteRecord(store, type, snapshot));
  }
}
