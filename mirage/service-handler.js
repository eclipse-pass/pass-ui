import ENV from '../config/environment';

function dataPath() {
  let path = ENV.passApi.PASS_API_NAMESPACE || 'data';
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return path;
}

export default class MockDataFinder {
  environment;

  constructor(environment) {
    this.environment = environment;
  }

  async findBy(schema, type, filter) {
    if (this.environment !== 'test') {
      const key = Object.keys(filter)[0];
      const filterStr = `filter[${type}]=${key}=ini="${filter[key]}"`;

      const url = `${dataPath()}/${type}?${filterStr}`;
      console.log(`Data passthrough : ${url}`);

      const resp = await fetch(url);

      if (!resp.ok) {
        throw new Error(`Error '${url}' : ${resp.statusText}`);
      }

      const data = await resp.json();
      return data.data[0];
    }

    return schema.findBy(type, filter);
  }
}
