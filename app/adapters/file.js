import ApplicationAdapter from './application';

export default class FileAdapter extends ApplicationAdapter {
  deleteRecord(store, type, snapshot) {
    console.warn('File deletion cannot be rolled back');
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
