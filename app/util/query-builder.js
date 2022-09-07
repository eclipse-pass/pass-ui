export default class QueryBuilder {
  /**
   * [
   *   { attr: 'attribute1', val: 'value1', op: '==' },
   *   { attr: 'attribute2", val: 'value2', op: '!=' }
   * ]
   *
   * Would stringify to:
   *  'filter[modelType]=attribute1==value1;attribute2!=value2'
   *
   * Note: it is probable that there would never be a 'model2' specified in the same query
   * as shown here
   */
  queryParts;

  type;

  /** Equality, matches within lists */
  EQ = '==';
  /** Inequality, matches within lists */
  NOT_EQ = '=out=';

  constructor(type) {
    this.type = type;
    this.clear();
  }

  /**
   * @returns Stringified filter
   */
  stringify() {
    return this.queryParts.map((q) => `${q.attr}${q.op}${q.val}`).join(';');
  }

  build() {
    return {
      filter: {
        [this.type]: this.stringify(),
      },
    };
  }

  clear() {
    this.queryParts = [];
    return this;
  }

  add(attr, val, op) {
    this.queryParts.push({ attr, val, op });
  }

  eq(attr, val) {
    this.add(attr, val, this.EQ);
    return this;
  }

  noEq(attr, val) {
    this.add(attr, val, this.NOT_EQ);
    return this;
  }
}
