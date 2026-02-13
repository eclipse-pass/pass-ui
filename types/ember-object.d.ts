import '@ember/object';

declare module '@ember/object' {
  // Adding an index signature makes EmberObject.create() accept arbitrary
  // properties, because the generic constraint on create checks `keyof Instance`.
  export default interface EmberObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}
