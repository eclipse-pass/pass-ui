export default class QueryBuilder {
  /**
   * Object containing maps
   * {
   *    modelType: [
   *     { attr: 'attribute1', val: 'value1', op: '==' },
   *     { attr: 'attribute2", val: 'value2', op: '!=' }
   *   ],
   *   model2: [
   *     { attr: 'a3', val: 'v3', op: '==' }
   *   ]
   * }
   *
   * Would stringify to:
   *  'filter[modelType]=attribute1==value1;attribute2!=value2&filter[model2]=a3==v3'
   *
   * Note: it is probable that there would never be a 'model2' specified in the same query
   * as shown here
   */
  queryParts;

  EQ = '==';
  NOT_EQ = '=out=';

  constructor() {
    this.queryParts = {};
  }

  _maybeAddType(type) {
    if (!this.queryParts[type]) {
      this.queryParts[type] = [];
    }
  }

  _stringifyType(type) {
    return this.queryParts[type].map((q) => `${q.attr}${q.op}${q.val}`).join(';');
  }

  /**
   * @returns Stringified filter
   */
  stringify() {
    return Object.keys(this.queryParts)
      .map((key) => {
        return `filter[${key}]=` + this._stringifyType(key);
      })
      .join('&');
  }

  build() {
    const filter = {};
    Object.keys(this.queryParts).forEach((key) => (filter[key] = this._stringifyType(key)));
    return { filter };
  }

  clear() {
    this.queryParts = {};
    return this;
  }

  add(type, attr, val, op) {
    this._maybeAddType(type);
    this.queryParts[type].push({ attr, val, op });
  }

  /**
   * @param {string} type
   * @param {string} attr
   * @param {any} val
   */
  eq(type, attr, val) {
    this.add(type, attr, val, this.EQ);
    return this;
  }

  noEq(type, attr, val) {
    this.add(type, attr, val, this.NOT_EQ);
    return this;
  }
}
